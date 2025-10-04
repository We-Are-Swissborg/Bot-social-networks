import sys
import os
import json
import asyncio
import time
import datetime
from decimal import Decimal
from dotenv import load_dotenv
from playwright.async_api import Page, Browser
import utils.telegram as Telegram
import utils.numberFormatter as Number_Formatter
from utils.transfers import get_transfers
from translations.fr import FR
from translations.en import EN
from executor import rerun_in_background # production file not for local
from pages.solscan import get_market_cap, get_holders

load_dotenv('./.env.production')

date = datetime.datetime.now()
decoder = json.JSONDecoder()

def decimal_serializer(obj):
  if isinstance(obj, Decimal):
    return str(obj)
  raise TypeError("Type not serializable")

async def borgy():
  # general (Borgy army) and unleash corespond to telegram groups.
  general_sending = [9, 11, 12, 13]
  unleash_hour = [11]
  no_time = True
  fr_message = en_message = id_photo = about = None
  not_pin_message = False
  variation_swap = {
    "market_cap": 0,
    "holders": 0,
    "amount": 0,
    "value": 0,
    "price_without_fee": 0
  }

  if date.hour == 9:
    fr_message = FR['scam-alert']
    en_message = EN['scam-alert']
    about = "Scam alert"
  elif date.hour == 11:
    fr_message = FR['welcome-pack']
    en_message = EN['welcome-pack']
    about = "Welcome pack"
  elif date.hour == 12:
    fr_message = FR['vote-message']
    en_message = EN['vote-message']
    id_photo = os.getenv('VOTE_IMG')
    about = 'Vote'
  elif date.hour == 13:
    swap_week_file = open("./files/swap-week.txt", "r", encoding="utf-8")
    old_swap_week_file = open("./files/old-swap-week.txt", "r", encoding="utf-8")
    read_swap_week, read_swap_week_end = decoder.raw_decode(swap_week_file.read())
    swap_week = read_swap_week["data"]
    old_swap_week, old_swap_week_end = decoder.raw_decode(old_swap_week_file.read())

    print('Check marketCap and holders exist in the file...')
    while "market_cap" not in swap_week and "holders" not in swap_week:
      swap_week_file = open("./files/swap-week.txt", "r", encoding="utf-8")
      read_swap_week, read_swap_week_end = decoder.raw_decode(swap_week_file.read())
      swap_week = read_swap_week["data"]
      time.sleep(2)

    swap_week_for_markdown = swap_week.copy()

    print('Calcul variation swap week.')
    for prop in swap_week:
      no_percentage_prop = ["holders"]
      decimal_percentage_prop = ["amount", "price_without_fee"]
      no_abreviate = ["holders", "price_without_fee"]

      if prop in no_percentage_prop:
        variation_swap[prop] = swap_week[prop] - old_swap_week[prop]
      elif prop in decimal_percentage_prop:
        variation_swap[prop] = round((Decimal(swap_week[prop]) - Decimal(old_swap_week[prop])) / Decimal(old_swap_week[prop]) * 100, 2)
      else:
        variation_swap[prop] = round((swap_week[prop] - old_swap_week[prop]) / old_swap_week[prop] * 100, 2)
      if prop not in no_abreviate:
        swap_week_for_markdown[prop] = Number_Formatter.abbreviate_number(str(swap_week_for_markdown[prop]))
        old_swap_week[prop] = Number_Formatter.abbreviate_number(str(old_swap_week[prop]))

    print('Tranform swap week value for markdown.')
    Number_Formatter.tranform_value_for_markdown(swap_week_for_markdown, old_swap_week, variation_swap)
    fr_message = FR['swap-week'](swap_week_for_markdown, old_swap_week, variation_swap)
    en_message = EN['swap-week'](swap_week_for_markdown, old_swap_week, variation_swap)
    id_photo = {"fr": os.getenv('FR_WEEK_BUY_IMG'), "en": os.getenv('EN_WEEK_BUY_IMG')}
    about = 'Swap week'

  try:
    if date.hour in general_sending:
      messages_telegram = [
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
      photos = None
      if isinstance(infos_for_telegram["id_photo"], dict):
        photos = infos_for_telegram["id_photo"]

      for i, data in enumerate(messages_telegram):
        infos_for_telegram['id_thread_telegram'] = data['id_thread']
        infos_for_telegram['message'] = data['message']
        if photos:
          if i == 0: infos_for_telegram["id_photo"] = photos['fr']
          elif i == 1: infos_for_telegram["id_photo"] = photos['en']
        if date.hour == 9 or date.hour == 11:
          await Telegram.send_simple_message_to_telegram(infos_for_telegram)
        elif date.hour == 12  or date.hour == 13:
          await Telegram.send_message_with_photo_to_telegram(infos_for_telegram)

      if date.hour == 13:
        init_swap_week = {"data": { "amount": 0, "value": 0, "price_without_fee": 0 }, "already_req": True}
        swap_week_file = open("./files/swap-week.txt", "w", encoding="utf-8")
        swap_week_file.write(json.dumps(init_swap_week))
        swap_week_file.close()

        old_swap_week_file = open("./files/old-swap-week.txt", "w", encoding="utf-8")
        old_swap_week_file.write(json.dumps(swap_week, default=decimal_serializer))
        old_swap_week_file.close()
      no_time = False

    # Message to Unleash telegram.
    if date.hour in unleash_hour:
      not_pin_message = True
      en_message = EN['unleash-welcome-pack']
      infos_for_telegram = {
        'bot_token': os.getenv('BORGY_TG_TOKEN'),
        'chat_id': os.getenv('ID_CHAT_UNLEASH_TG'),
        # 'id_photo': 'AgACAgQAAx0CWDGDpQABAn86aLROyjUhEhrT3KjkUPLRsWGJOsUAAmPJMRvwMqBRBeGVP5MWxwcBAAMCAANzAAM2BA',
        'message': en_message,
        'about': about,
      }
      # await send_message_with_photo_to_telegram(infos_for_telegram)
      await Telegram.send_simple_message_to_telegram(infos_for_telegram, not_pin_message)
      no_time = False

    if no_time:
      raise Exception("It's not time to send Borgy message.")
  except Exception as e:
    print(e)
    await Telegram.send_error_to_telegram(e)

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

        for prop in swap:
          if '.' in str(swap[prop]) and prop != 'amount':
            swap[prop] = str(swap[prop]).replace('.', '\\.')

        swap['amount'] = Number_Formatter.format_value(float(swap['amount'].replace(',', '')))
        swap['value'] = swap['value'].replace('$', '')

        if '.' in swap['amount']: swap['amount'] = str(swap['amount']).replace('.', '\\.')

        infos_for_telegram['message'] = EN['buy-message'](swap)

        if is_not_first_swap: time.sleep(2)
        is_not_first_swap = True
        await Telegram.send_message_with_photo_to_telegram(infos_for_telegram, True)

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
