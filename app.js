import http from 'node:http';
import dotenv from 'dotenv';
import process from 'process';
import cron from 'node-cron';
import BotWasb from './bots/BotWasb.js';
import Borg from './bots/telegram/Borg.js';
import Borgy from './bots/telegram/Borgy.js';
import { sendErrorToTelegram } from './utils/telegram.js';

dotenv.config({ path: '.env.production' });

const port = Number(process.env.PORT) || 3000;

const server = http.createServer();

server.listen(port, async () => {
  try {
    console.log('Server run');

    // Every hour.
    const everyHour = cron.schedule('*/60 * * * *', async () => {
      console.log('Task every hour actived');
      await BotWasb();
    });

    // Every noon.
    const everyNoon = cron.schedule('0 12 * * *', async () => {
      console.log('Task every noon actived');
      await Borg();
      await Borgy();
    });

    await everyHour.start();
    await everyNoon.start();

    // // Every Wednesday at 3 p.m.
    // cron.schedule('0 15 * * 3', async () => {
    //   console.log('Task every Wednesday at 3 p.m actived');
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