import http from 'node:http';
import dotenv from 'dotenv';
import process from 'process';
import BorgyPolling from './bots/telegram/Borgy.js';
import { sendErrorToTelegram } from './utils/telegram.js';
import getDriver from './utils/getDriver.js';

dotenv.config({ path: '.env.production' });

const port = Number(process.env.PORT) || 3000;

const server = http.createServer();

server.listen(port, async () => {
  try {
    console.log('Server run');
    const driver = await getDriver();

    await BorgyPolling(driver, true);

    // Polling.
    setInterval(async () => {
      await BorgyPolling(driver, false);
    }, 60000);

  } catch(e) {
    const errMsg = e.response ? e.response.body : e.message;
    console.error(new Date().toLocaleString('fr-FR') + ' An error occured : ' + errMsg);
    await sendErrorToTelegram(e, 'An error occured :');
  }
})