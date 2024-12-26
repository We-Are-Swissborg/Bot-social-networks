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

export const sendErrorToTelegram = async (e, addErrorMsg = undefined, idChat = process.env.MONITORING_ID_CHAT_TG) => {
  let errorMsg =  e.response ? e.response.body : e.message;

  if(addErrorMsg) errorMsg = addErrorMsg + errorMsg;
  errorMsg = formatMessage(errorMsg);

  await got.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage?chat_id=${idChat}&text=${errorMsg}&parse_mode=MarkdownV2`, {
    headers: {
      accept: 'application/x-www-form-urlencoded'
    }
  });
}

export const handlerError = async (e, driver, addErrorMsg, isForTelegram = false) => {
  const idChat = isForTelegram ? process.env.MONITORING_ID_CHAT_TG : process.env.MONITORING_ID_BOT_WASB;
  console.error(addErrorMsg + e);
  await driver.get(driver.getCurrentUrl());
  await sendErrorToTelegram(e, addErrorMsg, idChat);
}