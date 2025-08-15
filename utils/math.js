import { convertNumberForCalcul, formatValue } from './numberFormatter.js';

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
  const marketC = convertNumberForCalcul(marketCap);
  const supplyC = convertNumberForCalcul(supplyCirculation);
  let value = marketC / supplyC;

  value = formatValue(value);

  return String(value);
}