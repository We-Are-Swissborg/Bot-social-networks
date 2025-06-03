import { By } from 'selenium-webdriver';
import * as NumFormat from '../utils/numberFormatter.js';
import { handlerError } from '../utils/errorToTelegram.js';

// Click for accept cookie in Swissborg.
export const acceptCookieSwissborg = async (driver, maxLoop) => {
  try {
    let cookieButtons = undefined;
    while(!cookieButtons) {
      cookieButtons = await driver.findElements(By.className('kxZeCm'));
      if(cookieButtons) await cookieButtons[1].click();

      if(maxLoop === 0) throw new Error('Nb loop max for cookie button.'); 
      maxLoop--;
    }
  } catch(e) {
    console.error('Error with cookie button :' + e);
    throw new Error('Error with cookie button :' + e);
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
    await handlerError(e, driver, 'Error to get marketCap BORG :', true);
  }
}

// Get prenium user BORG.
export const getPremiumUserBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.premiumUser) {
      await driver.actions()
      .scroll(0, 0, 0, 300)
      .perform()
      await new Promise(resolve => setTimeout(resolve, 2000));
      const premiumUser = await driver.findElement(By.className('stat-0'));
      borgMetrics.premiumUser = await premiumUser.getText();
      if(maxLoop === 0) throw new Error('Nb loop max in getPremiumUserBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Nb premium user BORG is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get nb premium user BORG :', true);
  }
}

// Get BORG blocked by user.
export const getBorgLockByPremium = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.borgLockByPremium) {
      const borgLockByPremium = await driver.findElement(By.className('stat-2'));
      borgMetrics.borgLockByPremium = await borgLockByPremium.getText();

      if(maxLoop === 0) throw new Error('Nb loop max in getBorgLockByPremium.', true);
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Nb BORG lock is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get nb BORG lock :', true);
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
    await handlerError(e, driver, 'Error to get nb supply in circulation BORG :', true);
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
    await handlerError(e, driver, 'Error to get AUM BORG :', true);
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
    await handlerError(e, driver, 'Error to get verify user BORG :', true);
  }
}

// Get nb borg lock for governance.
export const getBorgLockForGovernance = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.borgLockForGovernance) {
      const title = await driver.findElement(By.className('dzQGEI'));
      await driver.actions()
      .scroll(0, 0, 0, 0, title)
      .perform()
      await new Promise(resolve => setTimeout(resolve, 2000));

      const borgLockForGovernance = await driver.findElements(By.className('cZdGNf'));
      borgMetrics.borgLockForGovernance = await borgLockForGovernance[2].getText();

      if(maxLoop === 0) throw new Error('Nb loop max in getBorgLockForGovernance.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Borg lock for governance is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get borg lock for governance :', true);
  }
}

