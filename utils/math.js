import { convertNumberForCalcul } from './numberFormatter.js';

const formatValue = (value) => {
  if(value.toString().charAt(0) == '0') {
    let nbAfterDot = 4;
    let indexString = 2;

    while(value.toString().charAt(indexString) == '0') {
      indexString += 1;
      nbAfterDot += 1;
    }
    return value.toFixed(nbAfterDot);
  } else {
    value = value.toFixed(2);
  }
  const numberFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  return numberFormat.format(value);
}

export const compareTwoCrypto = (first, second) => {
  let f = first;
  let s = second;

  if(first.includes('$')) f = first.replace('$', '');
  if(second.includes('$')) s = second.replace('$', '');

  if(f.includes(',')) f = f.replace(',', '');
  if(s.includes(',')) s = s.replace(',', '');

  let value = Number(f) / Number(s);

  value = formatValue(value);

  return String(value);
}

export const getValueCrypto = (marketCap, supplyCirculation) => {
  let marketC = convertNumberForCalcul(marketCap);
  let supplyC = convertNumberForCalcul(supplyCirculation);
  let value = marketC / supplyC;

  value = formatValue(value);

  return String(value);
}