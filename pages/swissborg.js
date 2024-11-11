import { By } from 'selenium-webdriver';
import process from 'process';
import * as NumFormat from '../utils/numberFormatter.js';

// Click for accept cookie in Swissborg.
export const acceptCookieSwissborg = async (actions, driver) => {
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
export const getValueBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.value) {
      await new Promise(resolve => setTimeout(resolve, 2500));
      const iframe = await driver.findElement(By.css('.tradingview-widget-container > iframe'));
      await driver.switchTo().frame(iframe);
      const value = await driver.findElement(By.className('tv-widget-chart__price-value symbol-last'));
      borgMetrics.value = await value.getText();
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
export const getMarketCapBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.marketCap || borgMetrics.marketCap === 'N/A' || borgMetrics.marketCap === '') {
      const marketCap = await driver.findElement(By.css('.cell-3 > p'));
      borgMetrics.marketCap = await marketCap.getText();
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
export const getPremiumUserBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.premiumUser) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgMetrics.premiumUser = await card[1].getText();
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
export const getBorgLock = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.borgLock) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgMetrics.borgLock = await card[2].getText();
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
export const getSupplyCirculationBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.supplyCirculation) {
      const supplyCirculation = await driver.findElement(By.css('.cell-4 > p'));
      borgMetrics.supplyCirculation = await supplyCirculation.getText();
      borgMetrics.supplyCirculation = borgMetrics.supplyCirculation.split('S')[0];

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
export const getAumBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.aum) {
      await driver.actions()
      .scroll(0, 0, 0, 1000)
      .perform()
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aum = await driver.findElement(By.className('stat-2'));
      borgMetrics.aum = await aum.getText();

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

// Get community index BORG.
export const getCommunityIndexBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.communityIndex) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgMetrics.communityIndex = await card[3].getText();
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
export const getWeeklyVolumeAppBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.weeklyVolumeApp) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] h3'));

      borgMetrics.weeklyVolumeApp = await card[0].getText();
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

// Calcul difference between old value and new value.
export const calculVariation = (borgMetrics, oldBorgMetrics, variationBorgMetrics) => {
  const unit = ['K', 'M', 'B', 'T'];
  const marketCap = Number(borgMetrics.marketCap.split(' ')[1].replace(',', '.'));
  const oldMarketCap = Number(oldBorgMetrics.marketCap.split(' ')[1].replace(',', '.'));
  const unitSupplyCirculation = unit.find((u) => borgMetrics.supplyCirculation.includes(u));
  const unitOldSupplyCirculation = unit.find((u) => oldBorgMetrics.supplyCirculation.includes(u));
  const takeOffSpaceSupplyCirculation = borgMetrics.supplyCirculation.replace(',', '.').replace(unitSupplyCirculation, ' ').replace(' ', unitSupplyCirculation).trim();
  const takeOffSpaceOldSupplyCirculation = oldBorgMetrics.supplyCirculation.replace(',', '.').replace(unitOldSupplyCirculation, ' ').replace(' ', unitOldSupplyCirculation).trim();

  const supplyCirculation = NumFormat.convertNumberForCalcul(takeOffSpaceSupplyCirculation);
  const oldSupplyCirculation = NumFormat.convertNumberForCalcul(takeOffSpaceOldSupplyCirculation);
  const weeklyVolumeApp = NumFormat.convertNumberForCalcul(borgMetrics.weeklyVolumeApp);
  const oldWeeklyVolumeApp = NumFormat.convertNumberForCalcul(oldBorgMetrics.weeklyVolumeApp);
  const premiumUser = NumFormat.convertNumberForCalcul(borgMetrics.premiumUser);
  const oldPremiumUser = NumFormat.convertNumberForCalcul(oldBorgMetrics.premiumUser);
  const borgLock = NumFormat.convertNumberForCalcul(borgMetrics.borgLock);
  const oldBorgLock = NumFormat.convertNumberForCalcul(oldBorgMetrics.borgLock);
  const aum = NumFormat.convertNumberForCalcul(borgMetrics.aum);
  const oldAum = NumFormat.convertNumberForCalcul(oldBorgMetrics.aum);

  // Percent
  variationBorgMetrics.value = ((Number(borgMetrics.value) - Number(oldBorgMetrics.value)) / Number(oldBorgMetrics.value) * 100).toFixed(2);
  variationBorgMetrics.aum = ((aum - oldAum) / oldAum * 100).toFixed(2);
  variationBorgMetrics.marketCap = ((marketCap - oldMarketCap) / oldMarketCap * 100).toFixed(2);
  variationBorgMetrics.weeklyVolumeApp = ((weeklyVolumeApp - oldWeeklyVolumeApp) / oldWeeklyVolumeApp * 100).toFixed(2);

  variationBorgMetrics.premiumUser = premiumUser - oldPremiumUser;
  variationBorgMetrics.borgLock = borgLock - oldBorgLock;
  variationBorgMetrics.supplyCirculation = supplyCirculation - oldSupplyCirculation;
  variationBorgMetrics.communityIndex = Number(borgMetrics.communityIndex) - Number(oldBorgMetrics.communityIndex);
  variationBorgMetrics.communityIndex = Number.isInteger(variationBorgMetrics.communityIndex) ? variationBorgMetrics.communityIndex : variationBorgMetrics.communityIndex.toFixed(1);
  variationBorgMetrics.rank = Number(borgMetrics.rank) - Number(oldBorgMetrics.rank);
}