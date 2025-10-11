import os
import time
from camoufox.async_api import AsyncCamoufox
from playwright.async_api import Page
import pages.swissborg as Swissborg
import pages.coingecko as Coingecko
from pages.dexScreener import dex_screener
from .cryptoMath import compare_two_crypto, get_value_crypto
from .numberFormatter import abbreviate_number
from .telegram import handler_error
# import pages.coinMarketCap as CoinMarketCap

async def get_on_swissborg(infos: dict, page: Page, max_loop: int):
  try:
    borg_metrics_or_several_metrics = infos['borg'] if infos['borg'] else infos

    # Page https://swissborg.com/marche-crypto/coins/swissborg-token
    # await page.goto('https://swissborg.com/crypto-market/coins/swissborg-token')
    # time.sleep(2)
    # await Swissborg.get_market_cap_borg(borg_metrics_or_several_metrics, page, max_loop)
    # await Swissborg.get_supply_circulation_borg(borg_metrics_or_several_metrics, page, max_loop)

    # Page https://swissborg.com/about
    await page.goto('https://swissborg.com/about')
    time.sleep(2)
    await Swissborg.accept_cookie_swissborg(page, max_loop)
    await Swissborg.get_aum_borg(borg_metrics_or_several_metrics, page, max_loop)
    await Swissborg.get_user_verify(borg_metrics_or_several_metrics, page, max_loop)

    # Page https://swissborg.com/buy-borg
    await page.goto('https://swissborg.com/buy-borg')
    time.sleep(2)
    await Swissborg.get_borg_lock_for_governance(borg_metrics_or_several_metrics, page, max_loop)
    await Swissborg.get_circulating_borg(borg_metrics_or_several_metrics, page, max_loop)

    # Page https://www.coingecko.com/en/coins/{nameCrypto}
    await page.goto('https://www.coingecko.com/en/coins/swissborg')
    time.sleep(2)
    if infos['borg'] is None: await Coingecko.get_rank(borg_metrics_or_several_metrics, page, max_loop)
    await Coingecko.get_market_cap(borg_metrics_or_several_metrics, page, max_loop, 'BORG')
    await Coingecko.get_supply_circulation(borg_metrics_or_several_metrics, page, max_loop, 'BORG')
    await Coingecko.get_volume(borg_metrics_or_several_metrics, page, max_loop, 'BORG')
  except Exception as e:
    if 'Page.goto' in str(e): return print(f'Error to get datas on Swissborg {e}')
    await handler_error(e, page, 'Error to get datas on Swissborg :')

async def get_on_coingecko(infos: dict, page: Page, max_loop: int, prop_metrics: list):
  try:
    inc = 0
    # Crypto to add url CoinGecko.
    params_coingecko = {
      'borg': 'swissborg',
      'btc': 'bitcoin',
      'xbg': 'xborg'
    }

    # Value to get on CoinGecko.
    value_to_get_coingecko = {
      'borg': [
        'marketCap',
        'supplyCirculation',
      ],
      'btc': [
        'marketCap',
        'volumeCoinGecko',
        'supplyCirculation',
      ],
      'xbg': [
        'marketCap',
        'volumeCoinGecko',
        'supplyCirculation',
      ],
    }

    # Value to get on Coingecko.
    for prop in prop_metrics:
      if prop in value_to_get_coingecko:
        # Page https://coingecko.com/en/coins/{nameCrypto}
        if inc != 0: time.sleep(2.5)
        await page.goto(f'https://www.coingecko.com/en/coins/{params_coingecko[prop]}')
        if 'marketCap' in value_to_get_coingecko[prop]: await Coingecko.get_market_cap(infos[prop], page, max_loop, prop)
        if 'volumeCoinGecko' in value_to_get_coingecko[prop]: await Coingecko.get_volume(infos[prop], page, max_loop, prop)
        if 'supplyCirculation' in value_to_get_coingecko[prop]: await Coingecko.get_supply_circulation(infos[prop], page, max_loop, prop)
      inc = inc + 1

  except Exception as e:
    if 'Page.goto' in str(e): return print(f'Error to get datas on CoinGecko {e}')
    await handler_error(e, page, 'Error to get datas on CoinGecko')

async def get_on_dexscreener(infos: dict, page: Page, prop_metrics: list):
  try:
    # WARNING ORDER 'pairs_id' IF YOU ADD A NEW CRYPTO.
    params_dexscreener = 'BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX' # Include Borgy
    value_to_get_dexscreener = {
      'borgy': {
        'pairs_id': 1,
        'props': [
          'marketCap',
          'volumeDexScreener',
          # 'created'
          # 'holder',
        ]
      },
    }
    res = await dex_screener(params_dexscreener)

    for prop in prop_metrics:
      if prop in value_to_get_dexscreener:
        if 'marketCap' in value_to_get_dexscreener[prop]['props']: infos[prop]['marketCap'] = str(res['pairs'][value_to_get_dexscreener[prop]['pairs_id']]['marketCap'])
        if 'volumeDexScreener' in value_to_get_dexscreener[prop]['props']: infos[prop]['volumeDexScreener'] = str(res['pairs'][value_to_get_dexscreener[prop]['pairs_id']]['volume']['h24'])
        # if value_to_get_dexscreener[prop]['props'].includes('created')) infos[prop].created = String(res['pairs'][value_to_get_dexscreener[prop]['pairs_id']].pairCreatedAt)
        # if value_to_get_dexscreener[prop].includes('holder')) await DexScreener.getHolder(infos[prop], page, max_loop, prop)

        print(f"{prop} metrics acquired on DexScreener.")
  except Exception as e:
    if 'Page.goto' in str(e): return print(f'Error to get datas on CoinGecko {e}')
    await handler_error(e, page, 'Error to get datas on DexScreener')

