import os
import json
from datetime import datetime, timezone
from typing import Any, Dict
from dotenv import load_dotenv
import requests
from cachetools import TTLCache
from translations.en import EN
from utils.telegram import send_message_with_photo_to_telegram

load_dotenv('./.env.production')

TARGET_MINT = "BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX"
KNOWN_POOLS = [
  "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C",
  "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB",
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK",
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
]
COINGECKO_IDS = {
  "So11111111111111111111111111111111111111112": "solana",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "usd-coin",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "tether",
}
STABLECOIN_MINTS = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", # USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", # USDT
}
price_cache = TTLCache(maxsize=1000, ttl=45)

def is_valid_swap(transac: Dict[str, Any]):
  accept_type = ["UNKNOWN", "TOKEN_MINT"]
  valid = False
  transac = json.load(transac)

  if transac['transactionError'] is not None:
    print(f"TX {transac['signature']} has a transaction error: {transac['transactionError']}")
    return valid
  if len(transac['tokenTransfers']) == 0:
    print(f"TX {transac['signature']} is not a swap.")
    return valid
  if transac['type'] not in accept_type:
    print(f"TX {transac['signature']} has not a valid TYPE.")
    return valid
  valid = True
  return valid

def is_real_buy(transac: Dict[str, Any]):
  for transfer in transac.get("tokenTransfers", []):
    if transfer.get("mint") == TARGET_MINT and transfer.get("toUserAccount") and transfer.get("tokenAmount", 0) > 0:
      buyer = transfer["toUserAccount"]
      amount = transfer["tokenAmount"]

      # Buyer paid with SOL
      paid_sol = any(
        nt["fromUserAccount"] == buyer and nt.get("amount", 0) > 0
        for nt in transac.get("nativeTransfers", [])
      )

      # Buyer paid with another token
      paid_token = any(
        t["fromUserAccount"] == buyer and
        t.get("mint") != TARGET_MINT and
        t.get("tokenStandard") in ["Fungible", "FungibleAsset"]
        for t in transac.get("tokenTransfers", [])
      )

      # Tokens came from a known pool
      from_pool = transfer.get("fromUserAccount") in KNOWN_POOLS

      if paid_sol or paid_token or from_pool:
        return {"buyer": buyer, "amount": amount}
  return None

def get_coingecko_price(mint: str, timestamp: int):
  cg_id = COINGECKO_IDS.get(mint)
  cache_key = f"{cg_id}_{timestamp // 60}" if cg_id else mint
  if cache_key in price_cache:
    return price_cache[cache_key]

  if cg_id:
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={cg_id}&vs_currencies=usd"
  else:
    url = f"https://api.coingecko.com/api/v3/simple/price?id=solana&vs_currencies=usd&contract_addresses={mint}"

  try:
    res = requests.get(url, timeout=8, headers={"x-cg-demo-api-key": os.getenv("CG_API_KEY")})
    if res.status_code == 200:
      data = res.json()

      if cg_id:
        print(f'Ask for {mint}: {cg_id}')
        price = data.get(cg_id, {}).get("usd", 0.0)
      else:
        print(f'{mint} UNKNWON ID NEED TO ADD IN "COINGECKO_IDS"')
        price = data.get(mint, {}).get("usd", 0.0)

      price_cache[cache_key] = price
      return float(price)
  except:
    pass
  return 0.0

def calculate_cost_usd(transac: Dict[str, Any], buyer: str):
  total_usd = 0.0
  timestamp = transac.get("timestamp", int(datetime.now(timezone.utc).timestamp()))
  mint = "So11111111111111111111111111111111111111112"

  # SOL spent by the buyer
  sol_lamports = sum(
    nt.get("amount", 0)
    for nt in transac.get("nativeTransfers", [])
    if nt.get("fromUserAccount") == buyer
  )
  total_usd += (sol_lamports / 1e9) * get_coingecko_price(mint, timestamp)

  # Other token inputs
  for t in transac.get("tokenTransfers", []):
    if (t.get("fromUserAccount") == buyer and t.get("mint") != TARGET_MINT and t.get("tokenAmount", 0) > 0):
      mint = t["mint"]
      amount_in = t["tokenAmount"]

      if mint in STABLECOIN_MINTS:
        total_usd += amount_in
      else:
        price = get_coingecko_price(mint, timestamp)
        total_usd += amount_in * price

  # Transaction fees (base fee + Jito/Jupiter tips)
  base_fee = transac.get("fee", 0)
  tips = sum(
    nt.get("amount", 0)
    for nt in transac.get("nativeTransfers", [])
    if nt.get("fromUserAccount") == buyer
    and nt.get("toUserAccount") in {
      "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmq9vxk", # Jito
      "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" # Jupiter
    }
  )
  mint = "So11111111111111111111111111111111111111112"
  fees_usd = ((base_fee + tips) / 1e9) * get_coingecko_price(mint, timestamp)

  return total_usd + fees_usd

def borgy_webhook(transac: dict):
  if not is_valid_swap(transac):
    return None

  buy = is_real_buy(transac)
  if not buy:
    return None

  total_cost_usd = calculate_cost_usd(transac, buy["buyer"])

  price_per_token_usd = total_cost_usd / buy["amount"]

  infos_for_telegram = {
    'bot_token': os.getenv('BORGY_TG_TOKEN'),
    'chat_id': os.getenv('ID_CHAT_BORGY_TG'),
    'id_photo': os.getenv('BUY_IMG'),
    'id_thread_telegram': os.getenv('ID_BUY_THREAD'),
    'message': '',
    'about': 'Webhook',
  }

  transac_to_send = {
    "amount": buy["amount"],
    "value": round(total_cost_usd, 4),
    "price_with_fee": round(price_per_token_usd, 10),
    "fee": round(total_cost_usd - (total_cost_usd / buy["amount"] * buy["amount"]), 6),
    "tx": f"https://solscan.io/tx/{transac['signature']}"
  }

  infos_for_telegram["message"] = EN["buy-message"](transac_to_send)

  send_message_with_photo_to_telegram(infos_for_telegram)
  print('New buy sending to Telegram.')