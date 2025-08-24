# NEED MIGRATE IN PYTHON BEFORE USE 

# import { By, until } from 'selenium-webdriver';
# import { handler_error } from '../utils/errorToTelegram.js';

# export const getValue = async (metrics, page, maxLoop, crypto) => {
#   try {
#     while(!metrics.value) {
#       const price = await page.findElements(By.css('.coin-stats-header > div'));
#       metrics.value = await price[1].getText();
#       metrics.value = metrics.value.split("\n")[0]; // Take off variation get just value.

#       if(maxLoop === 0) throw new Error(`Nb loop max in getValue ${crypto}.`); 
#       maxLoop--;
#     }

#     maxLoop = 5;
#     console.log(crypto + ' value is acquired.');
#   } catch(e) {
#     await handler_error(e, page, `Error to get ${crypto} value on CoinMarketcap: `);
#   }
# }

# export const get_market_cap = async (metrics, page, maxLoop, crypto) => {
#   try {
#     while(!metrics['marketCap']) {
#       const marketCap = await page.findElements(By.css('.CoinMetrics_overflow-content__tlFu7 > div'));
#       metrics['marketCap'] = await marketCap[0].getAttribute("innerText");

#       if(maxLoop === 0) throw new Error(`Nb loop max in get_market_cap ${crypto}.`); 
#       maxLoop--;
#     }

#     maxLoop = 5;
#     console.log(crypto + ' marketCap is acquired.');
#   } catch(e) {
#     await handler_error(e, page, `Error to get ${crypto} marketCap on CoinMarketcap: `);
#   }
# }

# // Get 24h volume.
# export const get_volume = async (metrics, page, maxLoop, crypto) => {
#   try {
#     while(!metrics.volumeCoinMarketCap) {
#       const coinMetrics = await page.findElements(By.css('.CoinMetrics_overflow-content__tlFu7 > div'));
#       metrics.volumeCoinMarketCap = await coinMetrics[1].getAttribute("innerText");

#       if(maxLoop === 0) throw new Error(`Nb loop max in get_volume ${crypto}.`); 
#       maxLoop--;
#     }

#     maxLoop = 5;
#     console.log(crypto + ' volume is acquired.');
#   } catch(e) {
#     await handler_error(e, page, `Error to get ${crypto} volume on CoinMarketcap: `);
#   }
# }

# // Get CEX and DEX 24h volume.
# export const getCexAndDexVolume = async (metrics, page, maxLoop, crypto) => {
#   try {
#     while(!metrics.volumeCex && !metrics.volumeDex) {
#       const buttonDisplay = await page.findElement(By.css('use[href="#chevronRight"]'));
#       await page.actions().move({origin: buttonDisplay}).perform();

#       const cexAndDex = await page.wait(until.elementsLocated(By.className('sc-71024e3e-0 htpYOz')), 2000);
#       metrics.volumeCex = await cexAndDex[0].getAttribute("innerText");
#       metrics.volumeDex = await cexAndDex[1].getAttribute("innerText");

#       if(maxLoop === 0) throw new Error(`Nb loop max in getCexAndDexVolume ${crypto}.`); 
#       maxLoop--;
#     }

#     maxLoop = 5;
#     console.log(crypto + ' CEX and DEX volume is acquired.');
#   } catch(e) {
#     await handler_error(e, page, `Error to get ${crypto} CEX and DEX volume on CoinMarketcap: `);
#   }
# }

# // Get supply circulation.
# export const get_supply_circulation = async (metrics, page, maxLoop, crypto) => {
#   try {
#     while(!metrics['supplyCirculation']) {
#       const supplyCirculation = await page.findElements(By.css('.CoinMetrics_sib-content-wrapper__E8lu8 > div'));
#       metrics['supplyCirculation'] = await supplyCirculation[8].getAttribute("innerText");

#       if(maxLoop === 0) throw new Error(`Nb loop max in get_supply_circulation ${crypto}.`); 
#       maxLoop--;
#     }

#     maxLoop = 5;
#     console.log(crypto + ' supply circulation is acquired.');
#   } catch(e) {
#     await handler_error(e, page, `Error to get ${crypto} supply circulation on CoinMarketcap: `);
#   }
# }

# // Get 24h liquidity.
# export const getLiquidity = async (metrics, page, maxLoop, crypto) => {
#   try {
#     while(!metrics.liquidity) {
#       const coinMetrics = await page.findElements(By.css('.CoinMetrics_overflow-content__tlFu7'));
#       metrics.liquidity = await coinMetrics[3].getAttribute("innerText");

#       if(maxLoop === 0) throw new Error(`Nb loop max in getLiquidity ${crypto}.`); 
#       maxLoop--;
#     }

#     maxLoop = 5;
#     console.log(crypto + ' liquidity is acquired.');
#   } catch(e) {
#     await handler_error(e, page, `Error to get ${crypto} liquidity on CoinMarketcap: `);
#   }
# }