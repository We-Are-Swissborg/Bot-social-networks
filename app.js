import http from 'node:http';
import dotenv from 'dotenv';
import process from 'process';
import cron from 'node-cron';
import BotWasb from './bots/BotWasb';
import Borg from './bots/telegram/Borg';
import Borgy from './bots/telegram/Borgy';
import { sendErrorToTelegram } from './utils/telegram.js';

dotenv.config({ path: '.env.production' });

const port = Number(process.env.PORT) || 3000;

const server = http.createServer();

server.listen(port, async () => {
  try {
    // Every hour.
    cron.schedule('*/60 * * * *', async () => {
      await BotWasb();
    });

    // Every noon.
    cron.schedule('0 12 * * *', async () => {
      await Borg();
      await Borgy();
    });

    // // Every Wednesday at 3 p.m.
    // cron.schedule('0 15 * * 3', async () => {
    //   await Borg();
    // });

    // await Borgy(true);

    // // Polling.
    // setInterval(async () => {
    //   // await driver.get(driver.getCurrentUrl());
    //   // await new Promise(resolve => setTimeout(resolve, 2000));
    //   await Borgy(true);
    // }, 60000);

  } catch(e) {
    const errMsg = e.response ? e.response.body : e.message;
    console.error(new Date().toLocaleString('fr-FR') + ' An error occured : ' + errMsg);
    await sendErrorToTelegram(e, 'An error occured :');
  }
})