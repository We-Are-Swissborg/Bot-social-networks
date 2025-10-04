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
    i = 0
    is_unique = False

    for row in rows_transactions:
      td = await row.locator('td').all()
      sign = await td[1].text_content()
      if sign == signature: i = i + 1

    if i == 1: is_unique = True
    return is_unique
  except Exception as e:
    print(e)

# Length must be equal to the number of transactions per page (10)
def check_length_signature_array(old_signatures: list[str], signature: str):
  if len(old_signatures) == 10:
    old_signatures.pop(0)
    old_signatures.append(signature)
  else:
    old_signatures.append(signature)

async def get_trades(page: Page):
  data_file = open('./files/old-signatures-Borgy.txt', 'r+', encoding="utf-8")
  max_bypass = 10
  try:
    decoder = json.JSONDecoder()
    old_signatures, old_signatures_end = decoder.raw_decode(data_file.read())
    rows_transactions = await page.locator('tbody').locator('tr').all()
    swap_week = {
      'amount': 0,
      'value': 0,
      'price_without_fee': 0
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
          is_buyer_signature = await check_is_buyer_signature(rows_transactions, signature)

          if is_buyer_signature:
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
            check_length_signature_array(old_signatures, signature)

            # Calcul data transfer for week swap file.
            for prop in swap_week:
              value = transfer[prop]
              if prop != 'price_without_fee':
                value = convert_number_for_calcul(value)
              if prop == 'amount':
                value = Decimal(str(value))
              swap_week[prop] = swap_week[prop] + value

    if len(array_transfer) != 0:
      data_file.seek(0)
      print('Write the new signatures in the file.')
      data_file.write(json.dumps(old_signatures))
    # Write data transfer to week swap file.

    if swap_week['amount'] != 0:
      print('Add new data in swap-week.txt.')
      week_swap_file = open("./files/swap-week.txt", 'r', encoding="utf-8")
      read_swap_week, read_swap_week_end = decoder.raw_decode(week_swap_file.read())
      swap_week_decode = read_swap_week["data"]

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
    data_file.close()

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
