// eslint-disable-next-line import/no-unresolved
import got from 'got';
import process from 'process';

const formatMessage = (errorMsg) => {
  const characterToEdit = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

  // Edit error message for telegram.
  characterToEdit.forEach((character) => {
    if(errorMsg.includes('+')) errorMsg = errorMsg.replaceAll('+', '\\%2B')
    else if(errorMsg.includes(character)) errorMsg = errorMsg.replaceAll(character, '\\'+character);
  })

  return errorMsg;
}

export const sendErrorToTelegram = async (e, addErrorMsg = undefined, botToken = process.env.WASB_TG_TOKEN) => {
  const chatId = process.env.MONITORING_ID_CHAT_TG;
  let errorMsg =  e.response ? e.response.body : e.message;

  if(addErrorMsg) errorMsg = addErrorMsg + errorMsg;
  errorMsg = formatMessage(errorMsg);

  await got.post(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${errorMsg}&parse_mode=MarkdownV2`, {
    headers: {
      accept: 'application/x-www-form-urlencoded'
    }
  });
}

export const handlerError = async (e, driver, addErrorMsg, isBorgyBot = false) => {
  const botToken = isBorgyBot ? process.env.BORGY_TG_TOKEN : process.env.WASB_TG_TOKEN;
  console.error(addErrorMsg + e);
  await driver.get(driver.getCurrentUrl());
  await sendErrorToTelegram(e, addErrorMsg, botToken);
}

export const sendMessageWithPhotoToTelegram = async (idThreadTelegram, idPhoto, message, about) => {
  try {
    await got.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendPhoto?chat_id=${process.env.ID_CHAT_TG}&photo=${idPhoto}&message_thread_id=${idThreadTelegram}&caption=${message}&parse_mode=MarkdownV2`, {
      headers: {
        accept: 'application/x-www-form-urlencoded',
      }
    });

    // Print the response
    console.log(`${about} message to Telegram successfully.`);
  } catch (error) {
    console.error(`Error ${about.toLowerCase()} message to telegram: ` + error.response ? error.response.body : error);
    throw new Error(`Error ${about.toLowerCase()} message to telegram: ` + error.response ? error.response.body : error);
  }
}