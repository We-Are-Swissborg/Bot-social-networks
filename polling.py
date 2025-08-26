import os
import asyncio
import time
import datetime
from dotenv import load_dotenv
from camoufox.async_api import AsyncCamoufox
from Borgy import borgy_polling
from utils.telegram import send_error_to_telegram

load_dotenv('./.env.production')

async def polling():
  try:
    print('Polling run')
    is_not_first_req = False
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
      await page.goto("https://solscan.io/token/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX?activity_type=ACTIVITY_TOKEN_SWAP&page_size=10&value=50&value=#defiactivities")
      await page.wait_for_load_state(state="domcontentloaded")
      await page.wait_for_load_state('networkidle')
      await page.wait_for_timeout(5000)
      await page.mouse.click(210, 290)

      while True:
        if is_not_first_req: time.sleep(60)
        await borgy_polling(page, is_not_first_req)
        is_not_first_req = True

  except Exception as e:
    print(f'{datetime.datetime.now()} An error occured : {e}')
    await send_error_to_telegram(e, 'An error occured :')

asyncio.run(polling())