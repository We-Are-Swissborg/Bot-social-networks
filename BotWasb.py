import os
import asyncio
import datetime
import json
import requests
from dotenv import load_dotenv
from utils.metrics import get_metrics
from utils.telegram import send_error_to_telegram

load_dotenv('./.env.production')

async def bot_wasb():
  try:
    infos = {
      'crypto': {
        'borg': {
          'value': '',
          'marketCap': '',
          'userVerify': '',
          'premiumUser': '',
          'borgLockByPremium': '',
          'borgLockForGovernance': '',
          'supplyCirculation': '',
          'aum': '',
          'vsBtc': '',
          # 'volumeCoinMarketCap': '',
          # 'liquidity': '',
          'maxSupply': '985M',
          'volumeCoinGecko': '',
          'circulatingBorg': ''
        },
        'btc': {
          'value': '',
          'marketCap': '',
          # 'volumeCoinMarketCap': '',
          # 'volumeCex': '',
          # 'volumeDex': '',
          'supplyCirculation': '',
          # 'liquidity': '',
          'maxSupply': '21M',
          'volumeCoinGecko': '',
        },
        'xbg': {
          'value': '',
          'marketCap': '',
          # 'volumeCoinMarketCap': '',
          'supplyCirculation': '',
          # 'liquidity': '',
          'maxSupply': '1B',
          'volumeCoinGecko': ''
        },
        'borgy': {
          'value': '',
          'marketCap': '',
          'supplyCirculation': '77.777B',
          'maxSupply': '77.777B',
          'volumeDexScreener': '',
          # holder: '',
          # created: ''
        },
      },
      'last_update': None,
    }

    infos['crypto'] = await get_metrics(infos['crypto'])

    value_to_add_dollar = [
      ['borg', ['value', 'vsBtc', 'aum', 'marketCap']],
      ['btc', ['value', 'marketCap']],
      ['xbg', ['value', 'marketCap']],
      ['borgy', ['value', 'marketCap']],
    ]

    for value in value_to_add_dollar:
      crypto_name = value[0]
      crypto_props = value[1]

      for prop in crypto_props:
        if infos['crypto'][crypto_name][prop] and '$' not in infos['crypto'][crypto_name][prop]:
          infos['crypto'][crypto_name][prop] = '$'+infos['crypto'][crypto_name][prop]

    infos['last_update'] = str(datetime.datetime.now())

    await requests.post(os.getenv('URL_WASB'),
      headers = {
        'Authorization': 'bearer ' + os.getenv('ID_WASB_SITE'),
      },
      json = {
        'metrics': json.dumps(infos),
      }
    )

    print(datetime.datetime.now(), 'Metrics WASB post OK !')
  except Exception as e:
    print(datetime.datetime.now(), ' Error to send metrics on WASB : ', e)
    await send_error_to_telegram(e, 'Error to send metrics on WASB : ')

asyncio.run(bot_wasb())