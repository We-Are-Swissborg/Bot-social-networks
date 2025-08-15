import { By } from 'selenium-webdriver';
import { convertNumberForCalcul } from '../utils/numberFormatter.js';
import fs from 'fs/promises';

const checkIsBuyerSignature = async (rowsTransactions, signature) => {
  try {
    let i = 0;
    let isUnique = false;

    for(const row of rowsTransactions) {
      const td = await row.findElements(By.css('td'));
      const sign = await td[1].getText();
      if(sign == signature) i++;
    }

    if(i == 1) isUnique = true;
    return isUnique;
  } catch(e) {
    console.error(e);
  }
}

// Length must be equal to the number of transactions per page (10) 
const checkLengthSignatureArray = async (oldSignatures, signature) => {
  try {
    if(oldSignatures.length == 10) {
      oldSignatures.pop(signature);
      oldSignatures.push(signature);
  } else {
    oldSignatures.push(signature);
  }
  } catch(e) {
    console.error(e);
  }
}

const getTrades = async (driver) => {
  try {
    const dataFile = await fs.readFile('./old-signatures-Borgy.txt','utf8');
    const oldSignatures = JSON.parse(dataFile);
    const rowsTransactions = await driver.findElements(By.css('tbody tr'));
    const arrayTransfer = [];

    for(const row of rowsTransactions) {
      const td = await row.findElements(By.css('td'));
      let isAlert = false;

      // Check if the transaction failed.
      try {
        isAlert = !!await td[1].findElement(By.className('lucide-circle-alert'));
      } catch {
        isAlert = false;
      }
      const cryptoReceived = await td[5].findElements(By.css('div > div > div:nth-child(2) > div > div > span'));
      const crypto = await cryptoReceived[1].getText();

      if(!isAlert) {
        const signature = await td[1].getText();
        const isAlreadySend = oldSignatures.includes(signature);

        if(!isAlreadySend && crypto == 'BORGY') {
          const isBuyerSignature = await checkIsBuyerSignature(rowsTransactions, signature);

          if(isBuyerSignature) {
            const value = await td[6].getText();
            const amountDiv = await td[5].findElements(By.css('div > div > div:nth-child(2) > div > div > div'));
            const amount = await amountDiv[1].getText();
            const buyPrice = Number(convertNumberForCalcul(value) / convertNumberForCalcul(amount));
            const transfer = {};

            transfer.signature = signature;
            transfer.amount = amount;
            transfer.value = value;
            transfer.priceWithoutFee = buyPrice;
            transfer.txLink = 'https://solscan.io/tx/'+signature;

            arrayTransfer.push(transfer);
            checkLengthSignatureArray(oldSignatures, signature);
          }
        }
      }
    }

    await fs.writeFile('./old-signatures-Borgy.txt', JSON.stringify(oldSignatures))
    return arrayTransfer;
  } catch(e) {
    console.error(e);
  }
}

// const getMarketCap = async (driver) => {
//   try {
//     const aDiv = await driver.findElements(By.css('#__next > div'));
//     const bDiv = await aDiv[0].findElements(By.css('div'));
//     // const cDiv = await bDiv[2].findElements(By.css('div'));
//     // const dDiv = await cDiv[0].findElements(By.css('div'));
//     // const eDiv = await dDiv[1].findElements(By.css('div'));
//     // const fDiv = await eDiv[1].findElements(By.css('div'));
//     // const gDiv = await fDiv[1].findElements(By.css('div'));
//     // const hDiv = await gDiv[0].findElements(By.css('div'));
//     // const iDiv = await hDiv[0].findElements(By.css('div'));
//     // const jDiv = await iDiv[0].findElements(By.css('div'));
//     // const kDiv = await jDiv[1].findElements(By.css('div'));

//     // const marketCapDiv = await driver.findElements(By.css('div:nth-child(1) > div:nth-child(1) > div:nth-child(2)'))
//     // const marketCapDiv = await driver.findElements(By.css('#__next > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2)'))
//     // const marketCapDiv = await driver.findElements(By.css(`
//     //   #__next >
//     //   div:nth-child(1) >
//     //   div:nth-child(3) >
//     //   div:nth-child(1) >
//     //   div:nth-child(2) >
//     //   div:nth-child(2) >
//     //   div:nth-child(2) >
//     //   div:nth-child(1) >
//     //   div:nth-child(1) >
//     //   div:nth-child(1) >
//     //   div:nth-child(2)`
//     // ))

//     console.log(await bDiv[4].getText());
//   } catch(e) {
//     console.error(e);
//   }
// }

async function getTransfers(driver) {
  try {
    const transfers = await getTrades(driver);

    return transfers;
  }catch(e) {
    console.error(e)
  }
}

export default getTransfers;