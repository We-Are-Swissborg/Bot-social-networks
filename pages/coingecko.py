from playwright.async_api import Page
from utils.telegram import handler_error

def get_value_tab(page: Page): return page.locator('tbody').locator('nth=1').locator('td')

async def get_market_cap(metrics: dict, page: Page, max_loop: int, crypto: str):
  try:
    while metrics['marketCap'] == '':
      market_cap = get_value_tab(page)
      metrics['marketCap'] = await market_cap.first.text_content()
      if metrics['marketCap']: metrics['marketCap'] = metrics['marketCap'].replace(',', '').strip()

      if max_loop == 0: raise Exception(f'Nb loop max in get_market_cap {crypto}.')
      max_loop = max_loop -1

    max_loop = 5
    print(crypto + ' marketCap is acquired.')
  except Exception as e:
    await handler_error(e, page, f'Error to get {crypto} marketCap on CoinGecko: ')

# Get 24h volume.
async def get_volume(metrics: dict, page: Page, max_loop: int, crypto: str):
  try:
    while metrics['volumeCoinGecko'] == '':
      volume = get_value_tab(page)
      metrics['volumeCoinGecko'] = await volume.locator('nth=3').text_content()
      metrics['volumeCoinGecko'] = metrics['volumeCoinGecko'].strip()

      if max_loop == 0: raise Exception(f'Nb loop max in get_volume {crypto}.')
      max_loop = max_loop -1

    max_loop = 5
    print(crypto + ' volume is acquired.')
  except Exception as e:
    await handler_error(e, page, f'Error to get {crypto} volume on CoinGecko: ')

# Get supply circulation.
async def get_supply_circulation(metrics: dict, page: Page, max_loop: int, crypto: str):
  try:
    while metrics['supplyCirculation'] == '':
      supply_circulation = get_value_tab(page)
      metrics['supplyCirculation'] = await supply_circulation.locator('nth=4').text_content()
      if metrics['supplyCirculation']: 
        metrics['supplyCirculation'] = metrics['supplyCirculation'].replace(',', '').strip()
        if '\n' in metrics['supplyCirculation']: metrics['supplyCirculation'] =  metrics['supplyCirculation'].split('\n')[0]

      if max_loop == 0: raise Exception(f'Nb loop max in get_supply_circulation {crypto}.')
      max_loop = max_loop -1

    max_loop = 5
    print(crypto + ' supply circulation is acquired.')
  except Exception as e:
    await handler_error(e, page, f'Error to get {crypto} supply circulation on CoinGecko: ')

# Get rank crypto.
async def get_rank(crypto: str, page: Page, max_loop: int):
  try:
    while crypto['rank'] == '':
      rank = page.locator('[data-coin-show-target="staticCoinPrice"]').locator('div').locator('span').locator('div')
      crypto['rank'] = await rank.text_content()
      crypto['rank'] = crypto['rank'].split('#')[1].strip()

      if max_loop == 0: raise Exception('Nb loop max in get_rank.')
      max_loop = max_loop -1

    max_loop = 5
    print('Rank is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error for get rank: ')