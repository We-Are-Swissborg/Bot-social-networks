import requests

async def dex_screener(params: str):
  res = requests.get(f'https://api.dexscreener.com/latest/dex/tokens/{params}').json()
  return res