// Get circulating Borg.
export const getCirculatingBorg = async (borgMetrics, driver, maxLoop) => {
  try {
    while(!borgMetrics.circulatingBorg) {
      const circulatingBorg = await driver.findElements(By.className('cZdGNf'));
      borgMetrics.circulatingBorg = await circulatingBorg[0].getText();

      if(maxLoop === 0) throw new Error('Nb loop max in getCirculatingBorg.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Circulating Borg is acquired.');
  } catch(e) {
    await handlerError(e, driver, 'Error to get circulating Borg :', true);
  }
}

const replaceComma = (value) => {
  if(value) return value.replaceAll(',', '')
  else value;
}

// Calcul difference between old value and new value.
export const calculVariation = (borgMetrics, oldBorgMetrics, variationBorgMetrics) => {
  const replaceCommaMarketCap = replaceComma(borgMetrics.marketCap);
  const replaceCommaOldMarketCap = replaceComma(oldBorgMetrics.marketCap);
  const replaceCommaSupplyCirculation = replaceComma(borgMetrics.supplyCirculation);
  const replaceCommaOldSupplyCirculation = replaceComma(oldBorgMetrics.supplyCirculation);
  const replaceCommaVolumeCoinGecko = replaceComma(borgMetrics.volumeCoinGecko);
  const replaceCommaOldVolumeCoinGecko= replaceComma(oldBorgMetrics.volumeCoinGecko);

  const marketCap = NumFormat.convertNumberForCalcul(replaceCommaMarketCap);
  const oldMarketCap = NumFormat.convertNumberForCalcul(replaceCommaOldMarketCap);
  const supplyCirculation = NumFormat.convertNumberForCalcul(replaceCommaSupplyCirculation);
  const oldSupplyCirculation = NumFormat.convertNumberForCalcul(replaceCommaOldSupplyCirculation);
  const volumeCoinGecko = NumFormat.convertNumberForCalcul(replaceCommaVolumeCoinGecko);
  const oldVolumeCoinGecko = NumFormat.convertNumberForCalcul(replaceCommaOldVolumeCoinGecko);
  const userVerify = NumFormat.convertNumberForCalcul(borgMetrics.userVerify);
  const oldUserVerify = NumFormat.convertNumberForCalcul(oldBorgMetrics.userVerify);
  const premiumUser = NumFormat.convertNumberForCalcul(borgMetrics.premiumUser);
  const oldPremiumUser = NumFormat.convertNumberForCalcul(oldBorgMetrics.premiumUser);
  const borgLockByPremium = NumFormat.convertNumberForCalcul(borgMetrics.borgLockByPremium);
  const oldBorgLockByPremium = NumFormat.convertNumberForCalcul(oldBorgMetrics.borgLockByPremium);
  const aum = NumFormat.convertNumberForCalcul(borgMetrics.aum);
  const oldAum = NumFormat.convertNumberForCalcul(oldBorgMetrics.aum);
  const borgLockForGovernance = NumFormat.convertNumberForCalcul(borgMetrics.borgLockForGovernance);
  const oldBorgLockForGovernance = NumFormat.convertNumberForCalcul(oldBorgMetrics.borgLockForGovernance);
  const circulatingBorg = NumFormat.convertNumberForCalcul(borgMetrics.circulatingBorg);
  const oldCirculatingBorg = NumFormat.convertNumberForCalcul(oldBorgMetrics.circulatingBorg);

  // Percent
  variationBorgMetrics.value = borgMetrics.value && oldBorgMetrics.value ? ((Number(borgMetrics.value) - Number(oldBorgMetrics.value)) / Number(oldBorgMetrics.value) * 100).toFixed(2) : 'N/A';
  variationBorgMetrics.aum = ((aum - oldAum) / oldAum * 100).toFixed(2);
  variationBorgMetrics.marketCap = ((marketCap - oldMarketCap) / oldMarketCap * 100).toFixed(2);
  variationBorgMetrics.volumeCoinGecko = ((volumeCoinGecko - oldVolumeCoinGecko) / oldVolumeCoinGecko * 100).toFixed(2);

  variationBorgMetrics.userVerify = userVerify - oldUserVerify;
  variationBorgMetrics.premiumUser = premiumUser - oldPremiumUser;
  variationBorgMetrics.borgLockByPremium = borgLockByPremium - oldBorgLockByPremium;
  variationBorgMetrics.supplyCirculation = supplyCirculation - oldSupplyCirculation;
  variationBorgMetrics.rank = borgMetrics.rank && oldBorgMetrics.rank ? Number(borgMetrics.rank) - Number(oldBorgMetrics.rank) : 'N/A';
  variationBorgMetrics.borgLockForGovernance = borgLockForGovernance > 0 && oldBorgLockForGovernance > 0 ? borgLockForGovernance - oldBorgLockForGovernance : 'N/A';
  variationBorgMetrics.circulatingBorg = circulatingBorg > 0 && oldCirculatingBorg > 0 ? circulatingBorg - oldCirculatingBorg : 'N/A';
}