import time
from playwright.async_api import Page
import utils.numberFormatter as NumFormat
from utils.telegram import handler_error

# Click for accept cookie in Swissborg.
async def accept_cookie_swissborg(page: Page, max_loop: int):
  try:
    cookie_button = None
    while cookie_button is None:
      cookie_button = page.locator('.cookieBanner__SButton-sc-190qymo-5').last
      if cookie_button: await cookie_button.click()

      if max_loop == 0: raise Exception('Nb loop max for cookie button.')
      max_loop = max_loop - 1
  except Exception as e:
    print(f'Error with cookie button : {e}')
    # raise Exception(f'Error with cookie button : {e}') from e

# Get marketCap BORG.
async def get_market_cap_borg(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['marketCap'] == '' or borg_metrics['marketCap'] == 'N/A' or borg_metrics['marketCap'] == '':
      market_cap = page.locator('.cell-3').get_by_role('paragraph')
      borg_metrics['marketCap'] = await market_cap.text_content()
      if max_loop == 0: raise Exception('Nb loop max in get_market_cap_borg.')
      max_loop = max_loop - 1

    max_loop = 5
    print('MarketCap BORG is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get marketCap BORG :')

# Get prenium user BORG.
async def get_premium_user_borg(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['premiumUser'] == '':
      await page.locator('.AHLJo').scroll_into_view_if_needed()
      time.sleep(2)

      premium_user = page.locator('.stat-0')
      borg_metrics['premiumUser'] = await premium_user.text_content()
      if max_loop == 0: raise Exception('Nb loop max in get_premium_user_borg.')
      max_loop = max_loop - 1

    max_loop = 5
    print('Nb premium user BORG is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get nb premium user BORG :')

# Get BORG blocked by user.
async def get_borg_lock_by_premium(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['borgLockByPremium'] == '':
      time.sleep(1)
      borg_lock_by_premium = page.locator('.stat-2')
      borg_metrics['borgLockByPremium'] = await borg_lock_by_premium.text_content()

      if max_loop == 0: raise Exception('Nb loop max in get_borg_lock_by_premium.', True)
      max_loop = max_loop - 1

    max_loop = 5
    print('Nb BORG lock is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get nb BORG lock :')

# Get supply in circulation.
async def get_supply_circulation_borg(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['supplyCirculation'] == '':
      supply_circulation = page.locator('.cell-4').get_by_role('paragraph')
      borg_metrics['supplyCirculation'] = await supply_circulation.text_content()
      borg_metrics['supplyCirculation'] = borg_metrics['supplyCirculation'].split('S')[0]

      if max_loop == 0: raise Exception('Nb loop max in get_supply_circulation_borg.')
      max_loop = max_loop - 1

    max_loop = 5
    print('Nb supply in circulation is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get nb supply in circulation BORG :')

# Get AUM BORG.
async def get_aum_borg(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['aum'] == '':
      await page.locator('h2').last.scroll_into_view_if_needed()

      list_data = page.locator('.bjTDmW')
      borg_metrics['aum'] = await list_data.locator('nth=2').text_content()

      if max_loop == 0: raise Exception('Nb loop max in get_aum_borg.')
      max_loop = max_loop - 1

    max_loop = 5
    print('AUM is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get AUM BORG :')

# Get verify user.
async def get_user_verify(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['userVerify'] == '':
      list_data = page.locator('.bjTDmW')
      borg_metrics['userVerify'] = await list_data.locator('nth=1').text_content()

      if max_loop == 0: raise Exception('Nb loop max in get_user_verify.')
      max_loop = max_loop - 1

    max_loop = 5
    print('Verify user is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get verify user BORG :')

# Get nb borg lock for governance.
async def get_borg_lock_for_governance(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['borgLockForGovernance'] == '':
      await page.locator('.iMYwiA').scroll_into_view_if_needed()
      time.sleep(2)

      borg_lock_for_governance = page.locator('.SZCGg')
      borg_metrics['borgLockForGovernance'] = await borg_lock_for_governance.locator('nth=7').text_content()

      if max_loop == 0: raise Exception('Nb loop max in get_borg_lock_for_governance.')
      max_loop = max_loop - 1

    max_loop = 5
    print('Borg lock for governance is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get borg lock for governance :')

# Get circulating Borg.
async def get_circulating_borg(borg_metrics: dict, page: Page, max_loop: int):
  try:
    while borg_metrics['circulatingBorg'] == '':
      circulating_borg = page.locator('.SZCGg')
      borg_metrics['circulatingBorg'] = await circulating_borg.locator('nth=5').text_content()

      if max_loop == 0: raise Exception('Nb loop max in get_circulating_borg.')
      max_loop = max_loop - 1

    max_loop = 5
    print('Circulating Borg is acquired.')
  except Exception as e:
    await handler_error(e, page, 'Error to get circulating Borg :')

# Calcul difference between old value and new value.
def calcul_variation(borg_metrics: dict, old_borg_metrics: dict, variation_borg_metrics: dict):
  market_cap = NumFormat.convert_number_for_calcul(borg_metrics['marketCap'])
  old_market_cap = NumFormat.convert_number_for_calcul(old_borg_metrics['marketCap'])
  supply_circulation = NumFormat.convert_number_for_calcul(borg_metrics['supplyCirculation'])
  old_supply_circulation = NumFormat.convert_number_for_calcul(old_borg_metrics['supplyCirculation'])
  volume_coingecko = NumFormat.convert_number_for_calcul(borg_metrics['volumeCoinGecko'])
  old_volume_coingecko = NumFormat.convert_number_for_calcul(old_borg_metrics['volumeCoinGecko'])
  user_verify = NumFormat.convert_number_for_calcul(borg_metrics['userVerify'])
  old_user_verify = NumFormat.convert_number_for_calcul(old_borg_metrics['userVerify'])
  premium_user = NumFormat.convert_number_for_calcul(borg_metrics['premiumUser'])
  old_premium_user = NumFormat.convert_number_for_calcul(old_borg_metrics['premiumUser'])
  borg_lock_by_premium = NumFormat.convert_number_for_calcul(borg_metrics['borgLockByPremium'])
  old_borg_lock_by_premium = NumFormat.convert_number_for_calcul(old_borg_metrics['borgLockByPremium'])
  aum = NumFormat.convert_number_for_calcul(borg_metrics['aum'])
  old_aum = NumFormat.convert_number_for_calcul(old_borg_metrics['aum'])
  borg_lock_for_governance = NumFormat.convert_number_for_calcul(borg_metrics['borgLockForGovernance'])
  old_borg_lock_for_governance = NumFormat.convert_number_for_calcul(old_borg_metrics['borgLockForGovernance'])
  circulating_borg = NumFormat.convert_number_for_calcul(borg_metrics['circulatingBorg'])
  old_circulating_borg = NumFormat.convert_number_for_calcul(old_borg_metrics['circulatingBorg'])

  # Percent
  variation_borg_metrics['value'] = round(((float(borg_metrics['value']) - float(old_borg_metrics['value'])) / float(old_borg_metrics['value']) * 100), 2) if borg_metrics['value'] and old_borg_metrics['value'] else 'N/A'
  variation_borg_metrics['aum'] = round(((aum - old_aum) / old_aum * 100), 2)
  variation_borg_metrics['marketCap'] = round(((market_cap - old_market_cap) / old_market_cap * 100), 2)
  variation_borg_metrics['volumeCoinGecko'] = round(((volume_coingecko - old_volume_coingecko) / old_volume_coingecko * 100), 2)

  variation_borg_metrics['userVerify'] = user_verify - old_user_verify
  variation_borg_metrics['premiumUser'] = premium_user - old_premium_user
  variation_borg_metrics['borgLockByPremium'] = borg_lock_by_premium - old_borg_lock_by_premium
  variation_borg_metrics['supplyCirculation'] = supply_circulation - old_supply_circulation
  variation_borg_metrics['rank'] = int(borg_metrics['rank']) - int(old_borg_metrics['rank']) if borg_metrics['rank'] and old_borg_metrics['rank'] else 'N/A'
  variation_borg_metrics['borgLockForGovernance'] = borg_lock_for_governance - old_borg_lock_for_governance if borg_lock_for_governance > 0 and old_borg_lock_for_governance > 0 else 'N/A'
  variation_borg_metrics['circulatingBorg'] = circulating_borg - old_circulating_borg if circulating_borg > 0 and old_circulating_borg > 0 else 'N/A'