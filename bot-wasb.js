import fs from 'node:fs';
import dotenv from 'dotenv';
import Metrics from "./metrics.js";
import * as Swissborg from './pages/swissborg.js';
import got from 'got';

dotenv.config({ path: '.env.production' });

async function BotWasb() {
  // const dataFile = fs.readFileSync('./old-value-wasb.txt','utf8');
  // let oldMetrics = JSON.parse(dataFile);
  const res = await got.get('http://localhost:3000/api/metrics').json();

  console.log({res})
  // let variationMetrics = {
  //   borg: {
  //     value: '',
  //     marketCap: '',
  //     premiumUser: '',
  //     borgLock: '',
  //     supplyCirculation: '',
  //     aum: '',
  //     rank: '',
  //     communityIndex: '',
  //     weeklyVolumeApp: ''
  //   },
  // };
  // const metrics = await Metrics();

  // fs.writeFile('./old-value-wasb.txt', JSON.stringify(metrics), err => {
  //   if (err) {
  //     console.error('Error writting to file :' + err);
  //   } else {
  //     console.log('File written successfully.');
  //   }
  // });
  // Swissborg.calculateDifference(metrics.borg, oldMetrics.borg, variationMetrics.borg);
}

BotWasb();