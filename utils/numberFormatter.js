const kilo = 'K';
const million = 'M';
const billion = 'B';
const trillion = 'T';

const tenPower = (unit, value, lengthDecimal) => {
  let expoKilo = (lengthDecimal === 1) ? 2 : (lengthDecimal === 2) ? 1 : 0;
  let expoMillion = (lengthDecimal === 1) ? 5 : (lengthDecimal === 2) ? 4 : 3;
  let expoBillion = (lengthDecimal === 1) ? 8 : (lengthDecimal === 2) ? 7 : 6;
  let expoTrillion = (lengthDecimal === 1) ? 11 : (lengthDecimal === 2) ? 10 : 9;

  const numWithoutDot = value.replace('.', '');

  if(unit === kilo) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, expoKilo);
  if(unit === million) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, expoMillion);
  if(unit === billion) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, expoBillion);
  if(unit === trillion) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, expoTrillion);
}

const addZeroInValue = (unit, value) => {
  const decimalWithUnit = value.split('.')[1];
  const decimal = decimalWithUnit.split(unit)[0];
  return tenPower(unit, value, decimal.length);
}

export const convertNumberForCalcul = (value) => {
  let v = undefined;

  if(value.includes(kilo)) {
    if(value.includes('.')) v = addZeroInValue(kilo, value)
    else v = Number(value.split(kilo)[0]) * Math.pow(10, 3);
  } else if(value.includes(million)) {
    if(value.includes('.')) v = addZeroInValue(million, value)
    else v = Number(value.split(million)[0]) * Math.pow(10, 6);
  } else if(value.includes(billion)) {
    if(value.includes('.')) v = addZeroInValue(billion, value)
    else v = Number(value.split(billion)[0]) * Math.pow(10, 9);
  } else if(value.includes(trillion)) {
    if(value.includes('.')) v = addZeroInValue(trillion, value)
    else v = Number(value.split(trillion)[0]) * Math.pow(10, 12);
  }

  return v;
}

const addUnitNumber = (unit, value, exponent, num) => {
  const n = (num / Math.pow(10, exponent)).toFixed(3);
  let v = String(n);
  let lengthNum = v.length;
  let lastDigit = v.slice(lengthNum - 1);
  let isTakeOffZero = true;

  while(isTakeOffZero) {
    if(lastDigit == 0) {
      v = v.slice(0, lengthNum - 1);
      lengthNum = v.length;
      lastDigit = v.slice(lengthNum - 1);
    } else {
      isTakeOffZero = false;

      if(lastDigit == '.') v = v.slice(0, lengthNum - 1);
      if(v.includes('.')) v = v.replace('.', '\\,'); // Convert '.' to '\\,' for work with markdownV2.
      if(value.includes('\\-')) {
        v = value.slice(0, 2) + v + unit
      }
      else v = value.slice(0, 4) + v + unit;
    }
  }

  return v;
}

export const abbreviateNumber = (value) => {
  let num = undefined;
  let v = value;

  // Take off - (\\-) or + (\\%2B) for get number.
  if(value.includes('-')) {
    num = Number(value.split('-')[1]);
  } else {
    num = Number(value.split('B')[1]);
  }

  if(1000 <= num && num <= 999999) v = addUnitNumber('K', value, 3, num);
  if(1000000 <= num && num <= 999999999) v = addUnitNumber('M', value, 6, num);
  if(1000000000 <= num && num <= 999999999999) v = addUnitNumber('B', value, 9, num);
  if(1000000000000 <= num && num <= 999999999999999) v = addUnitNumber('T', value, 12, num);

  return v;
}