async def get_metrics(infos: dict):
  try:
    os_camoufox = os.getenv("OS_CAMOUFOX")
    headless_camoufox = os.getenv("HEADLESS_CAMOUFOX") if os_camoufox == 'linux' else bool(os.getenv("HEADLESS_CAMOUFOX"))
    async with AsyncCamoufox(
      os=os_camoufox,
      humanize=True,
      headless=headless_camoufox,
      disable_coop=True,
      i_know_what_im_doing=True,
      window=(1280, 720),
    ) as browser:
      page = await browser.new_page()

      max_loop = 5 # Use for return a error if data not found after loop equal 5.
      # let quitFrame = infos['borg'] ? false : true # For quit the frame on swissborg page.
      prop_metrics = infos.keys() if infos['borg'] else None

      await get_on_swissborg(infos, page, max_loop)

      if 'borg' in infos:
        # for (let i = 0 prop_metrics.length > i i++) {
        #  prop = prop_metrics[i]
        #  # Page https://coinmarketcap.com/en/currencies/{nameCrypto}
        #  i !== 0 and await new Promise(resolve => setTimeout(resolve, 2500))
        #  await page.goto(`https://coinmarketcap.com/en/currencies/${cryptoWasb[prop]}`)
        #  await new Promise(resolve => setTimeout(resolve, 2000))
        #  # if valueToGet[prop].includes('value')) await CoinMarketCap.getValue(infos[prop], page, max_loop, prop)
        #  if valueToGet[prop].includes('marketCap')) await CoinMarketCap.get_market_cap(infos[prop], page, max_loop, prop)
        #  if valueToGet[prop].includes('volumeCoinMarketCap')) await CoinMarketCap.get_volume(infos[prop], page, max_loop, prop)
        #  if valueToGet[prop].includes('volumeCex') and valueToGet[prop].includes('volumeDex')) await CoinMarketCap.getCexAndDexVolume(infos[prop], page, max_loop, prop)
        #  if valueToGet[prop].includes('supplyCirculation')) await CoinMarketCap.get_supply_circulation(infos[prop], page, max_loop, prop)
        #  if valueToGet[prop].includes('liquidity')) await CoinMarketCap.getLiquidity(infos[prop], page, max_loop, prop)

        await get_on_coingecko(infos, page, max_loop, prop_metrics)
        await get_on_dexscreener(infos, page, prop_metrics)

        for prop in prop_metrics:
          is_market_cap = 'marketCap' in infos[prop]
          is_supply_circulation = 'supplyCirculation' in infos[prop]
          is_volume_dexscreener = 'volumeDexScreener' in infos[prop]
          is_volume_coingecko = 'volumeCoinGecko' in infos[prop]

          if is_market_cap and is_supply_circulation: infos[prop]['value'] = get_value_crypto(infos[prop]['marketCap'], infos[prop]['supplyCirculation'])
          if is_market_cap: infos[prop]['marketCap'] = abbreviate_number(infos[prop]['marketCap'])
          if is_supply_circulation and prop != "borgy": infos[prop]['supplyCirculation'] = abbreviate_number(infos[prop]['supplyCirculation'])
          if is_volume_dexscreener: infos[prop]['volumeDexScreener'] = abbreviate_number(infos[prop]['volumeDexScreener'])
          if is_volume_coingecko: infos[prop]['volumeCoinGecko'] = abbreviate_number(infos[prop]['volumeCoinGecko'])

        if infos['borg']['value'] and infos['btc']['value']: infos['borg']['vsBtc'] = compare_two_crypto(infos['borg']['value'], infos['btc']['value'])

      if 'borg' not in infos:
        is_market_cap = 'marketCap' in infos
        is_supply_circulation = 'supplyCirculation' in infos
        is_volume_coingecko = 'volumeCoinGecko' in infos

        if is_market_cap and is_supply_circulation: infos['value'] = get_value_crypto(infos['marketCap'], infos['supplyCirculation'])
        if is_market_cap: infos['marketCap'] = abbreviate_number(infos['marketCap'])
        if is_supply_circulation: infos['supplyCirculation'] = abbreviate_number(infos['supplyCirculation'])
        if is_volume_coingecko: infos['volumeCoinGecko'] = abbreviate_number(infos['volumeCoinGecko'])

      return infos
  except Exception:
    print('GET METRICS ERROR')
    raise
  finally:
    await browser.close()
    await page.close()
