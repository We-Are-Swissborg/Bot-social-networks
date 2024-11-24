import { By } from 'selenium-webdriver';
import { sendErrorToTelegram } from '../utils/errorToTelegram.js';

// Get rank crypto.
export const getRank = async (crypto, driver, maxLoop) => {
  try {
    while(!crypto.rank) {
      const rank = await driver.findElement(By.css('[data-coin-show-target="staticCoinPrice"] div > span > div'));
      crypto.rank = await rank.getText();
      crypto.rank = crypto.rank.split('#')[1];

      if(maxLoop === 0) throw new Error('Nb loop max in getRank.');
      maxLoop--;
    }

    maxLoop = 5;
    console.log('Rank is acquired.');
  } catch(e) {
    console.error('Error for get rank :' + e);
    await driver.get(driver.getCurrentUrl());
    await sendErrorToTelegram(e, 'Error for get rank :');
  }
}