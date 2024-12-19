import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import * as Swissborg from './pages/swissborg.js';
import * as Coingecko from './pages/coingecko.js';
// import * as CoinMarketCap from './pages/coinMarketCap.js';
import { compareTwoCrypto, getValueCrypto } from './utils/math.js';
import { abbreviateNumber } from './utils/numberFormatter.js';

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

  try {
    let maxLoop = 5; // Use for return a error if data not found after loop equal 5.
    // let quitFrame = infos.borg ? false : true; // For quit the frame on swissborg page.
    const borgMetricsOrSeveralMetrics = infos.borg ? infos.borg : infos;
    const propMetrics = infos.borg ? Object.keys(infos) : undefined;

    //Page https://swissborg.com/buy-borg
    await driver.get('https://swissborg.com/buy-borg');
    await new Promise(resolve => setTimeout(resolve, 2000));
    // await Swissborg.acceptCookieSwissborg(driver, maxLoop);
    await Swissborg.getVolumeAppBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://swissborg.com/premium-account
    await driver.get('https://swissborg.com/premium-account');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Swissborg.getPremiumUserBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getBorgLock(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://swissborg.com/marche-crypto/coins/swissborg-token
    // await driver.get('https://swissborg.com/crypto-market/coins/swissborg-token');
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // await Swissborg.getMarketCapBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    // await Swissborg.getSupplyCirculationBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://swissborg.com/about
    await driver.get('https://swissborg.com/about');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Swissborg.getAumBorg(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Swissborg.getUserVerify(borgMetricsOrSeveralMetrics, driver, maxLoop);

    //Page https://www.coingecko.com/en/coins/{nameCrypto}
    await driver.get('https://www.coingecko.com/en/coins/swissborg');
    await new Promise(resolve => setTimeout(resolve, 2000));
    if(!infos.borg) await Coingecko.getRank(borgMetricsOrSeveralMetrics, driver, maxLoop);
    await Coingecko.getMarketCap(borgMetricsOrSeveralMetrics, driver, maxLoop, 'BORG');
    await Coingecko.getSupplyCirculation(borgMetricsOrSeveralMetrics, driver, maxLoop, 'BORG');

    // Crypto to add url CoinGecko.
    if(infos.borg) {
      const cryptoWasb = {
      borg: 'swissborg',
      btc: 'bitcoin',
      xbg: 'xborg'
    }

    // Value to get on CoinGecko.
    const valueToGet = {
      borg: [
        'marketCap',
        'supplyCirculation',
        'volumeCoinGecko',
        'maxSupply'
      ],
      btc: [
        'marketCap',
        'volumeCoinGecko',
        'supplyCirculation',
        'maxSupply'
      ],
      xbg: [
        'marketCap',
        'volumeCoinGecko',
        'supplyCirculation',
        'maxSupply'
      ],
    }
      // for (let i = 0; propMetrics.length > i; i++) {
      //   const prop = propMetrics[i];
      //   //Page https://coinmarketcap.com/en/currencies/{nameCrypto}
      //   i !== 0 && await new Promise(resolve => setTimeout(resolve, 2500));
      //   await driver.get(`https://coinmarketcap.com/en/currencies/${cryptoWasb[prop]}`);
      //   await new Promise(resolve => setTimeout(resolve, 2000));
      //   // if(valueToGet[prop].includes('value')) await CoinMarketCap.getValue(infos[prop], driver, maxLoop, prop);
      //   if(valueToGet[prop].includes('marketCap')) await CoinMarketCap.getMarketCap(infos[prop], driver, maxLoop, prop);
      //   if(valueToGet[prop].includes('volumeCoinMarketCap')) await CoinMarketCap.getVolume(infos[prop], driver, maxLoop, prop);
      //   if(valueToGet[prop].includes('volumeCex') && valueToGet[prop].includes('volumeDex')) await CoinMarketCap.getCexAndDexVolume(infos[prop], driver, maxLoop, prop);
      //   if(valueToGet[prop].includes('supplyCirculation')) await CoinMarketCap.getSupplyCirculation(infos[prop], driver, maxLoop, prop);
      //   if(valueToGet[prop].includes('liquidity')) await CoinMarketCap.getLiquidity(infos[prop], driver, maxLoop, prop);
      // }

      for (let i = 0; propMetrics.length > i; i++) {
        const prop = propMetrics[i];
        //Page https://coingecko.com/en/coins/{nameCrypto}
        i !== 0 && await new Promise(resolve => setTimeout(resolve, 2500));
        await driver.get(`https://www.coingecko.com/en/coins/${cryptoWasb[prop]}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if(valueToGet[prop].includes('marketCap')) await Coingecko.getMarketCap(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('volumeCoinGecko')) await Coingecko.getVolume(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('supplyCirculation')) await Coingecko.getSupplyCirculation(infos[prop], driver, maxLoop, prop);
        if(valueToGet[prop].includes('maxSupply')) await Coingecko.getMaxSupply(infos[prop], driver, maxLoop, prop);
      }
    }

    await driver.quit();

    if(infos.borg) {
      for (let i = 0; propMetrics.length > i; i++) {
        const prop = propMetrics[i];

        if(infos[prop].marketCap && infos[prop].supplyCirculation) infos[prop].value = getValueCrypto(infos[prop].marketCap, infos[prop].supplyCirculation);
        if(infos[prop].marketCap) infos[prop].marketCap = abbreviateNumber(infos[prop].marketCap);
        if(infos[prop].supplyCirculation) infos[prop].supplyCirculation = abbreviateNumber(infos[prop].supplyCirculation);
      }

      if(infos.borg.value && infos.btc.value) infos.borg.vsBtc = compareTwoCrypto(infos.borg.value, infos.btc.value);
    } else {
      if(infos.marketCap && infos.supplyCirculation) infos.value = getValueCrypto(infos.marketCap, infos.supplyCirculation);
      if(infos.marketCap) infos.marketCap = abbreviateNumber(infos.marketCap);
      if(infos.supplyCirculation) infos.supplyCirculation = abbreviateNumber(infos.supplyCirculation);
    }

    return infos;
  } catch (e) {
    await driver.quit();
    if(e) throw e
  }
}

export default Metrics;