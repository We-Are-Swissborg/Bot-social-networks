const kilo = 'K';
const million = 'M';
const billion = 'B';
const trillion = 'T';

const tenPower = (unit, value, lengthDecimal) => {
  const numWithoutDot = value.replace('.', '');

  if(unit === kilo) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, 3 - lengthDecimal);
  if(unit === million) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, 6 - lengthDecimal);
  if(unit === billion) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, 9 - lengthDecimal);
  if(unit === trillion) return Number(numWithoutDot.split(unit)[0]) * Math.pow(10, 12 - lengthDecimal);
}

const addZeroInValue = (unit, value) => {
  const decimalWithUnit = value.split('.')[1];
  const decimal = decimalWithUnit.split(unit)[0];
  return tenPower(unit, value, decimal.length);
}

export const convertNumberForCalcul = (value) => {
  let v = value;

  if(v) {
    if(v.includes('$')) v = v.replace('$', '');

    if(v.includes(kilo)) {
      if(v.includes('.')) v = addZeroInValue(kilo, v)
      else v = Number(v.split(kilo)[0]) * Math.pow(10, 3);
    } else if(v.includes(million)) {
      if(v.includes('.')) v = addZeroInValue(million, v)
      else v = Number(v.split(million)[0]) * Math.pow(10, 6);
    } else if(v.includes(billion)) {
      if(v.includes('.')) v = addZeroInValue(billion, v)
      else v = Number(v.split(billion)[0]) * Math.pow(10, 9);
    } else if(v.includes(trillion)) {
      if(v.includes('.')) v = addZeroInValue(trillion, v)
      else v = Number(v.split(trillion)[0]) * Math.pow(10, 12);
    }
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
      if(value.includes('\\-')) {
        if(v.includes('.')) v = v.replace('.', '\\,'); // Convert '.' to '\\,' for work with markdownV2.
        v = value.slice(0, 2) + v + unit
      }
      else if(value.includes('\\%2B')) {
        if(v.includes('.')) v = v.replace('.', '\\,'); // Convert '.' to '\\,' for work with markdownV2.
        v = value.slice(0, 4) + v + unit;
      }
      else v = v + unit;
    }
  }

  return v;
}

export const abbreviateNumber = (value) => {
  let num = undefined;
  let v = value;

  if(value) {
    // Take off - (\\-), + (\\%2B) and $ for get number.
    if(value.includes('-')) num = Number(value.split('-')[1]);
    else if(value.includes('B')) num = Number(value.split('B')[1]);
    else if(value.includes('$')) num = Number(value.replace('$', ''));
    else num = Number(value);

    if(1000 <= num && num <= 999999) v = addUnitNumber('K', value, 3, num);
    if(1000000 <= num && num <= 999999999) v = addUnitNumber('M', value, 6, num);
    if(1000000000 <= num && num <= 999999999999) v = addUnitNumber('B', value, 9, num);
    if(1000000000000 <= num && num <= 999999999999999) v = addUnitNumber('T', value, 12, num);
  }

  return v;
}