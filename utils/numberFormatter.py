import math
import locale
from decimal import Decimal

KILO = 'K'
MILLION = 'M'
BILLION = 'B'
TRILLION = 'T'

def ten_power(unit: str, value: str, length_decimal: int):
  num_without_dot = value.replace('.', '')
  if unit == KILO: return int(num_without_dot.split(unit)[0]) * math.pow(10, 3 - length_decimal)
  if unit == MILLION: return int(num_without_dot.split(unit)[0]) * math.pow(10, 6 - length_decimal)
  if unit == BILLION: return int(num_without_dot.split(unit)[0]) * math.pow(10, 9 - length_decimal)
  if unit == TRILLION: return int(num_without_dot.split(unit)[0]) * math.pow(10, 12 - length_decimal)

def add_zero_in_value(unit: str, value: str):
  decimal_with_unit = value.split('.')[1]
  decimal_value = decimal_with_unit.split(unit)[0]
  return ten_power(unit, value, len(decimal_value))

def convert_number_for_calcul(value: str):
  v = value.replace(',', '')
  if v != '':
    if '$' in v: v = v.replace('$', '')
    if KILO in v:
      if '.' in v: v = add_zero_in_value(KILO, v)
      else: v = int(v.split(KILO)[0]) * math.pow(10, 3)
    elif MILLION in v:
      if '.' in v: v = add_zero_in_value(MILLION, v)
      else: v = int(v.split(MILLION)[0]) * math.pow(10, 6)
    elif BILLION in v:
      if '.' in v: v = add_zero_in_value(BILLION, v)
      else: v = int(v.split(BILLION)[0]) * math.pow(10, 9)
    elif TRILLION in v:
      if '.' in v: v = add_zero_in_value(TRILLION, v)
      else: v = int(v.split(TRILLION)[0]) * math.pow(10, 12)
    else:
      if '.' in v: v = float(v)
      else: v = int(v)
  return v

def add_unit_number(unit: str, value: str, exponent: int, num: int | float):
  n = round((num / math.pow(10, exponent)), 3)
  v = str(n)
  length_num = len(v)
  last_digit = v[length_num - 1]
  is_take_off_zero = True

  while is_take_off_zero:
    if last_digit == '0':
      v = v[0:length_num - 1]
      length_num = len(v)
      last_digit = v[length_num - 1]
    else:
      is_take_off_zero = False

      if last_digit == '.': v = v[0:length_num - 1]
      if '\\-' in value:
        if '.' in v: v = v.replace('.', '\\,') # Convert '.' to '\\,' for work with markdownV2.
        v = value.slice(0, 2) + v + unit
      elif '\\%2B' in value:
        if '.' in v: v = v.replace('.', '\\,') # Convert '.' to '\\,' for work with markdownV2.
        v = value.slice(0, 4) + v + unit
      else: v = v + unit
  return v

def abbreviate_number(value: str):
  num = value
  v = value

  if value != '':
    if '-' in value: num = value.split('-')[1]
    elif BILLION in value: num = value.split(BILLION)[0]
    if '$' in value: num = num.replace('$', '')
    if ',' in value: num = num.replace(',', '')

    num = float(num)

    if 1000 <= num and num <= 999999: v = add_unit_number(KILO, value, 3, num)
    if 1000000 <= num and num <= 999999999: v = add_unit_number(MILLION, value, 6, num)
    if 1000000000 <= num and num <= 999999999999: v = add_unit_number(BILLION, value, 9, num)
    if 1000000000000 <= num and num <= 999999999999999: v = add_unit_number(TRILLION, value, 12, num)
  return v

def format_value(value: int | float):
  str_value = str(Decimal(str(value)))
  value_first_digit = str_value[0]

  if value_first_digit == '0':
    nb_after_dot = 4
    index_string = 2
    while str_value[index_string] == '0':
      index_string += 1
      nb_after_dot += 1
    return round(Decimal(str(value)), nb_after_dot)

  value = round(value, 2)
  locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
  number_format = locale.currency(value, symbol=False, grouping=True)
  return number_format