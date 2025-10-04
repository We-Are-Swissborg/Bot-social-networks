import os
import sys
import asyncio
import datetime
import json
from decimal import Decimal

# Import module file from my main folder.
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from utils.numberFormatter import convert_number_for_calcul
from playwright.async_api import Page
from pages.solscan import get_trades, get_market_cap, get_holders

decoder = json.JSONDecoder()

def decimal_serializer(obj):
  if isinstance(obj, Decimal):
    return str(obj)
  raise TypeError("Type not serializable")

async def get_transfers(page: Page):
  date = datetime.datetime.now()
  try:
    print(f'{date} - GET_TRANSFERS')
    transfers = await get_trades(page)
    if date.strftime("%A") == "Monday":
      swap_week_file = open("./files/swap-week.txt", "r", encoding='utf-8')
      read_swap_week, read_swap_week_end = decoder.raw_decode(swap_week_file.read())
      swap_week = read_swap_week["data"]

      if date.hour == 13 and read_swap_week['already_req'] is False:
        print(f"{date} - Get MarketCap and Holders to add them to swap-week.txt.")
        swap_week["market_cap"] = convert_number_for_calcul(await get_market_cap(page))
        swap_week["holders"] = convert_number_for_calcul(await get_holders(page))
        swap_week = {"data": swap_week, "already_req": read_swap_week["already_req"]}
        swap_week_file = open("./files/swap-week.txt", "w", encoding='utf-8')
        swap_week_file.write(json.dumps(swap_week))
        swap_week_file.close()
        print(f'{date} - MarketCap and Holders successfully adding to swap-week.txt.')
      if date.hour == 14 and read_swap_week['already_req'] is True:
        print(f"{date} - Swap week is fine sending.")
        swap_week = {"data": swap_week, "already_req": False}
        swap_week_file = open("./files/swap-week.txt", "w", encoding='utf-8')
        swap_week_file.write(json.dumps(swap_week))
        swap_week_file.close()
    return transfers
  except Exception as e:
    print(e)
