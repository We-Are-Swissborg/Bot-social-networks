import { By } from 'selenium-webdriver';
import process from 'process'

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
export const getValueBorg = async (borgInfo, driver, maxLoop) => {
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
export const getMarketCapBorg = async (borgInfo, driver, maxLoop) => {
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
export const getPremiumUserBorg = async (borgInfo, driver, maxLoop) => {
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
export const getBorgLock = async (borgInfo, driver, maxLoop) => {
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
export const getSupplyCirculationBorg = async (borgInfo, driver, maxLoop) => {
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
export const getAumBorg = async (borgInfo, driver, maxLoop) => {
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

// Get community index BORG.
export const getCommunityIndexBorg = async (borgInfo, driver, maxLoop) => {
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
export const getWeeklyVolumeAppBorg = async (borgInfo, driver, maxLoop) => {
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

const takeOffUnitNumber = (value, unitNumber) => {
  const unit = unitNumber.find((u) => value.includes(u));
  return Number(value.split(unit)[0]);
}

// Calcul difference between old value and new value.
export const calculateDifference = (borgInfo, oldBorgInfo, valueDifferenceBorgInfo, unitNumber) => {
  const marketCap = Number(borgInfo.marketCap.split(' ')[1].replace(',', '.'));
  const oldMarketCap = Number(oldBorgInfo.marketCap.split(' ')[1].replace(',', '.'));
  // const lengthPremiumUser = String(borgInfo.premiumUser).length - 2;
  // const lengthOldPremiumUser = String(oldBorgInfo.premiumUser).length - 2;
  const weeklyVolumeApp = takeOffUnitNumber(borgInfo.weeklyVolumeApp, unitNumber);
  const oldWeeklyVolumeApp = takeOffUnitNumber(oldBorgInfo.weeklyVolumeApp, unitNumber);
  const premiumUser = takeOffUnitNumber(borgInfo.premiumUser, unitNumber);
  const oldPremiumUser = takeOffUnitNumber(oldBorgInfo.premiumUser, unitNumber);
  // const premiumUser = Number(borgInfo.premiumUser.slice(0, lengthPremiumUser));
  // const oldPremiumUser = Number(oldBorgInfo.premiumUser.slice(0, lengthOldPremiumUser));
  const borgLock = takeOffUnitNumber(borgInfo.borgLock, unitNumber);
  const oldBorgLock = takeOffUnitNumber(oldBorgInfo.borgLock, unitNumber);
  const supplyCirculation = Number(borgInfo.supplyCirculation.split(' ')[0].replace(',', '.'));
  const oldSupplyCirculation = Number(oldBorgInfo.supplyCirculation.split(' ')[0].replace(',', '.'));
  const aum = takeOffUnitNumber(borgInfo.aum, unitNumber);
  const oldAum = takeOffUnitNumber(oldBorgInfo.aum, unitNumber);

  valueDifferenceBorgInfo.value = ((Number(borgInfo.value) - Number(oldBorgInfo.value)) / Number(oldBorgInfo.value) * 100).toFixed(2);
  valueDifferenceBorgInfo.marketCap = ((marketCap - oldMarketCap) / oldMarketCap * 100).toFixed(2);
  valueDifferenceBorgInfo.premiumUser = (premiumUser - oldPremiumUser).toFixed(3);
  valueDifferenceBorgInfo.borgLock = (borgLock - oldBorgLock).toFixed(2);
  valueDifferenceBorgInfo.supplyCirculation = (supplyCirculation - oldSupplyCirculation).toFixed(2);
  valueDifferenceBorgInfo.aum = ((aum - oldAum) / oldAum * 100).toFixed(2);
  valueDifferenceBorgInfo.rank = Number(borgInfo.rank) - Number(oldBorgInfo.rank);
  valueDifferenceBorgInfo.communityIndex = Number(borgInfo.communityIndex) - Number(oldBorgInfo.communityIndex);
  valueDifferenceBorgInfo.communityIndex = Number.isInteger(valueDifferenceBorgInfo.communityIndex) ? valueDifferenceBorgInfo.communityIndex : valueDifferenceBorgInfo.communityIndex.toFixed(1);
  valueDifferenceBorgInfo.weeklyVolumeApp = ((weeklyVolumeApp - oldWeeklyVolumeApp) / oldWeeklyVolumeApp * 100).toFixed(2);
}