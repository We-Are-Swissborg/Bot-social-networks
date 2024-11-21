import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import * as Swissborg from './pages/swissborg.js';
import * as Coingecko from './pages/coingecko.js';

async function Metrics(infos, platformName = 'all') {
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

  try {
    const actions = driver.actions({async: true});

    let maxLoop = 5; // Use for return a error if data not found after loop equal 5.
    let quitFrame = platformName === 'all' ? true : false; // For quit the frame on swissborg page.

    const borgMetricsOrSeveralMetrics = infos.borg ? infos.borg : infos;

    //Page https://swissborg.com/borg-overview
    await driver.get('https://swissborg.com/borg-overview');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Swissborg.acceptCookieSwissborg(actions, driver);
    await Swissborg.getValueBorg(borgMetricsOrSeveralMetrics, driver, maxLoop, quitFrame);
    if(platformName === 'wasb') await Swissborg.getBorgVsBtc(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getWeeklyVolumeAppBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getPremiumUserBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    if(platformName === 'wasb') await Swissborg.getNewPremiumUserBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getBorgLock(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getCommunityIndexBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://swissborg.com/fr/marche-crypto/coins/swissborg-token
    await driver.get('https://swissborg.com/fr/marche-crypto/coins/swissborg-token');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Swissborg.getMarketCapBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getSupplyCirculationBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://swissborg.com/about
    await driver.get('https://swissborg.com/about');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Swissborg.getAumBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://www.coingecko.com/en/coins/{nameCrypto}
    await driver.get('https://www.coingecko.com/en/coins/swissborg');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Coingecko.getRank(borgMetricsOrSeveralMetrics, driver, maxLoop);

    await driver.quit();

    return infos;
  } catch (e) {
    await driver.quit();
    if(e) throw e
  }
}

export default Metrics;