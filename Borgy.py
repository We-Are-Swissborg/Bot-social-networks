import sys
import os
import asyncio
import time
import datetime
from dotenv import load_dotenv
from playwright.async_api import Page
from utils.telegram import send_error_to_telegram, send_message_with_photo_to_telegram
from utils.numberFormatter import format_value
from utils.transfers import get_transfers
from translations.fr import FR
from translations.en import EN

load_dotenv('./.env.production')

date = datetime.datetime.now()

async def borgy():
  vote_send_time = 12
  try:
    if date.hour == vote_send_time:
      vote_messages = [
        {'id_thread': os.getenv('ID_FR_THREAD'), 'message': FR['vote-message']},
        {'id_thread': os.getenv('ID_EN_THREAD'), 'message': EN['vote-message']}
      ]

      infos_for_telegram = {
        'bot_token': os.getenv('BORGY_TG_TOKEN'),
        'chat_id': os.getenv('ID_CHAT_BORGY_TG'),
        'id_photo': 'AgACAgQAAyEFAASLu9f3AAJJuWiaxNNCIuulCdOqcMxie19g55QlAAKJzDEblyPYUC9tVrb7PuMKAQADAgADbQADNgQ',
        'id_thread_telegram': '',
        'message': '',
        'about': 'Vote',
      }

      for data in vote_messages:
        infos_for_telegram['id_thread_telegram'] = data['id_thread']
        infos_for_telegram['message'] = data['message']
        await send_message_with_photo_to_telegram(infos_for_telegram)

    else:
      raise Exception("It's not time to send Borgy vote.")
  except Exception as e:
    print(e)
    await send_error_to_telegram(e)

async def borgy_polling(page: Page, is_not_first_req: bool):
  print(f'{datetime.datetime.now()} - Start polling !')
  is_not_first_swap = False
  swnap_number = 1
  transfers = []
  solscan_url = page.url

  try:
    if is_not_first_req:
      print('RELOAD PAGE')
      await page.goto('https://solscan.io')
      time.sleep(1)
      await page.goto(solscan_url)
      # await page.reload(wait_until='networkidle')

    time.sleep(5)
    transfers = await get_transfers(page)

    for swap in transfers:
      print('Swap :', swnap_number)
      infos_for_telegram = {
        'bot_token': os.getenv('BORGY_TG_TOKEN'),
        'chat_id': os.getenv('ID_CHAT_BORGY_TG'),
        'id_photo': 'AgACAgQAAyEFAASLu9f3AAJLRWievaNj8u1QT6Di1hiBWGXQLSd4AAIFyDEbm6_4UOibMDiBTIVqAQADAgADcwADNgQ',
        'id_thread_telegram': os.getenv('ID_BUY_THREAD'),
        'message': '',
        'about': 'Buy',
      }

      prop_swap = swap.keys()

      for prop in prop_swap:
        if '.' in str(swap[prop]) and prop != 'amount' and prop != 'price_without_fee':
          swap[prop] = str(swap[prop]).replace('.', '\\.')

      swap['amount'] = format_value(float(swap['amount'].replace(',', '')))
      swap['value'] = swap['value'].replace('$', '')

      if '.' in swap['amount']: swap['amount'] = str(swap['amount']).replace('.', '\\.')

      infos_for_telegram['message'] = EN['buy-message'](swap)

      if is_not_first_swap: time.sleep(2)
      is_not_first_swap = True
      await send_message_with_photo_to_telegram(infos_for_telegram)

  except Exception as e:
    send_error_to_telegram(e, 'Buy messages :', os.getenv('BORGY_TG_TOKEN'))

IS_CRON_JOB = False if len(sys.argv) != 2 else True

# Condition for run a cron job.
if IS_CRON_JOB: asyncio.run(borgy())