import os
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from dotenv import load_dotenv
import requests
from cachetools import TTLCache
from translations.en import EN
from utils.telegram import send_message_with_photo_to_telegram

load_dotenv('./.env.production')

TARGET_MINT = "BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX"
COINGECKO_IDS = {
  "So11111111111111111111111111111111111111112": "solana",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "usd-coin",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "tether",
  "3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z": "swissborg"
}
STABLECOIN_MINTS = {
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", # USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", # USDT
}
price_cache = TTLCache(maxsize=1000, ttl=45)

def is_valid_swap(transac: dict):
  accept_type = ["UNKNOWN", "TOKEN_MINT"]
  valid = False

  if transac['transactionError'] is not None:
    print(f"TX has a transaction error: {transac['transactionError']}")
    return valid
  if len(transac['tokenTransfers']) == 0:
    print("TX is not a swap.")
    return valid
  if transac['type'] not in accept_type:
    print(f"TX has not a valid TYPE: {transac['type']}.")
    return valid
  valid = True
  return valid

def nb_transfer_include_the_crypto(transac: dict, buyer: str):
  receive_transfer = 0
  send_transfer = 0

  for transfer in transac.get("tokenTransfers", []):
    if transfer.get("mint") == TARGET_MINT and transfer.get("toUserAccount") == buyer:
      receive_transfer += 1
    elif transfer.get("mint") == TARGET_MINT and transfer.get("fromUserAccount") == buyer:
      send_transfer += 1

  if receive_transfer == 0:
    print(f"No crypto received : {TARGET_MINT}")
  return {"receive": receive_transfer, "send": send_transfer}

def is_a_buyer(transfer: dict, buyer: str, is_a_buy: bool):
  if transfer.get("mint") == TARGET_MINT and transfer.get("toUserAccount") == buyer:
    is_a_buy = True

  if transfer.get("mint") == TARGET_MINT and transfer.get("fromUserAccount") == buyer:
    is_a_buy = False

  return is_a_buy

def get_coingecko_price(mint: str, timestamp: timezone):
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
        price = data.get(cg_id, {}).get("usd", Decimal(0.0))
      else:
        print(f'{mint} UNKNWON ID NEED TO ADD IN "COINGECKO_IDS"')
        price = data.get(mint, {}).get("usd", Decimal(0.0))

      price = Decimal(str(price))
      price_cache[cache_key] = price
      return price
  except:
    pass
  return Decimal(0.0)

def calculate_cost_usd(mint: str, timestamp: timezone, amount: Decimal):
  total_usd = Decimal(0.0)

  if mint in STABLECOIN_MINTS:
    total_usd += amount
  else:
    price = get_coingecko_price(mint, timestamp)
    total_usd += amount * price

  return total_usd

def get_crypto_for_swap(i: int, buyer: str, transac: dict):
  if i == 0:
    print("Any transfer before for the swap")
  token_transfers = transac.get("tokenTransfers")
  seller = token_transfers[i].get("fromUserAccount")
  id_swap = i - 1
  from_user_account = token_transfers[id_swap].get("fromUserAccount")
  to_user_account = token_transfers[id_swap].get("toUserAccount")
  mint = token_transfers[id_swap].get("mint")

  while buyer != from_user_account and seller != to_user_account and mint == TARGET_MINT:
    id_swap -= 1
    if id_swap == -1:
      print("Any transfer found for the swap")
      break
    from_user_account = token_transfers[id_swap].get("fromUserAccount")
    to_user_account = token_transfers[id_swap].get("toUserAccount")
    mint = token_transfers[id_swap].get("mint")

  if id_swap < 0:
    return {}
  amount = Decimal(str(token_transfers[id_swap]["tokenAmount"]))

  return {"mint": mint, "amount": amount}

async def borgy_webhook(transac: dict):
  print(f"TX {transac['signature']} will be analyzed.")

  if not is_valid_swap(transac):
    return None

  buyer = transac.get("tokenTransfers")[0].get("fromUserAccount")
  transfer_include = nb_transfer_include_the_crypto(transac, buyer)
  receive_transfer = transfer_include["receive"]
  send_transfer = transfer_include["send"]
  amount = Decimal(0.0)
  swap_amount = Decimal(0.0)
  total_cost_usd = Decimal(0.0)
  price_per_token_usd = Decimal(0.0)
  is_a_buy = False

  if receive_transfer == 1 and receive_transfer != send_transfer:
    for i, transfer in enumerate(transac.get("tokenTransfers", [])):
      is_a_buy = is_a_buyer(transfer, buyer, is_a_buy)
      if is_a_buy and transfer.get("mint") == TARGET_MINT:
        data_crypto_swap = get_crypto_for_swap(i, buyer, transac)
        if data_crypto_swap.get("mint") is False or data_crypto_swap.get("mint") == TARGET_MINT:
          is_a_buy = False
          continue
        amount = Decimal(str(transfer.get("tokenAmount")))
        mint = data_crypto_swap["mint"]
        swap_amount = data_crypto_swap["amount"]
        timestamp = transac.get("timestamp", int(datetime.now(timezone.utc).timestamp()))
        total_cost_usd = calculate_cost_usd(mint, timestamp, swap_amount)
        price_per_token_usd = total_cost_usd / amount
        break

  elif receive_transfer > 1 and receive_transfer != send_transfer:
    for i, transfer in enumerate(transac.get("tokenTransfers", [])):
      is_a_buy = is_a_buyer(transfer, buyer, is_a_buy)
      if is_a_buy and transfer.get("mint") == TARGET_MINT:
        data_crypto_swap = get_crypto_for_swap(i, buyer, transac)
        if data_crypto_swap.get("mint") is False or data_crypto_swap.get("mint") == TARGET_MINT:
          is_a_buy = False
          continue
        amount += Decimal(str(transfer.get("tokenAmount")))
        mint = data_crypto_swap["mint"]
        swap_amount = data_crypto_swap["amount"]
        timestamp = transac.get("timestamp", int(datetime.now(timezone.utc).timestamp()))
        total_cost_usd += calculate_cost_usd(mint, timestamp, swap_amount)
        price_per_token_usd = total_cost_usd / amount

  else:
    is_a_buy = False

  if is_a_buy is False:
    print("This is not a purchase")
    return None

  infos_for_telegram = {
    'bot_token': os.getenv('BORGY_TG_TOKEN'),
    'chat_id': os.getenv('ID_CHAT_BORGY_TG'),
    'id_photo': os.getenv('BUY_IMG'),
    'id_thread_telegram': os.getenv('ID_BUY_THREAD'),
    'message': '',
    'about': 'Webhook',
  }

  transac_to_send = {
    "amount": f"{amount:,}",
    "value": f"{Decimal(total_cost_usd).quantize(Decimal('1e-2'), rounding=ROUND_HALF_UP):,}",
    "price": Decimal(price_per_token_usd).quantize(Decimal('1e-10'), rounding=ROUND_HALF_UP),
    "tx": f"https://solscan.io/tx/{transac['signature']}"
  }

  for prop, value in transac_to_send.items():
    if '.' in str(value):
      transac_to_send[prop] = str(value).replace('.', '\\.')
    if '-' in str(value):
      transac_to_send[prop] = str(value).replace('-', '\\-')

  infos_for_telegram["message"] = EN["buy-message"](transac_to_send)

  await send_message_with_photo_to_telegram(infos_for_telegram)
  print('New buy sending to Telegram.')