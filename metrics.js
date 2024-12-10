import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import * as Swissborg from './pages/swissborg.js';
import * as Coingecko from './pages/coingecko.js';
import * as CoinMarketCap from './pages/coinMarketCap.js';

async function Metrics(infos) {
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

  try {0
    let maxLoop = 5; // Use for return a error if data not found after loop equal 5.
    let quitFrame = infos.borg ? false : true; // For quit the frame on swissborg page.
    const borgMetricsOrSeveralMetrics = infos.borg ? infos.borg : infos;
    const propMetrics = infos.borg ? Object.keys(infos) : undefined;

    // Crypto to add url CoinMarketCap.
    const cryptoWasb = {
      borg: 'swissborg',
      btc: 'bitcoin',
      xbg: 'xborg'
    }  

    //Page https://swissborg.com/borg-overview
    await driver.get('https://swissborg.com/borg-overview');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Swissborg.acceptCookieSwissborg(driver, maxLoop);
    await Swissborg.getValueBorg(borgMetricsOrSeveralMetrics, driver, maxLoop, quitFrame);
    if(infos.borg) await Swissborg.getBorgVsBtc(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getWeeklyVolumeAppBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getPremiumUserBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    if(infos.borg) await Swissborg.getNewPremiumUserBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
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
    await Swissborg.getUserVerify(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://www.coingecko.com/en/coins/{nameCrypto}
    await driver.get('https://www.coingecko.com/en/coins/swissborg');
    await new Promise(resolve => setTimeout(resolve, 2000));
    if(!infos.borg) await Coingecko.getRank(borgMetricsOrSeveralMetrics, driver, maxLoop);

    if(infos.borg) {
      // Value to get on CoinMarketCap.
      const valueToGet = {
        borg: [
          'volumeCoinMarketCap',
          'liquidity'
        ],
        btc: [
          'value',
          'marketCap',
          'volumeCoinMarketCap',
          'volumeCex',
          'volumeDex',
          'supplyCirculation',
          'liquidity',
        ],
        xbg: [
          'value',
          'marketCap',
          'volumeCoinMarketCap',
          'supplyCirculation',
          'liquidity'
        ],
      }

      for (let i = 0; propMetrics.length > i; i++) {
        const prop = propMetrics[i];
        //Page https://coinmarketcap.com/en/currencies/{nameCrypto}
        i !== 0 && await new Promise(resolve => setTimeout(resolve, 2500));
        await driver.get(`https://coinmarketcap.com/en/currencies/${cryptoWasb[prop]}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if(valueToGet[prop].includes('value')) await CoinMarketCap.getValue(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('marketCap')) await CoinMarketCap.getMarketCap(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('volumeCoinMarketCap')) await CoinMarketCap.getVolume(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('volumeCex') && valueToGet[prop].includes('volumeDex')) await CoinMarketCap.getCexAndDexVolume(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('supplyCirculation')) await CoinMarketCap.getSupplyCirculation(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('liquidity')) await CoinMarketCap.getLiquidity(infos[prop], driver, maxLoop, prop);
      }
    }

    await driver.quit();

    return infos;
  } catch (e) {
    await driver.quit();
    if(e) throw e
  }
}

export default Metrics;