import dotenv from 'dotenv';
import Metrics from "./metrics.js";
import got from 'got';
import process from 'process'
import { sendErrorToTelegram } from './utils/errorToTelegram.js';

dotenv.config({ path: '.env.production' });

async function BotWasb() {
  try {
    let infos = {
      borg: {
        value: '',
        marketCap: '',
        userVerify: '',
        premiumUser: '',
        borgLock: '',
        supplyCirculation: '',
        aum: '',
        communityIndex: '',
        weeklyVolumeApp: '',
        newPremiumUserByWeek: '',
        vsBtc: '',
        // volumeCoinMarketCap: '',
        // liquidity: '',
        maxSupply: '',
        volumeCoinGecko: ''
      },
      btc: {
        value: '',
        marketCap: '',
        // volumeCoinMarketCap: '',
        // volumeCex: '',
        // volumeDex: '',
        supplyCirculation: '',
        // liquidity: '',
        maxSupply: '',
        volumeCoinGecko: '',
      },
      xbg: {
        value: '',
        marketCap: '',
        // volumeCoinMarketCap: '',
        supplyCirculation: '',
        // liquidity: '',
        maxSupply: '',
        volumeCoinGecko: ''
      },
    }

    infos = await Metrics(infos);

    const valueToAddDollar = [
      ['borg', ['value', 'vsBtc', 'aum', 'marketCap']],
      ['btc', ['value', 'marketCap']],
      ['xbg', ['value', 'marketCap']],
    ]

    valueToAddDollar.forEach((value) => {
      const cryptoName = value[0];
      const cryptoProps = value[1];

      cryptoProps.forEach((prop) => {
        if(infos[cryptoName][prop] && !infos[cryptoName][prop].includes('$')) {
          infos[cryptoName][prop] = '$'+infos[cryptoName][prop];
        }
      })
    })

    await got.post(process.env.URL_WASB, {
      headers: {
        Authorization: 'bearer ' + process.env.ID_BOT_WASB,
      },
      json: {
        metrics: infos,
      }
    });

    console.log(new Date(), 'Metrics post OK !')
  } catch (e) {
    const errMsg = e.response ? e.response.body : e.message;
    console.error(new Date() + ' Error to send metrics : ' + errMsg);
    await sendErrorToTelegram(e, 'Error to send metrics : ', process.env.MONITORING_ID_BOT_WASB);
    process.exit(-1);
  } 
}

BotWasb();