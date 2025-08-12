import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

async function getDriver() {
  try {
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

    return driver;
  } catch(e) {
    console.error(e);
  }
}

export default getDriver;

// const getUpdates = async () => {
//   const date = new Date();

//   try {
//     const answerTelegram = await got.post(`https://api.telegram.org/bot${process.env.WASB_TG_TOKEN}/getUpdates`, {
//       headers: {
//         accept: 'application/x-www-form-urlencoded'
//       }
//     });
//     console.log(date + ' Message to Telegram successfully:', answerTelegram.body);
//   } catch (error) {
//     console.error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
//     throw new Error(date + ' Error message to telegram: ' + error.response ? error.response.body : error);
//   }
// }

// getUpdates()