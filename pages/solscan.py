import json
import time
import asyncio
import datetime
from decimal import Decimal
from playwright.async_api import Page, Locator
from utils.numberFormatter import convert_number_for_calcul
from executor import rerun_in_background # production file not for local

def decimal_serializer(obj):
  if isinstance(obj, Decimal):
    return str(obj)
  raise TypeError("Type not serializable")

async def check_is_buyer_signature(rows_transactions: list[Locator], signature: str):
  try:
    full_borgy = [] # Used to verify if these duplicate signatures participated in crypto exchanges to acquire only BORGY.
    is_full_borgy = True

    for row in rows_transactions:
      td = await row.locator('td').all()
      sign = await td[1].text_content()
      crypto_received = await td[5].locator('div > div > div:nth-child(2) > div > div > span').all()
      crypto = await crypto_received[1].text_content()
      if sign == signature: full_borgy.append(crypto)

    if len(full_borgy) == 1: return 1
    for c in full_borgy:
      if c != full_borgy[0]: is_full_borgy = False
    if is_full_borgy: return len(full_borgy)
    return 0
  except Exception as e:
    print(e)

# Length must be equal to the number of transactions per page (10)
def check_length_signature_array(old_signatures: list[str], transfers: list[dict]):
  for transfer in transfers:
    if len(old_signatures) == 10:
      old_signatures.pop(0)
      old_signatures.append(transfer["signature"])
    else:
      old_signatures.append(transfer["signature"])

async def add_new_transfer(td: list[Locator], signature: str, array_transfer: list[dict], swap_week: dict):
  value = await td[6].text_content()
  amount_div = await td[5].locator('div > div > div:nth-child(2) > div > div > div').all()
  amount = await amount_div[1].text_content()
  buy_price = Decimal(convert_number_for_calcul(value) / convert_number_for_calcul(amount))
  transfer = {}

  transfer['signature'] = signature
  transfer['amount'] = amount
  transfer['value'] = value
  transfer['price_without_fee'] = round(buy_price, 8)
  transfer['tx_link'] = 'https://solscan.io/tx/'+signature

  array_transfer.append(transfer)

  # Calcul data transfer for week swap file.
  for prop in swap_week:
    if prop != 'swaps':
      v = transfer[prop]
      if prop != 'price_without_fee':
        v = convert_number_for_calcul(v)
      if prop == 'amount':
        v = Decimal(v)
      swap_week[prop] = swap_week[prop] + v

  print('Add new transfer in the list.')

async def set_transfer(td: list[Locator], transfer: dict, swap_week: dict):
  value = await td[6].text_content()
  amount_div = await td[5].locator('div > div > div:nth-child(2) > div > div > div').all()
  amount = await amount_div[1].text_content()
  total_value = convert_number_for_calcul(transfer["value"]) + convert_number_for_calcul(value)
  total_amount = Decimal(convert_number_for_calcul(transfer["amount"])) + Decimal(convert_number_for_calcul(amount))
  buy_price = Decimal(total_value / convert_number_for_calcul(str(total_amount)))

  transfer['value'] = str(total_value)
  transfer['amount'] = str(total_amount)
  transfer['price_without_fee'] = round(buy_price, 8)

  # Calcul data transfer for week swap file.
  swap_week['value'] = swap_week['value'] + convert_number_for_calcul(value)
  swap_week['amount'] = swap_week['amount'] + Decimal(convert_number_for_calcul(amount))
  swap_week['price_without_fee'] = swap_week['price_without_fee'] + round(buy_price, 8)

  print('Set one transfer in the list.')

