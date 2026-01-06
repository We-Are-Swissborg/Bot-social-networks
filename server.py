import os
import json
from fastapi import FastAPI, Request
from utils.borgy_webhook import borgy_webhook
from utils.telegram import send_simple_message_to_telegram

app = FastAPI()

@app.post("/webhook-helius")
async def webhook_helius(req: Request):
  print('Webhook received.')
  infos_for_telegram = {
    'bot_token': os.getenv('WASB_TG_TOKEN'),
    'chat_id': os.getenv('MONITORING_ID_CHAT_TG'),
    'message': '',
    'about': 'Webhook',
  }
  auth = req.headers.get('authorization')

  if auth != os.getenv("WEBHOOK_AUTH"):
    infos_for_telegram['message'] = 'Error webhook authentification'
    print('Error webhook authentification')
    await send_simple_message_to_telegram(infos_for_telegram)
    return

  data = json.loads(await req.body())

  if len(data) > 1:
    print('There is more than 1 transaction')
    infos_for_telegram['message'] = 'There is more than 1 transaction :%0A%0A'

    for transac in data:
      infos_for_telegram['message'] += f'https://solscan.io/tx/{transac["signature"]}%0A'

    await send_simple_message_to_telegram(infos_for_telegram)
    return

  await borgy_webhook(data[0])