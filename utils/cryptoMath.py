from .numberFormatter import convert_number_for_calcul, format_value

def compare_two_crypto(first: str, second: str):
  f = first
  s = second

  if '$' in first: f = first.replace('$', '')
  if '$' in second: s = second.replace('$', '')

  if ',' in f: f = f.replace(',', '')
  if ',' in s: s = s.replace(',', '')

  value = float(f) / float(s)
  value = format_value(value)
  return str(value)

def get_value_crypto(market_cap: str, supply_circulation: str):
  market_c: int = convert_number_for_calcul(market_cap)
  supply_c: int = convert_number_for_calcul(supply_circulation)

  value = market_c / supply_c
  value = format_value(value)
  return str(value)