import dotenv from 'dotenv';
import GetMetrics from "../utils/metrics.js";
// eslint-disable-next-line import/no-unresolved
import got from 'got';
import process from 'process'
import { sendErrorToTelegram } from '../utils/telegram.js';

dotenv.config({ path: '.env.production' });

async function BotWasb() {
  try {
    const infos = {
      crypto: {
        borg: {
          value: '',
          marketCap: '',
          userVerify: '',
          premiumUser: '',
          borgLockByPremium: '',
          borgLockForGovernance: '',
          supplyCirculation: '',
          aum: '',
          vsBtc: '',
          // volumeCoinMarketCap: '',
          // liquidity: '',
          maxSupply: '985M',
          volumeCoinGecko: '',
          circulatingBorg: ''
        },
        btc: {
          value: '',
          marketCap: '',
          // volumeCoinMarketCap: '',
          // volumeCex: '',
          // volumeDex: '',
          supplyCirculation: '',
          // liquidity: '',
          maxSupply: '21M',
          volumeCoinGecko: '',
        },
        xbg: {
          value: '',
          marketCap: '',
          // volumeCoinMarketCap: '',
          supplyCirculation: '',
          // liquidity: '',
          maxSupply: '1B',
          volumeCoinGecko: ''
        },
        borgy: {
          value: '',
          marketCap: '',
          supplyCirculation: '77.777B',
          maxSupply: '77.777B',
          volumeDexScreener: '',
          // holder: '',
          // created: ''
        },
      },
      lastUpdate: undefined,
    }

    infos.crypto = await GetMetrics(infos.crypto);

    const valueToAddDollar = [
      ['borg', ['value', 'vsBtc', 'aum', 'marketCap']],
      ['btc', ['value', 'marketCap']],
      ['xbg', ['value', 'marketCap']],
      ['borgy', ['value', 'marketCap']],
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
        Authorization: 'bearer ' + process.env.ID_WASB_SITE,
      },
      json: {
        metrics: infos,
      }
    });

    console.log(new Date().toLocaleString('fr-FR'), 'Metrics WASB post OK !')
  } catch (e) {
    const errMsg = e.response ? e.response.body : e.message;
    console.error(new Date().toLocaleString('fr-FR') + ' Error to send metrics on WASB : ' + errMsg);
    await sendErrorToTelegram(e, 'Error to send metrics on WASB : ');
  }
}

export default BotWasb;