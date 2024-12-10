import { By, until } from 'selenium-webdriver';
import { sendErrorToTelegram } from '../utils/errorToTelegram.js';
import process from 'process';

const handlerError = async (e, driver, addErrorMsg) => {
  console.error(addErrorMsg + e);
  await driver.get(driver.getCurrentUrl());
  await sendErrorToTelegram(e, addErrorMsg, process.env.MONITORING_ID_BOT_WASB);
}

export const getValue = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.value) {
      const price = await driver.findElements(By.css('.coin-stats-header > div'));
      metrics.value = await price[1].getText();
      metrics.value = metrics.value.split("\n")[0]; // Take off variation get just value.

      if(maxLoop === 0) throw new Error(`Nb loop max in getValue ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' value is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} value on CoinMarketcap: `);
  }
}

export const getMarketCap = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.marketCap) {
      const marketCap = await driver.findElements(By.css('.CoinMetrics_overflow-content__tlFu7 > div'));
      metrics.marketCap = await marketCap[0].getText();

      if(maxLoop === 0) throw new Error(`Nb loop max in getMarketCap ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' marketCap is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} marketCap on CoinMarketcap: `);
  }
}

// Get 24h volume.
export const getVolume = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.volumeCoinMarketCap) {
      const coinMetrics = await driver.findElements(By.css('.CoinMetrics_overflow-content__tlFu7 > div'));
      metrics.volumeCoinMarketCap = await coinMetrics[1].getText();

      if(maxLoop === 0) throw new Error(`Nb loop max in getVolume ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' volume is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} volume on CoinMarketcap: `);
  }
}

// Get CEX and DEX 24h volume.
export const getCexAndDexVolume = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.volumeCex && !metrics.volumeDex) {
      const buttonDisplay = await driver.findElement(By.css('use[href="#chevronRight"]'));
      await driver.actions().move({origin: buttonDisplay}).perform();

      const cexAndDex = await driver.wait(until.elementsLocated(By.className('sc-71024e3e-0 htpYOz')), 2000);
      metrics.volumeCex = await cexAndDex[0].getText();
      metrics.volumeDex = await cexAndDex[1].getText();

      if(maxLoop === 0) throw new Error(`Nb loop max in getCexAndDexVolume ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' CEX and DEX volume is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} CEX and DEX volume on CoinMarketcap: `);
  }
}

// Get supply circulation.
export const getSupplyCirculation = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.supplyCirculation) {
      const supplyCirculation = await driver.findElements(By.css('.CoinMetrics_sib-content-wrapper__E8lu8 > div'));
      metrics.supplyCirculation = await supplyCirculation[8].getText();

      if(maxLoop === 0) throw new Error(`Nb loop max in getSupplyCirculation ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' supply circulation is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} supply circulation on CoinMarketcap: `);
  }
}

// Get 24h liquidity.
export const getLiquidity = async (metrics, driver, maxLoop, crypto) => {
  try {
    while(!metrics.liquidity) {
      const coinMetrics = await driver.findElements(By.css('.CoinMetrics_overflow-content__tlFu7'));
      metrics.liquidity = await coinMetrics[3].getText();

      if(maxLoop === 0) throw new Error(`Nb loop max in getLiquidity ${crypto}.`); 
      maxLoop--;
    }

    maxLoop = 5;
    console.log(crypto + ' liquidity is acquired.');
  } catch(e) {
    await handlerError(e, driver, `Error to get ${crypto} liquidity on CoinMarketcap: `);
  }
}