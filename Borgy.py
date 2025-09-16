import sys
import os
import asyncio
import time
import datetime
from dotenv import load_dotenv
from playwright.async_api import Page, Browser
from utils.telegram import send_error_to_telegram, send_message_with_photo_to_telegram
from utils.numberFormatter import format_value
from utils.transfers import get_transfers
from translations.fr import FR
from translations.en import EN
from executor import rerun_in_background # production file not for local

load_dotenv('./.env.production')

date = datetime.datetime.now()

async def borgy():
  hour_sending = [12, 13]
  fr_message = FR['ticket-message'] if date.hour == 13 else FR['vote-message']
  en_message = EN['ticket-message'] if date.hour == 13 else EN['vote-message']
  id_photo = os.getenv('TICKET_IMG') if date.hour == 13 else os.getenv('VOTE_IMG')
  about = 'Ticket' if date.hour == 13 else 'Vote'
  no_time = True

  try:
    if date.hour in hour_sending:
      vote_messages = [
        {'id_thread': os.getenv('ID_FR_THREAD'), 'message': fr_message},
        {'id_thread': os.getenv('ID_EN_THREAD'), 'message': en_message}
      ]

      infos_for_telegram = {
        'bot_token': os.getenv('BORGY_TG_TOKEN'),
        'chat_id': os.getenv('ID_CHAT_BORGY_TG'),
        'id_photo': id_photo,
        'id_thread_telegram': '',
        'message': '',
        'about': about,
      }

      for data in vote_messages:
        infos_for_telegram['id_thread_telegram'] = data['id_thread']
        infos_for_telegram['message'] = data['message']
        await send_message_with_photo_to_telegram(infos_for_telegram)
      no_time = False

    # Message to WASB telegram.
    if date.hour == 13:
      infos_for_telegram = {
        'bot_token': os.getenv('WASB_TG_TOKEN'),
        'chat_id': os.getenv('ID_CHAT_WASB_TG'),
        'id_photo': 'AgACAgQAAx0CWDGDpQABAn86aLROyjUhEhrT3KjkUPLRsWGJOsUAAmPJMRvwMqBRBeGVP5MWxwcBAAMCAANzAAM2BA',
        'message': fr_message,
        'about': about,
      }
      await send_message_with_photo_to_telegram(infos_for_telegram)
      no_time = False

    if no_time:
      raise Exception("It's not time to send Borgy message.")
  except Exception as e:
    print(e)
    await send_error_to_telegram(e)

async def borgy_polling(page: Page, is_not_first_req: bool, browser: Browser):
  print(f'{datetime.datetime.now()} - Start polling !')
  is_not_first_swap = False
  swnap_number = 1
  transfers = []

  try:
    if is_not_first_req:
      print('NEW RELOAD PAGE')
      await page.close()
      time.sleep(2)
      page = await browser.new_page()
      await page.goto("https://solscan.io/token/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX?activity_type=ACTIVITY_TOKEN_SWAP&page_size=10&value=100&value=#defiactivities")

    time.sleep(5)
    transfers = await get_transfers(page)

    async with asyncio.timeout(300):
      for swap in transfers:
        print('Swap :', swnap_number)
        swnap_number = swnap_number + 1
        infos_for_telegram = {
          'bot_token': os.getenv('BORGY_TG_TOKEN'),
          'chat_id': os.getenv('ID_CHAT_BORGY_TG'),
          'id_photo': os.getenv('BUY_IMG'),
          'id_thread_telegram': os.getenv('ID_BUY_THREAD'),
          'message': '',
          'about': 'Buy',
        }

        prop_swap = swap.keys()

        for prop in prop_swap:
          if '.' in str(swap[prop]) and prop != 'amount':
            swap[prop] = str(swap[prop]).replace('.', '\\.')

        swap['amount'] = format_value(float(swap['amount'].replace(',', '')))
        swap['value'] = swap['value'].replace('$', '')

        if '.' in swap['amount']: swap['amount'] = str(swap['amount']).replace('.', '\\.')

        infos_for_telegram['message'] = EN['buy-message'](swap)

        if is_not_first_swap: time.sleep(2)
        is_not_first_swap = True
        await send_message_with_photo_to_telegram(infos_for_telegram)

  except asyncio.TimeoutError as e:
    print('TimeoutError')
    if str(e) == '':
      print(f'{datetime.datetime.now()} - RESTART PROCESS')
      await rerun_in_background()
      print(f'{datetime.datetime.now()} - PROCESS RESTARTED')

  except Exception as e:
    print(e)
    if 'browser has been closed' in str(e):
      print(f'{datetime.datetime.now()} - RESTART PROCESS')
      await rerun_in_background()
      print(f'{datetime.datetime.now()} - PROCESS RESTARTED')

IS_CRON_JOB = False if len(sys.argv) != 2 else True

# Condition for run a cron job.
if IS_CRON_JOB: asyncio.run(borgy())
