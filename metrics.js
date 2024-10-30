import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import * as Swissborg from './pages/swissborg.js';
import * as Coingecko from './pages/coingecko.js';

async function Metrics() {
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
  const infos = {
    borg: {
      value: '',
      marketCap: '',
      premiumUser: '',
      borgLock: '',
      supplyCirculation: '',
      aum: '',
      rank: '',
      communityIndex: '',
      weeklyVolumeApp: ''
    },
  }

  let maxLoop = 5; // Use for return a error if data not found after loop equal 5.

  //Page https://swissborg.com/borg-overview
  await driver.get('https://swissborg.com/borg-overview');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await Swissborg.acceptCookieSwissborg(actions, driver);
  await Swissborg.getValueBorg(infos.borg, driver, maxLoop);
  await Swissborg.getWeeklyVolumeAppBorg(infos.borg, driver, maxLoop);
  await Swissborg.getPremiumUserBorg(infos.borg, driver, maxLoop);
  await Swissborg.getBorgLock(infos.borg, driver, maxLoop);
  await Swissborg.getCommunityIndexBorg(infos.borg, driver, maxLoop);

  //Page https://swissborg.com/fr/marche-crypto/coins/swissborg-token
  await driver.get('https://swissborg.com/fr/marche-crypto/coins/swissborg-token');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await Swissborg.getMarketCapBorg(infos.borg, driver, maxLoop);
  await Swissborg.getSupplyCirculationBorg(infos.borg, driver, maxLoop);
  
  //Page https://swissborg.com/about
  await driver.get('https://swissborg.com/about');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await Swissborg.getAumBorg(infos.borg, driver, maxLoop);

  //Page https://www.coingecko.com/en/coins/{nameCrypto}
  await driver.get('https://www.coingecko.com/en/coins/swissborg');
  await new Promise(resolve => setTimeout(resolve, 2000));
  await Coingecko.getRank(infos.borg, driver, maxLoop);

  await driver.quit();

  return infos;
}

export default Metrics;