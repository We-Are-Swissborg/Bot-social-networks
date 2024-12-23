import dotenv from 'dotenv';
import Metrics from "./metrics.js";
import got from 'got';
import process from 'process'
import { sendErrorToTelegram } from './utils/errorToTelegram.js';

dotenv.config({ path: '.env.production' });

async function BotWasb() {
  try {
    let infos = {
      crypto: {
        borg: {
          value: '',
          marketCap: '',
          userVerify: '',
          premiumUser: '',
          borgLock: '',
          supplyCirculation: '',
          aum: '',
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
      },
      lastUpdate: undefined,
    }

    infos.crypto = await Metrics(infos.crypto);

    const valueToAddDollar = [
      ['borg', ['value', 'vsBtc', 'aum', 'marketCap']],
      ['btc', ['value', 'marketCap']],
      ['xbg', ['value', 'marketCap']],
    ]

    valueToAddDollar.forEach((value) => {
      const cryptoName = value[0];
      const cryptoProps = value[1];

      cryptoProps.forEach((prop) => {
        if(infos.crypto[cryptoName][prop] && !infos.crypto[cryptoName][prop].includes('$')) {
          infos.crypto[cryptoName][prop] = '$'+infos.crypto[cryptoName][prop];
        }
      })
    })

    infos.lastUpdate = new Date();

    await got.post(process.env.URL_WASB, {
      headers: {
        Authorization: 'bearer ' + process.env.ID_BOT_WASB,
      },
      json: {
        metrics: infos,
      }
    });

    console.log(new Date().toLocaleString('fr-FR'), 'Metrics post OK !')
  } catch (e) {
    const errMsg = e.response ? e.response.body : e.message;
    console.error(new Date().toLocaleString('fr-FR') + ' Error to send metrics : ' + errMsg);
    await sendErrorToTelegram(e, 'Error to send metrics : ', process.env.MONITORING_ID_BOT_WASB);
    process.exit(-1);
  }
}

BotWasb();