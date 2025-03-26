import process from 'process'
import got from 'got';
import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import Metrics from "./metrics.js";
import * as Swissborg from './pages/swissborg.js';
import * as NumFormat from './utils/numberFormatter.js';
import { sendErrorToTelegram } from "./utils/errorToTelegram.js";

dotenv.config({ path: '.env.production' });
const date = new Date();

async function BotTelegram() {
  try {
    const dataFile = await fs.readFile('./old-value-telegram.txt','utf8');
    let oldBorgMetrics = JSON.parse(dataFile);
    let borgMetrics = {
      value: '',
      marketCap: '',
      userVerify: '',
      premiumUser: '',
      borgLock: '',
      supplyCirculation: '',
      aum: '',
      rank: '',
      volumeCoinGecko: '',
    }
    let variationBorgMetrics = {...borgMetrics};
    borgMetrics = await Metrics(borgMetrics);

    await fs.writeFile('./old-value-telegram.txt', JSON.stringify(borgMetrics));

    Swissborg.calculVariation(borgMetrics, oldBorgMetrics, variationBorgMetrics);
    await sendMetrics(borgMetrics, oldBorgMetrics, variationBorgMetrics);
  } catch(e) {
    console.error(e);
    await sendErrorToTelegram(e);
    process.exit(-1);
  }
}

const tranformValueForMarkdown = (borgMetrics, oldBorgMetrics, variationBorgMetrics) => {
  const propsBorgInfo = Object.keys(borgMetrics);

  propsBorgInfo.forEach((prop) => {
    variationBorgMetrics[prop] = String(variationBorgMetrics[prop]);

    if(borgMetrics[prop] && oldBorgMetrics[prop] && variationBorgMetrics[prop]) {
      if(borgMetrics[prop].includes('.')) borgMetrics[prop] = borgMetrics[prop].replace('.', ',');
      if(oldBorgMetrics[prop].includes('.')) oldBorgMetrics[prop] = oldBorgMetrics[prop].replace('.', ',');
      if(variationBorgMetrics[prop].includes('.')) variationBorgMetrics[prop] = variationBorgMetrics[prop].replace('.', ',');

      if(borgMetrics[prop].includes(',')) borgMetrics[prop] = borgMetrics[prop].replace(',', ',');
      if(oldBorgMetrics[prop].includes(',')) oldBorgMetrics[prop] = oldBorgMetrics[prop].replace(',', ',');

      if(prop === 'rank' && variationBorgMetrics.rank != 0) {
        if(variationBorgMetrics[prop].includes('-')) variationBorgMetrics[prop] = variationBorgMetrics[prop].replace('-', '\\%2B'); // Convert '-' to '+' for work with markdownV2.
        else variationBorgMetrics[prop] = '\\-' + variationBorgMetrics[prop]; // Convert '+' to '-' for work with markdownV2.
      } else {
        if(variationBorgMetrics[prop].includes('-')) variationBorgMetrics[prop] = variationBorgMetrics[prop].replace('-', '\\-');
        else variationBorgMetrics[prop] = '\\%2B' + variationBorgMetrics[prop];
      }
    }
  })
}

const aroundValue = (value) => {
  let valueAround = value;
  if(value) {
    valueAround = Number(value.replace(',', '.')).toFixed(4);
    valueAround = String(valueAround).replace('.', ',');
  }
  return valueAround;
}

