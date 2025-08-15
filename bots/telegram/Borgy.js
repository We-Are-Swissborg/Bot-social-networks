import process from 'process'
import dotenv from 'dotenv';
import { sendErrorToTelegram, sendMessageWithPhotoToTelegram } from '../../utils/telegram.js';
import FR from '../../translations/fr.js';
import EN from '../../translations/en.js';
import getTransfers from '../../pages/solscan.js';
import { formatValue } from '../../utils/numberFormatter.js';

dotenv.config({ path: '../../.env.production' });

const date = new Date();
const isCronJob = !!process.argv[2];

// Condition for run a cron job.
if(isCronJob) Borgy();

async function Borgy() {
  const voteSendTime = 12;
  try {
    if(date.getHours() == voteSendTime) {
      const voteMessages = [
        {idThread: process.env.ID_FR_THREAD, message: FR['vote-message']},
        {idThread: process.env.ID_EN_THREAD, message: EN['vote-message']}
      ]

      const infosForTelegram = {
        botToken: process.env.BORGY_TG_TOKEN,
        chatId: process.env.ID_CHAT_BORGY_TG,
        idPhoto: 'AgACAgQAAyEFAASLu9f3AAJJuWiaxNNCIuulCdOqcMxie19g55QlAAKJzDEblyPYUC9tVrb7PuMKAQADAgADbQADNgQ',
        idThreadTelegram: '',
        message: '',
        about: 'Vote',
      }

      voteMessages.forEach(async (data) => {
        infosForTelegram.idThreadTelegram = data.idThread;
        infosForTelegram.message = data.message;
        await sendMessageWithPhotoToTelegram(infosForTelegram);
      })
    } else {
      throw new Error("It's not time to send Borgy vote.");
    }
  } catch(e) {
    console.error(e);
    await sendErrorToTelegram(e);
  }
}

async function BorgyPolling(driver, isFirstReq) {
  try {
    const awaitPage = async () => await new Promise(resolve => setTimeout(resolve, 2000));
    let transfers = [];
    const buyMessages = [
      {idThread: process.env.ID_FR_THREAD, message: (data) => FR['buy-message'](data)},
      {idThread: process.env.ID_EN_THREAD, message: (data) => EN['buy-message'](data)}
    ]
    let isReqAlreadyDone = false; // For don't have many messages after an error 'Too Many Requests'.

    if(isFirstReq) {
      await driver.get('https://solscan.io/token/BorGY4ub2Fz4RLboGxnuxWdZts7EKhUTB624AFmfCgX?activity_type=ACTIVITY_TOKEN_SWAP&page_size=10&value=300&value=#defiactivities');
      await awaitPage();
      transfers = await getTransfers(driver);
    } else {
      await driver.get(driver.getCurrentUrl());
      await awaitPage()
      transfers = await getTransfers(driver);
    }

    transfers.forEach((swap) => {
      const infosForTelegram = {
        botToken: process.env.BORGY_TG_TOKEN,
        chatId: process.env.ID_CHAT_BORGY_TG,
        idPhoto: 'AgACAgQAAyEFAASLu9f3AAJLRWievaNj8u1QT6Di1hiBWGXQLSd4AAIFyDEbm6_4UOibMDiBTIVqAQADAgADcwADNgQ',
        idThreadTelegram: '',
        message: '',
        about: 'Buy',
      }

      const propSwap = Object.keys(swap);

      propSwap.forEach((prop) => {
        if(swap[prop].toString().includes('.') && prop != 'amount' && prop != 'priceWithoutFee') {
          swap[prop] = swap[prop].toString().replaceAll('.', '\\.')
        };
      })
      swap.amount = formatValue(swap.amount).replace('$', '');
      swap.value = swap.value.replace('$', '');
      swap.priceWithoutFee = Number(swap.priceWithoutFee).toFixed(8);
      
      if(swap.amount.includes('.')) swap.amount = swap.amount.toString().replaceAll('.', '\\.');
      if(swap.priceWithoutFee.includes('.')) swap.priceWithoutFee = swap.priceWithoutFee.toString().replaceAll('.', '\\.');
      
      buyMessages.forEach(async (data) => {
        try {
          infosForTelegram.idThreadTelegram = data.idThread;
          infosForTelegram.message = data.message(swap);

          await sendMessageWithPhotoToTelegram(infosForTelegram);
        } catch(e) {
          if(e.error_code == '429' && !isReqAlreadyDone) {
            await sendErrorToTelegram(e, 'Buy messages :', process.env.BORGY_TG_TOKEN)
            isReqAlreadyDone = true;
            console.error(e);
          };
          console.error(e);
        }
      })
    });
  } catch(e) {
    console.error(e);
  }
}

export default BorgyPolling;