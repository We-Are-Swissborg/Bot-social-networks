import { By } from 'selenium-webdriver';
import * as NumFormat from '../utils/numberFormatter.js';
import { sendErrorToTelegram } from '../utils/errorToTelegram.js';

const handlerError = async (e, driver, addErrorMsg) => {
  console.error(addErrorMsg + e);
  await driver.get(driver.getCurrentUrl());
  await sendErrorToTelegram(e, addErrorMsg);
}

// Click for accept cookie in Swissborg.
export const acceptCookieSwissborg = async (driver) => {
  try {
    const cookieButtons = await driver.findElements(By.className('cookieBox__SButton-sc-v30xwb-5'));
    await cookieButtons[1].click();
  } catch(e) {
    console.error('Error with cookie button :' + e);
    throw new Error('Error with cookie button :' + e);
  }
}

// Get value of the BORG.
export const getValueBorg = async (borgMetrics, driver, maxLoop, quitFrame = true) => {
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
    quitFrame && await driver.switchTo().defaultContent();
    console.log('Value BORG is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get value BORG :');
  }
}

// Get value BORG vs BTC.
export const getBorgVsBtc = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.vsBtc) {
      const cookieButtons = await driver.findElements(By.id('BITFINEX:BORGBTC'));
      await cookieButtons[0].click();
      const valueFrameBorgVs = await driver.findElements(By.className('tv-widget-chart__price-value symbol-last'));

      borgMetrics.vsBtc = await valueFrameBorgVs[1].getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getBorgVsBtc.'); 
      maxLoop--;
    }

    maxLoop = 5;
    await driver.switchTo().defaultContent();
    console.log('Value BORG vs BTC is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get value BORG vs BTC :');
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
    await handlerError(e, driver, 'Error to get marketCap BORG :');
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
    await handlerError(e, driver, 'Error to get nb prenium user BORG :');
  }
}

// Get new prenium user BORG by week.
export const getNewPremiumUserBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.newPremiumUserByWeek) {
      const card = await driver.findElements(By.css('[class*="ecosystemCardFront"] p'));

      borgMetrics.newPremiumUserByWeek = await card[1].getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getNewPremiumUserBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Nb new prenium user BORG is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get nb new prenium user BORG :');
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
    await handlerError(e, driver, 'Error to get nb BORG lock :');
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
    await handlerError(e, driver, 'Error to get nb supply in circulation BORG :');
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
    await handlerError(e, driver, 'Error to get AUM BORG :');
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
    await handlerError(e, driver, 'Error to get community index BORG :');
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
    await handlerError(e, driver, 'Error for weekly volume app BORG :');
  }
}

// Get verify user.
export const getUserVerify = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.userVerify) {
      const userVerify = await driver.findElement(By.className('stat-1'));
      borgMetrics.userVerify = await userVerify.getText();

      if(maxLoop === 0) throw new Error('Nb loop max in getUserVerify.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Verify user is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get verify user BORG :');
  }
}

// Calcul difference between old value and new value.
export const calculVariation = (borgMetrics, oldBorgMetrics, variationBorgMetrics) => {
  const unit = ['K', 'M', 'B', 'T'];
  const marketCap = borgMetrics.marketCap ? Number(borgMetrics.marketCap.split(' ')[1].replace(',', '.')) : borgMetrics.marketCap;
  const oldMarketCap = oldBorgMetrics.marketCap ? Number(oldBorgMetrics.marketCap.split(' ')[1].replace(',', '.')) : oldBorgMetrics.marketCap;
  const unitSupplyCirculation = borgMetrics.supplyCirculation ? unit.find((u) => borgMetrics.supplyCirculation.includes(u)) : borgMetrics.supplyCirculation;
  const unitOldSupplyCirculation = oldBorgMetrics.supplyCirculation ? unit.find((u) => oldBorgMetrics.supplyCirculation.includes(u)) : oldBorgMetrics.supplyCirculation;
  const takeOffSpaceSupplyCirculation = borgMetrics.supplyCirculation ? borgMetrics.supplyCirculation.replace(',', '.').replace(unitSupplyCirculation, ' ').replace(' ', unitSupplyCirculation).trim() : borgMetrics.supplyCirculation;
  const takeOffSpaceOldSupplyCirculation = oldBorgMetrics.supplyCirculation ? oldBorgMetrics.supplyCirculation.replace(',', '.').replace(unitOldSupplyCirculation, ' ').replace(' ', unitOldSupplyCirculation).trim() : oldBorgMetrics.supplyCirculation;

  const supplyCirculation = NumFormat.convertNumberForCalcul(takeOffSpaceSupplyCirculation);
  const oldSupplyCirculation = NumFormat.convertNumberForCalcul(takeOffSpaceOldSupplyCirculation);
  const weeklyVolumeApp = NumFormat.convertNumberForCalcul(borgMetrics.weeklyVolumeApp);
  const oldWeeklyVolumeApp = NumFormat.convertNumberForCalcul(oldBorgMetrics.weeklyVolumeApp);
  const userVerify = NumFormat.convertNumberForCalcul(borgMetrics.userVerify);
  const oldUserVerify = NumFormat.convertNumberForCalcul(oldBorgMetrics.userVerify);
  const premiumUser = NumFormat.convertNumberForCalcul(borgMetrics.premiumUser);
  const oldPremiumUser = NumFormat.convertNumberForCalcul(oldBorgMetrics.premiumUser);
  const borgLock = NumFormat.convertNumberForCalcul(borgMetrics.borgLock);
  const oldBorgLock = NumFormat.convertNumberForCalcul(oldBorgMetrics.borgLock);
  const aum = NumFormat.convertNumberForCalcul(borgMetrics.aum);
  const oldAum = NumFormat.convertNumberForCalcul(oldBorgMetrics.aum);

  // Percent
  variationBorgMetrics.value = borgMetrics.value && oldBorgMetrics.value ? ((Number(borgMetrics.value) - Number(oldBorgMetrics.value)) / Number(oldBorgMetrics.value) * 100).toFixed(2) : 'N/A';
  variationBorgMetrics.aum = ((aum - oldAum) / oldAum * 100).toFixed(2);
  variationBorgMetrics.marketCap = ((marketCap - oldMarketCap) / oldMarketCap * 100).toFixed(2);
  variationBorgMetrics.weeklyVolumeApp = ((weeklyVolumeApp - oldWeeklyVolumeApp) / oldWeeklyVolumeApp * 100).toFixed(2);

  variationBorgMetrics.userVerify = userVerify - oldUserVerify;
  variationBorgMetrics.premiumUser = premiumUser - oldPremiumUser;
  variationBorgMetrics.borgLock = borgLock - oldBorgLock;
  variationBorgMetrics.supplyCirculation = supplyCirculation - oldSupplyCirculation;
  variationBorgMetrics.communityIndex = borgMetrics.communityIndex && oldBorgMetrics.communityIndex ? Number(borgMetrics.communityIndex) - Number(oldBorgMetrics.communityIndex) : undefined;
  variationBorgMetrics.communityIndex = typeof variationBorgMetrics.communityIndex === 'number' ?
                                        Number.isInteger(variationBorgMetrics.communityIndex) ?
                                        variationBorgMetrics.communityIndex :
                                        variationBorgMetrics.communityIndex.toFixed(1) :
                                        'N/A';
  variationBorgMetrics.rank = borgMetrics.rank && oldBorgMetrics.rank ? Number(borgMetrics.rank) - Number(oldBorgMetrics.rank) : 'N/A';
}