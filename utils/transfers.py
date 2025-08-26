import datetime
from playwright.async_api import Page
from pages.solscan import get_trades

async def get_transfers(page: Page):
  try:
    print(f'{datetime.datetime.now()} - GET_TRANSFERS')
    transfers = await get_trades(page)

    return transfers
  except Exception as e:
    print(e)