import process from 'process'
import got from 'got';
import fs from 'node:fs';
import dotenv from 'dotenv';
import Metrics from "./metrics.js";
import * as Swissborg from './pages/swissborg.js';

dotenv.config({ path: '.env.production' });

async function BotTelegram() {
  const dataFile = fs.readFileSync('./old-value-telegram.txt','utf8');
  let oldBorgMetrics = JSON.parse(dataFile);
  let variationBorgMetrics = {
    value: '',
    marketCap: '',
    premiumUser: '',
    borgLock: '',
    supplyCirculation: '',
    aum: '',
    rank: '',
    communityIndex: '',
    weeklyVolumeApp: ''
  };
  const borgMetrics = (await Metrics()).borg;

  fs.writeFile('./old-value-telegram.txt', JSON.stringify(borgMetrics), err => {
    if (err) {
      console.error('Error writting to file :' + err);
    } else {
      console.log('File written successfully.');
    }
  });
  Swissborg.calculVariation(borgMetrics, oldBorgMetrics, variationBorgMetrics);
  await sendMessageToTelegram(borgMetrics, oldBorgMetrics, variationBorgMetrics);
}

const tranformValueForMarkdown = (borgMetrics, oldBorgMetrics, variationBorgMetrics) => {
  const propsBorgInfo = Object.keys(borgMetrics);

  propsBorgInfo.forEach((prop) => {
    variationBorgMetrics[prop] = String(variationBorgMetrics[prop]);

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
  })
}
// Function to send a message to Telegram.
const sendMessageToTelegram = async (borgMetrics, oldBorgMetrics, variationBorgMetrics) => {
  try {
    tranformValueForMarkdown(borgMetrics, oldBorgMetrics, variationBorgMetrics);

    const msgTelegram = "\\*\\**BORG UPDATE QUOTIDIEN*\\*\\*%0A%0A" +
                        `Prix actuel :%0A ${oldBorgMetrics.value}$ \\-\\-\\> ${borgMetrics.value}$ \\(${variationBorgMetrics.value}%\\)%0A%0A` +
                        `Market Cap :%0A ${oldBorgMetrics.marketCap} \\-\\-\\> ${borgMetrics.marketCap} \\(${variationBorgMetrics.marketCap}%\\)%0A%0A` +
                        `Utilisateurs premium :%0A ${oldBorgMetrics.premiumUser} \\-\\-\\> ${borgMetrics.premiumUser} \\(${variationBorgMetrics.premiumUser}%\\)%0A%0A` +
                        `BORG bloqués :%0A ${oldBorgMetrics.borgLock} \\-\\-\\> ${borgMetrics.borgLock} \\(${variationBorgMetrics.borgLock}%\\)%0A%0A` +
                        `Offre en circulation :%0A ${oldBorgMetrics.supplyCirculation} \\-\\-\\> ${borgMetrics.supplyCirculation} \\(${variationBorgMetrics.supplyCirculation}%\\)%0A%0A` +
                        `Volume sur l'app \\(semaine\\) :%0A ${oldBorgMetrics.weeklyVolumeApp} \\-\\-\\> ${borgMetrics.weeklyVolumeApp} \\(${variationBorgMetrics.weeklyVolumeApp}%\\)%0A%0A` +
                        `Actifs sous gestion :%0A ${oldBorgMetrics.aum} \\-\\-\\> ${borgMetrics.aum} \\(${variationBorgMetrics.aum}%\\)%0A%0A` +
                        `Rang CoinGecko :%0A ${oldBorgMetrics.rank} \\-\\-\\> ${borgMetrics.rank} \\(${variationBorgMetrics.rank}\\)%0A%0A` +
                        `Community index :%0A ${oldBorgMetrics.communityIndex} \\-\\-\\> ${borgMetrics.communityIndex} \\(${variationBorgMetrics.communityIndex}\\)`;

    const responseTelegram = await got.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage?chat_id=${process.env.ID_CHAT_TG}&text=${msgTelegram}&parse_mode=MarkdownV2`, {
      headers: {
        accept: 'application/x-www-form-urlencoded'
      }
    });

    // Print the response
    console.log('Message to Telegram successfully:', responseTelegram.body);
  } catch (error) {
    console.error('Error message to telegram:', error.response ? error.response.body : error);
  } finally {
    process.exit();
  }
}

BotTelegram();