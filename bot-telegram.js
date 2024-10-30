import process from 'process'
import got from 'got';
import fs from 'node:fs';
import dotenv from 'dotenv';
import Metrics from "./metrics.js";
import * as Swissborg from './pages/swissborg.js';

dotenv.config({ path: '.env.production' });

async function BotTelegram() {
  const unitNumber = ['K', 'M', 'B', 'T'];
  const dataFile = fs.readFileSync('./old-value-borg.txt','utf8');
  let oldBorgInfo = JSON.parse(dataFile);
  let valueDifferenceBorgInfo = {
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
  const borgInfo = (await Metrics()).borg;

  fs.writeFile('./old-value-borg.txt', JSON.stringify(borgInfo), err => {
    if (err) {
      console.error('Error writting to file :' + err);
    } else {
      console.log('File written successfully.');
    }
  });
  Swissborg.calculateDifference(borgInfo, oldBorgInfo, valueDifferenceBorgInfo, unitNumber);
  await sendMessageToTelegram(borgInfo, oldBorgInfo, valueDifferenceBorgInfo);
}

const tranformValueForMarkdown = (borgInfo, oldBorgInfo, valueDifferenceBorgInfo) => {
  const propsBorgInfo = Object.keys(borgInfo);

  propsBorgInfo.forEach((prop) => {
    valueDifferenceBorgInfo[prop] = String(valueDifferenceBorgInfo[prop]);

    if(borgInfo[prop].includes('.')) borgInfo[prop] = borgInfo[prop].replace('.', ',');
    if(oldBorgInfo[prop].includes('.')) oldBorgInfo[prop] = oldBorgInfo[prop].replace('.', ',');
    if(valueDifferenceBorgInfo[prop].includes('.')) valueDifferenceBorgInfo[prop] = valueDifferenceBorgInfo[prop].replace('.', ',');

    if(borgInfo[prop].includes(',')) borgInfo[prop] = borgInfo[prop].replace(',', ',');
    if(oldBorgInfo[prop].includes(',')) oldBorgInfo[prop] = oldBorgInfo[prop].replace(',', ',');

    if(prop === 'rank' && valueDifferenceBorgInfo.rank != 0) {
      if(valueDifferenceBorgInfo[prop].includes('-')) valueDifferenceBorgInfo[prop] = valueDifferenceBorgInfo[prop].replace('-', '\\%2B'); // Convert '-' to '+' for work with markdownV2.
      else valueDifferenceBorgInfo[prop] = '\\-' + valueDifferenceBorgInfo[prop]; // Convert '+' to '-' for work with markdownV2.
    } else {
      if(valueDifferenceBorgInfo[prop].includes('-')) valueDifferenceBorgInfo[prop] = valueDifferenceBorgInfo[prop].replace('-', '\\-');
      else valueDifferenceBorgInfo[prop] = '\\%2B' + valueDifferenceBorgInfo[prop];
    }
  })
}
// Function to send a message to Telegram.
const sendMessageToTelegram = async (borgInfo, oldBorgInfo, valueDifferenceBorgInfo) => {
  try {
    tranformValueForMarkdown(borgInfo, oldBorgInfo, valueDifferenceBorgInfo);

    const msgTelegram = "\\*\\**BORG UPDATE QUOTIDIEN*\\*\\*%0A%0A" +
                        `Prix actuel :%0A ${oldBorgInfo.value}$ \\-\\-\\> ${borgInfo.value}$ \\(${valueDifferenceBorgInfo.value}%\\)%0A%0A` +
                        `Market Cap :%0A ${oldBorgInfo.marketCap} \\-\\-\\> ${borgInfo.marketCap} \\(${valueDifferenceBorgInfo.marketCap}%\\)%0A%0A` +
                        `Utilisateurs premium :%0A ${oldBorgInfo.premiumUser} \\-\\-\\> ${borgInfo.premiumUser} \\(${valueDifferenceBorgInfo.premiumUser}%\\)%0A%0A` +
                        `BORG bloqués :%0A ${oldBorgInfo.borgLock} \\-\\-\\> ${borgInfo.borgLock} \\(${valueDifferenceBorgInfo.borgLock}%\\)%0A%0A` +
                        `Offre en circulation :%0A ${oldBorgInfo.supplyCirculation} \\-\\-\\> ${borgInfo.supplyCirculation} \\(${valueDifferenceBorgInfo.supplyCirculation}%\\)%0A%0A` +
                        `Volume sur l'app \\(semaine\\) :%0A ${oldBorgInfo.weeklyVolumeApp} \\-\\-\\> ${borgInfo.weeklyVolumeApp} \\(${valueDifferenceBorgInfo.weeklyVolumeApp}%\\)%0A%0A` +
                        `Actifs sous gestion :%0A ${oldBorgInfo.aum} \\-\\-\\> ${borgInfo.aum} \\(${valueDifferenceBorgInfo.aum}%\\)%0A%0A` +
                        `Rang CoinGecko :%0A ${oldBorgInfo.rank} \\-\\-\\> ${borgInfo.rank} \\(${valueDifferenceBorgInfo.rank}\\)%0A%0A` +
                        `Community index :%0A ${oldBorgInfo.communityIndex} \\-\\-\\> ${borgInfo.communityIndex} \\(${valueDifferenceBorgInfo.communityIndex}\\)`;

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