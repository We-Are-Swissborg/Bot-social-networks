import json
from decimal import Decimal
from playwright.async_api import Page, Locator
from utils.numberFormatter import convert_number_for_calcul

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
  data_file = open('./old-signatures-Borgy.txt', 'r+', encoding="utf-8")
  try:
    old_signatures = json.loads(data_file.read())
    rows_transactions = await page.locator('tbody').locator('tr').all()

    while len(rows_transactions) == 0:
      await page.wait_for_load_state(state="domcontentloaded")
      await page.wait_for_load_state('networkidle')
      await page.wait_for_timeout(5000)
      await page.mouse.click(210, 290)
      rows_transactions = await page.locator('tbody').locator('tr').all()

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
    if len(array_transfer) != 0:
      data_file.seek(0)
      print('Write the new signatures in the file.')
      data_file.write(json.dumps(old_signatures))

    return array_transfer
  except Exception as e:
    print(e)

  finally:
    data_file.close()

# getMarketCap = async (page):
#   try:
#     aDiv = await pageindElements(By.css('#__next > div'))
#     bDiv = await aDiv[0].findElements(By.css('div'))
#     # cDiv = await bDiv[2].findElements(By.css('div'))
#     # dDiv = await cDiv[0].findElements(By.css('div'))
#     # eDiv = await dDiv[1].findElements(By.css('div'))
#     # fDiv = await eDiv[1].findElements(By.css('div'))
#     # gDiv = await fDiv[1].findElements(By.css('div'))
#     # hDiv = await gDiv[0].findElements(By.css('div'))
#     # iDiv = await hDiv[0].findElements(By.css('div'))
#     # jDiv = await iDiv[0].findElements(By.css('div'))
#     # kDiv = await jDiv[1].findElements(By.css('div'))

#     # marketCapDiv = await page.findElements(By.css('div:nth-child(1) > div:nth-child(1) > div:nth-child(2)'))
#     # marketCapDiv = await page.findElements(By.css('#__next > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)'))
#     # marketCapDiv = await page.findElements(By.css(`
#     #   #__next >
#     #   div:nth-child(1) >
#     #   div:nth-child(3) >
#     #   div:nth-child(1) >
#     #   div:nth-child(2) >
#     #   div:nth-child(2) >
#     #   div:nth-child(2) >
#     #   div:nth-child(1) >
#     #   div:nth-child(1) >
#     #   div:nth-child(1) >
#     #   div:nth-child(2)`
#     # ))

#     console.log(await bDiv[4].getText())
#   } catch(e):
#     console.error(e)
#   }
# }