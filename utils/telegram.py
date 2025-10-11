import os
from playwright.async_api import Page
import requests
from dotenv import load_dotenv

load_dotenv('./.env.production')

def format_message(error_msg: str):
  character_to_edit = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']

  # Edit error message for telegram.
  for character in character_to_edit:
    if '+' in error_msg: error_msg = error_msg.replace('+', '\\%2B')
    elif character in error_msg: error_msg = error_msg.replace(character, '\\'+character)
  return error_msg

async def send_error_to_telegram(e: Exception, add_error_msg: str = None, bot_token: str = os.getenv('WASB_TG_TOKEN')):
  chat_id = os.getenv('MONITORING_ID_CHAT_TG')
  error_msg = str(e)

  if add_error_msg: error_msg = f'{add_error_msg} : {e}'
  error_msg = format_message(error_msg)

  res = requests.post(f'https://api.telegram.org/bot{bot_token}/sendMessage?chat_id={chat_id}&text={error_msg}&parse_mode=MarkdownV2',
    headers = {
      'accept': 'application/x-www-form-urlencoded'
    }
  )
  json_res = res.json()

  if json_res['ok'] is False: print(f'code {json_res["error_code"]} - {json_res["description"]}')

async def handler_error(e: Exception, page: Page, add_error_msg: str, is_borgy_bot: bool = False):
  bot_token = os.getenv('BORGY_TG_TOKEN') if is_borgy_bot else os.environ.get('WASB_TG_TOKEN')
  print(f'{add_error_msg} : {e}')

  await page.goto(page.url)
  await send_error_to_telegram(e, add_error_msg, bot_token)

async def send_message_with_photo_to_telegram(infos: dict, not_pin: bool = False):
  try:
    message_thread_id = f'&message_thread_id={infos["id_thread_telegram"]}' if 'id_thread_telegram' in infos else ''

    res = requests.post(f'https://api.telegram.org/bot{infos["bot_token"]}/sendPhoto?chat_id={infos["chat_id"]}&photo={infos["id_photo"]}&caption={infos["message"]}&parse_mode=MarkdownV2{message_thread_id}',
      headers = {
        'accept': 'application/x-www-form-urlencoded',
      }
    )
    json_res = res.json()

    if json_res['ok'] is False: raise Exception(f'code {json_res["error_code"]} - {json_res["description"]}')
    if not_pin: return
    id_message = json_res['result']['message_id']

    requests.get(f'https://api.telegram.org/bot{infos["bot_token"]}/pinChatMessage?chat_id={infos["chat_id"]}&message_id={id_message}')

    # Print the response
    print(f'{infos["about"]} message with photo to Telegram successfully.')
  except Exception as error:
    print(f"Error {infos['about'].lower()} message with photo to telegram: {error}")
    raise Exception(f"Error {infos['about'].lower()} message with photo to telegram: {error}") from error

async def send_simple_message_to_telegram(infos: dict, not_pin: bool = False):
  try:
    message_thread_id = f'&message_thread_id={infos["id_thread_telegram"]}' if 'id_thread_telegram' in infos else ''

    res = requests.post(f'https://api.telegram.org/bot{infos["bot_token"]}/sendMessage?chat_id={infos["chat_id"]}&text={infos["message"]}&parse_mode=MarkdownV2{message_thread_id}',
      headers = {
        'accept': 'application/x-www-form-urlencoded',
      }
    )
    json_res = res.json()

    if json_res['ok'] is False: raise Exception(f'code {json_res["error_code"]} - {json_res["description"]}')
    if not_pin: return
    id_message = json_res['result']['message_id']

    requests.get(f'https://api.telegram.org/bot{infos["bot_token"]}/pinChatMessage?chat_id={infos["chat_id"]}&message_id={id_message}')

    # Print the response
    print(f"{infos['about']} message to Telegram successfully.")
  except Exception as error:
    print(f"Error {infos['about'].lower()} message to telegram: {error}")
    raise Exception(f"Error {infos['about'].lower()} message to telegram: {error}") from error