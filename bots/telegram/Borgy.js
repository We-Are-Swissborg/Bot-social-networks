import process from 'process'
import dotenv from 'dotenv';
import { sendErrorToTelegram, sendMessageWithPhotoToTelegram } from '../../utils/telegram.js';
import FR from '../../translations/fr.js';
import EN from '../../translations/en.js';
dotenv.config({ path: '../../env.production' });

const date = new Date();

async function Borgy(isPolling = false) {
  const voteSendTime = 12;
  try {
    if(date.getHours() == voteSendTime && !isPolling) {
      const photoVoteMessage = 'AgACAgQAAyEFAASLu9f3AAJJuWiaxNNCIuulCdOqcMxie19g55QlAAKJzDEblyPYUC9tVrb7PuMKAQADAgADbQADNgQ';
      const frVoteMessage = FR['vote-message'];
      const enVoteMessage = EN['vote-message'];

      await sendMessageWithPhotoToTelegram(process.env.ID_FR_THREAD, photoVoteMessage, frVoteMessage, 'Vote');
      await sendMessageWithPhotoToTelegram(process.env.ID_EN_THREAD, photoVoteMessage, enVoteMessage, 'Vote');
    } else {
      // let transfer = {
      //   signature: '',
      //   amount: '',
      //   value: '',
      //   buyPrice: '',
      //   txLink: '',
      //   marketCap: ''
      // }
    };
  } catch(e) {
    console.error(e);
    await sendErrorToTelegram(e);
  }
}

Borgy();