import { Builder, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import got from 'got';
import process from 'process';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

async function Bot() {
  const options = new chrome.Options();

  options.addArguments('--headless');
  // options.addArguments('--disable-gpu'); // Applicable only for Windows OS
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  options.addArguments('accept-language=en-US,en;q=0.9');
  // options.addArguments('window-size=1920,1080');
  options.addArguments('--disable-blink-features=AutomationControlled');

  const driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();
  const actions = driver.actions({async: true});
  const dataFile = fs.readFileSync('./old-value-borg.txt','utf8');
  let borgInfo = {
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
  let maxLoop = 5; // Use for return a error if data not found after loop equal 5.
  const unitNumber = ['K', 'M', 'B', 'T'];

  //Page https://swissborg.com/borg-overview
  await driver.get('https://swissborg.com/borg-overview');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await acceptCookieSwissborg(actions, driver);
  await getValueBorg(borgInfo, driver, maxLoop);
  await getWeeklyVolumeAppBorg(borgInfo, driver, maxLoop);
  await getPremiumUserBorg(borgInfo, driver, maxLoop);
  await getBorgLock(borgInfo, driver, maxLoop);
  await getCommunityIndexBorg(borgInfo, driver, maxLoop);

  //Page https://swissborg.com/fr/marche-crypto/coins/swissborg-token
  await driver.get('https://swissborg.com/fr/marche-crypto/coins/swissborg-token');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await getMarketCapBorg(borgInfo, driver, maxLoop);
  await getSupplyCirculationBorg(borgInfo, driver, maxLoop);
  
  //Page https://swissborg.com/about
  await driver.get('https://swissborg.com/about');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await getAumBorg(borgInfo, driver, maxLoop);

  //Page https://swissborg.com/about
  await driver.get('https://www.coingecko.com/en/coins/swissborg');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await getRankBorg(borgInfo, driver, maxLoop);

  await driver.quit();
  fs.writeFile('./old-value-borg.txt', JSON.stringify(borgInfo), err => {
    if (err) {
      console.error('Error writting to file :' + err);
    } else {
      console.log('File written successfully.');
    }
  });
  calculateDifference(borgInfo, oldBorgInfo, valueDifferenceBorgInfo, unitNumber);
  await sendMessageToTelegram(borgInfo, oldBorgInfo, valueDifferenceBorgInfo);
}

// Click for accept cookie in Swissborg.
const acceptCookieSwissborg = async (actions, driver) => {
  try {
    const cookieButtons = await driver.findElements(By.className('cookieBox__SButton-sc-v30xwb-5'));
    await actions.move({origin: cookieButtons[1]}).click().perform();
  } catch(e) {
    await driver.quit();
    console.error('Error with cookie button :' + e);
    process.exit(-1);
  }
}

// Get value of the BORG.
const getValueBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.value) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const iframe = await driver.findElement(By.css('.tradingview-widget-container > iframe'));
      await driver.switchTo().frame(iframe);
      const value = await driver.findElement(By.className('tv-widget-chart__price-value symbol-last'));
      borgInfo.value = await value.getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getValueBorg.'); 
      maxLoop--;
    }

    maxLoop = 5;
    await driver.switchTo().defaultContent();
    console.log('Value BORG is acquired.');
  } catch(e) {
    console.error('Error for get value BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get marketCap BORG.
const getMarketCapBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.marketCap) {
      const marketCap = await driver.findElement(By.css('.cell-3 > p'));
      borgInfo.marketCap = await marketCap.getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getMarketCapBorg.');
      maxLoop--;
    }
    
    maxLoop = 5;
    console.log('MarketCap BORG is acquired.');
  } catch(e) {
    console.error('Error for get marketCap BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get prenium user BORG.
const getPremiumUserBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.premiumUser) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgInfo.premiumUser = await card[1].getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getPremiumUserBorg.');
      maxLoop--;
    }
    
    maxLoop = 5;
    console.log('Nb prenium user BORG is acquired.');
  } catch(e) {
    console.error('Error for get nb prenium user BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get BORG blocked by user.
const getBorgLock = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.borgLock) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgInfo.borgLock = await card[2].getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getBorgLock.');
      maxLoop--;
    }
    
    maxLoop = 5;
    console.log('Nb BORG lock is acquired.');
  } catch(e) {
    console.error('Error for get nb BORG lock :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get supply in circulation.
const getSupplyCirculationBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.supplyCirculation) {
      const supplyCirculation = await driver.findElement(By.css('.cell-4 > p'));
      borgInfo.supplyCirculation = await supplyCirculation.getText();
      borgInfo.supplyCirculation = borgInfo.supplyCirculation.split('S')[0];

      if(maxLoop === 0) throw new Error('Nb loop max in getSupplyCirculationBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Nb supply in circulation is acquired.');
  } catch(e) {
    console.error('Error for get nb supply in circulation BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get AUM BORG.
const getAumBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.aum) {
      await driver.actions()
      .scroll(0, 0, 0, 1000)
      .perform()
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aum = await driver.findElement(By.className('stat-2'));
      borgInfo.aum = await aum.getText();

      if(maxLoop === 0) throw new Error('Nb loop max in getAumBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('AUM is acquired.');
  } catch(e) {
    console.error('Error for get AUM BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get rank BORG.
const getRankBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.rank) {
      const rank = await driver.findElement(By.css('[data-coin-show-target="staticCoinPrice"] div > span > div'));
      borgInfo.rank = await rank.getText();
      borgInfo.rank = borgInfo.rank.split('#')[1];

      if(maxLoop === 0) throw new Error('Nb loop max in getRankBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Rank is acquired.');
  } catch(e) {
    console.error('Error for get rank BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get community index BORG.
const getCommunityIndexBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.communityIndex) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgInfo.communityIndex = await card[3].getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getCommunityIndexBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Community index BORG is acquired.');
  } catch(e) {
    console.error('Error for get community index BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

// Get weekly volume app BORG.
const getWeeklyVolumeAppBorg = async (borgInfo, driver, maxLoop) => {
  try {
    while(!borgInfo.weeklyVolumeApp) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgInfo.weeklyVolumeApp = await card[0].getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getWeeklyVolumeAppBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Weekly volume app BORG is acquired.');
  } catch(e) {
    console.error('Error for weekly volume app BORG :' + e);
    await driver.quit();
    process.exit(-1);
  }
}

const checkUnitNumber = (value, unitNumber) => {
  const unit = unitNumber.find((u) => value.includes(u));
  return Number(value.split(unit)[0]);

}

// Tranform value in percentage.
const calculateDifference = (borgInfo, oldBorgInfo, valueDifferenceBorgInfo, unitNumber) => {
  const marketCap = Number(borgInfo.marketCap.split(' ')[1].replace(',', '.'));
  const oldMarketCap = Number(oldBorgInfo.marketCap.split(' ')[1].replace(',', '.'));
  // const lengthPremiumUser = String(borgInfo.premiumUser).length - 2;
  // const lengthOldPremiumUser = String(oldBorgInfo.premiumUser).length - 2;
  const weeklyVolumeApp = checkUnitNumber(borgInfo.weeklyVolumeApp, unitNumber);
  const oldWeeklyVolumeApp = checkUnitNumber(oldBorgInfo.weeklyVolumeApp, unitNumber);
  const premiumUser = checkUnitNumber(borgInfo.premiumUser, unitNumber);
  const oldPremiumUser = checkUnitNumber(oldBorgInfo.premiumUser, unitNumber);
  // const premiumUser = Number(borgInfo.premiumUser.slice(0, lengthPremiumUser));
  // const oldPremiumUser = Number(oldBorgInfo.premiumUser.slice(0, lengthOldPremiumUser));
  const borgLock = checkUnitNumber(borgInfo.borgLock, unitNumber);
  const oldBorgLock = checkUnitNumber(oldBorgInfo.borgLock, unitNumber);
  const supplyCirculation = Number(borgInfo.supplyCirculation.split(' ')[0].replace(',', '.'));
  const oldSupplyCirculation = Number(oldBorgInfo.supplyCirculation.split(' ')[0].replace(',', '.'));
  const aum = checkUnitNumber(borgInfo.aum, unitNumber);
  const oldAum = checkUnitNumber(oldBorgInfo.aum, unitNumber);

  valueDifferenceBorgInfo.value = ((Number(borgInfo.value) - Number(oldBorgInfo.value)) / Number(oldBorgInfo.value) * 100).toFixed(2);
  valueDifferenceBorgInfo.marketCap = ((marketCap - oldMarketCap) / oldMarketCap * 100).toFixed(2);
  valueDifferenceBorgInfo.premiumUser = ((premiumUser - oldPremiumUser) / oldPremiumUser * 100).toFixed(2);
  valueDifferenceBorgInfo.borgLock = ((borgLock - oldBorgLock) / oldBorgLock * 100).toFixed(2);
  valueDifferenceBorgInfo.supplyCirculation = ((supplyCirculation - oldSupplyCirculation) / oldSupplyCirculation * 100).toFixed(2);
  valueDifferenceBorgInfo.aum = ((aum - oldAum) / oldAum * 100).toFixed(2);
  valueDifferenceBorgInfo.rank = Number(borgInfo.rank) - Number(oldBorgInfo.rank);
  valueDifferenceBorgInfo.communityIndex = Number(borgInfo.communityIndex) - Number(oldBorgInfo.communityIndex);
  valueDifferenceBorgInfo.weeklyVolumeApp = ((weeklyVolumeApp - oldWeeklyVolumeApp) / oldWeeklyVolumeApp * 100).toFixed(2);
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

Bot();