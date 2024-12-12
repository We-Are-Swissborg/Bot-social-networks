export const compareTwoCrypto = (first, second) => {
  let f = first;
  let s = second;

  if(first.includes('$')) f = first.replace('$', '');
  if(second.includes('$')) s = second.replace('$', '');

  if(f.includes(',')) f = f.replace(',', '');
  if(s.includes(',')) s = s.replace(',', '');

  let value = Number(f) / Number(s);

  if(value.toString().length > 7) value = value.toFixed(9);

  return String(value);
}