// Function to send a metrics message to Telegram.
const sendMetrics = async (borgMetrics, oldBorgMetrics, variationBorgMetrics) => {
  const value = aroundValue(borgMetrics.value);
  const oldValue = aroundValue(oldBorgMetrics.value);

  try {
    tranformValueForMarkdown(borgMetrics, oldBorgMetrics, variationBorgMetrics);

    const msgTelegram = "🟢 $BORG %26 SWISSBORG MÉTRICS 🟢%0A%0A" +
                        `• Prix actuel 💲%0A ${oldValue}$ \\-\\-\\> ${value}$ \\(${variationBorgMetrics.value}%\\)%0A%0A` +
                        `• Market Cap Ⓜ️%0A $ ${oldBorgMetrics.marketCap} \\-\\-\\> $ ${borgMetrics.marketCap} \\(${variationBorgMetrics.marketCap}%\\)%0A%0A` +
                        `• Utilisateurs vérifiés ✅%0A ${oldBorgMetrics.userVerify} \\-\\-\\> ${borgMetrics.userVerify} \\(${NumFormat.abbreviateNumber(variationBorgMetrics.userVerify)}\\)%0A%0A` +
                        `• Utilisateurs premium ✍️%0A ${oldBorgMetrics.premiumUser} \\-\\-\\> ${borgMetrics.premiumUser} \\(${NumFormat.abbreviateNumber(variationBorgMetrics.premiumUser)}\\)%0A%0A` +
                        `• BORG bloqués 🔒%0A ${oldBorgMetrics.borgLock} \\-\\-\\> ${borgMetrics.borgLock} \\(${NumFormat.abbreviateNumber(variationBorgMetrics.borgLock)}\\)%0A%0A` +
                        `• Offre en circulation 💸%0A ${oldBorgMetrics.supplyCirculation} \\-\\-\\> ${borgMetrics.supplyCirculation} \\(${NumFormat.abbreviateNumber(variationBorgMetrics.supplyCirculation)}\\)%0A%0A` +
                        `• Volume CoinGecko \\(24h\\) 📊%0A $ ${oldBorgMetrics.volumeCoinGecko} \\-\\-\\> $ ${borgMetrics.volumeCoinGecko} \\(${variationBorgMetrics.volumeCoinGecko}%\\)%0A%0A` +
                        `• Actifs sous gestion 💵%0A ${oldBorgMetrics.aum} \\-\\-\\> ${borgMetrics.aum} \\(${variationBorgMetrics.aum}%\\)%0A%0A` +
                        `• Rang CoinGecko 🦎%0A ${oldBorgMetrics.rank} \\-\\-\\> ${borgMetrics.rank} \\(${variationBorgMetrics.rank}\\)%0A%0A` +
                        `*_Message généré par WASBot_*\\.`;

    const responseTelegram = await got.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage?chat_id=${process.env.ID_CHAT_TG}&text=${msgTelegram}&parse_mode=MarkdownV2`, {
      headers: {
        accept: 'application/x-www-form-urlencoded'
      }
    });

    // Print the response
    console.log(date + ' Message to Telegram successfully:', responseTelegram.body);
    process.exit();
  } catch (error) {
    console.error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
    throw new Error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
  }
}

// Function to send a meetup message to Telegram.
// const sendMeetup = async () => {
//   const meet = [
//     {
//       place: 'Paris 🇫🇷',
//       date: undefined,
//       hour: '19h00\\-22h00',
//       contact: 'napsborgmeetup@gmail\\.com'
//     },
//     {
//       place: 'Belgique 🇧🇪',
//       date: undefined,
//       hour: '19h00\\-23h00',
//       contact: 'https://x\\.com/BeauLent1'
//     },
//     {
//       place: 'Lorient 🇫🇷',
//       date: undefined,
//       hour: '18h00\\-22h00',
//       contact: 'mikzo@hotmail\\.fr'
//     },
//   ];

//   let msgTelegram = "📅 WeAreSwissborg Meeting 📅%0A%0A";

//   try {
//     // tranformValueForMarkdown(borgMetrics, oldBorgMetrics, variationBorgMetrics);
//     meet.forEach(m => {
//       msgTelegram = msgTelegram +
//       `Lieu: ${m.place}%0A` +
//       `Date: m\\.date%0A` +
//       `Heure: ${m.hour}%0A` +
//       `Contact: ${m.contact}%0A%0A`;
//     });

//     msgTelegram += `*_Message généré par WASBot_*\\.`;
//     const responseTelegram = await got.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage?chat_id=${process.env.ID_CHAT_TG}&text=${msgTelegram}&parse_mode=MarkdownV2`, {
//       headers: {
//         accept: 'application/x-www-form-urlencoded'
//       }
//     });

//     // Print the response
//     console.log(date + ' Message to Telegram successfully:', responseTelegram.body);
//     process.exit();
//   } catch (error) {
//     console.error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
//     throw new Error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
//   }
// }

// const getUpdates = async () => {
//   const date = new Date();

//   try {
//     const answerTelegram = await got.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/getUpdates`, {
//       headers: {
//         accept: 'application/x-www-form-urlencoded'
//       }
//     });
//     console.log(date + ' Message to Telegram successfully:', answerTelegram.body);
//   } catch (error) {
//     console.error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
//     throw new Error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
//   }
// }

// sendMeetup()
// getUpdates()
BotTelegram();