async def get_trades(page: Page):
  old_signatures_file = open('./files/old-signatures-Borgy.txt', 'r+', encoding="utf-8")
  max_bypass = 10
  try:
    decoder = json.JSONDecoder()
    old_signatures, old_signatures_end = decoder.raw_decode(old_signatures_file.read())
    rows_transactions = await page.locator('tbody').locator('tr').all()
    swap_week = {
      'amount': 0,
      'value': 0,
      'price_without_fee': 0,
      'swaps': 0
    }
    print('ROWS_TRANSAC :', type(rows_transactions), len(rows_transactions))

    while rows_transactions == []:
      try:
        print(f'{datetime.datetime.now()} - BYPASS')
        async with asyncio.timeout(300):
          if max_bypass == 0:
            print('MAX BYPASS')
            await rerun_in_background()
          max_bypass = max_bypass - 1
          await page.wait_for_load_state(state="domcontentloaded")
          await page.wait_for_load_state('networkidle')
          await page.wait_for_timeout(5000)
          await page.mouse.click(210, 290)
          time.sleep(2)
          rows_transactions = await page.locator('tbody').locator('tr').all()
        print(f'{datetime.datetime.now()} - BYPASS OK !')
      except asyncio.TimeoutError as e:
        print('TimeoutError')
        if str(e) == '':
          print(f'{datetime.datetime.now()} -  RESTART PROCESS')
          await rerun_in_background()
          print(f'{datetime.datetime.now()} - PROCESS RESTARTED')
      except Exception as e:
        print('ERROR LOOP CLICK :', e)
        if 'browser has been closed' in str(e) or 'list.remove(x)' in str(e):
          print(f'{datetime.datetime.now()} -  RESTART PROCESS')
          await rerun_in_background()
          print(f'{datetime.datetime.now()} - PROCESS RESTARTED')

    if len(rows_transactions) != 10: print('ERROR ROWS TRANSAC :', len(rows_transactions))
    array_transfer = []
    row_number = 1

    for row in rows_transactions:
      print('Loop transaction row :', row_number)
      row_number = row_number + 1
      td = await row.locator('td').all()
      is_alert = False

      # Check if the transaction failed.
      try:
        is_alert = bool(await td[1].locator('lucide-circle-alert'))
      except Exception:
        is_alert = False

      crypto_received = await td[5].locator('div > div > div:nth-child(2) > div > div > span').all()
      print('CRYPTO_RECEIVED :', crypto_received)
      crypto = await crypto_received[1].text_content()

      if is_alert is False:
        signature = await td[1].text_content()
        is_already_send = signature in old_signatures

        if is_already_send is False and crypto == 'BORGY':
          print('Check is buyer signature.')
          signatures_number = await check_is_buyer_signature(rows_transactions, signature)

          if signatures_number == 1:
            print('Buyer has a simple signature.')
            await add_new_transfer(td, signature, array_transfer, swap_week)
          if signatures_number >= 2:
            print('Buyer has a duplicate signature.')
            trans = {"id": 0, "is_unique": True}
            for i, transfer in enumerate(array_transfer):
              if signature == transfer["signature"]:
                trans["id"] = i
                trans["is_unique"] = False
            if trans["is_unique"]: await add_new_transfer(td, signature, array_transfer, swap_week)
            else: await set_transfer(td, array_transfer[trans["id"]], swap_week)

    if len(array_transfer) != 0:
      check_length_signature_array(old_signatures, array_transfer)
      old_signatures_file.seek(0)
      print('Write the new signatures in the file.')
      old_signatures_file.write(json.dumps(old_signatures))

      print('Add new data in swap-week.txt.')
      week_swap_file = open("./files/swap-week.txt", 'r', encoding="utf-8")
      read_swap_week, read_swap_week_end = decoder.raw_decode(week_swap_file.read())
      swap_week_decode = read_swap_week["data"]

      swap_week['swaps'] = len(array_transfer)

      for prop in swap_week:
        if prop in ('price_without_fee', 'amount'):
          swap_week[prop] = swap_week[prop] + Decimal(swap_week_decode[prop])
          continue
        swap_week[prop] = swap_week[prop] + swap_week_decode[prop]
      swap_week = {"data": swap_week, "already_req": read_swap_week["already_req"]}
      swap_week_file = open("./files/swap-week.txt", 'w', encoding="utf-8")
      swap_week_file.write(json.dumps(swap_week, default=decimal_serializer))
      swap_week_file.close()
      print('Successfully writing to swap-week.txt.')

    return array_transfer
  except Exception as e:
    print(e)
  finally:
    old_signatures_file.close()

async def get_market_cap(page):
  try:
    print("Get MarketCap")
    container_market_cap = await page.locator(".my-0").all()
    market_cap = await container_market_cap[9].text_content()
    return market_cap
  except Exception as e:
    print(e)

async def get_holders(page):
  try:
    print("Get Holders")
    holders = await page.locator(".flex.gap-2.flex-row.items-stretch.justify-start.flex-wrap").first.text_content()
    return holders
  except Exception as e:
    print(e)
