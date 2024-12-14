import { By } from 'selenium-webdriver';
import { sendErrorToTelegram } from '../utils/errorToTelegram.js';
import process from 'process';

const handlerError = async (e, driver, addErrorMsg) => {
  console.error(addErrorMsg + e);
  await driver.get(driver.getCurrentUrl());
  await sendErrorToTelegram(e, addErrorMsg, process.env.MONITORING_ID_BOT_WASB);
}

const getValueTab = async (driver) => await driver.findElements(By.css('tbody')); 

export const getMarketCap = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.marketCap) {
      const valueTab = await getValueTab(driver);
      const marketCap = await valueTab[1].findElements(By.css('td'));
      metrics.marketCap = await marketCap[0].getText()
      if(metrics.marketCap) metrics.marketCap = metrics.marketCap.replaceAll(',', '');

      if(maxLoop === 0) throw new Error(`Nb loop max in getMarketCap ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' marketCap is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} marketCap on CoinGecko: `);
  }
}

// Get 24h volume.
export const getVolume = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.volumeCoinGecko) {
      const valueTab = await getValueTab(driver);
      const volume = await valueTab[1].findElements(By.css('td'));
      metrics.volumeCoinGecko = await volume[3].getText();

      if(maxLoop === 0) throw new Error(`Nb loop max in getVolume ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' volume is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} volume on CoinGecko: `);
  }
}

// Get supply circulation.
export const getSupplyCirculation = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.supplyCirculation) {
      const valueTab = await getValueTab(driver);
      const supplyCirculation = await valueTab[1].findElements(By.css('td'));
      metrics.supplyCirculation = await supplyCirculation[4].getText();
      if(metrics.supplyCirculation) metrics.supplyCirculation = metrics.supplyCirculation.replaceAll(',', '');

      if(maxLoop === 0) throw new Error(`Nb loop max in getSupplyCirculation ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' supply circulation is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} supply circulation on CoinGecko: `);
  }
}

// Get max supply.
export const getMaxSupply = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.maxSupply) {
      const valueTab = await getValueTab(driver);
      const maxSupply = await valueTab[1].findElements(By.css('td'));
      metrics.maxSupply = await maxSupply[6].getText();

      if(maxLoop === 0) throw new Error(`Nb loop max in getMaxSupply ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' maxSupply is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} maxSupply on CoinGecko: `);
  }
}

// Get rank crypto.
export const getRank = async (crypto, driver, maxLoop) => {
  try {
    while(!crypto.rank) {
      const rank = await driver.findElement(By.css('[data-coin-show-target="staticCoinPrice"] div > span > div'));
      crypto.rank = await rank.getText();
      crypto.rank = crypto.rank.split('#')[1];

      if(maxLoop === 0) throw new Error('Nb loop max in getRank.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Rank is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error for get rank: ');
  }
}