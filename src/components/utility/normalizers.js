// import {titleize} from 'underscore.string';
const titleize = string =>
  string.toLowerCase().replace(/(^|\s)[a-z]/g, function(f) {
    return f.toUpperCase();
  });

import Logit from 'logit';
var logit = Logit(__filename);
export function normalize(field, fn) {
  let origalOnChange = field.onChange;
  // if (event.type!=='input')
  return {
    ...field,
    onChange: event => {
      logit('normalizer', { field, event, target: event.target });
      event.target.value = fn(event.target.value, field.value);

      return origalOnChange(event);
    },
  };
}

export function properCaseName(name) {
  const lowerCaseNames = ['van', 'de', 'de la', 'de le', 'von', 'van der'];
  var pcexp, pre, result;
  pcexp = /^(Mac|Mc|.+[ '])?(\w)$/;

  result = pcexp.exec(name);
  if (result) {
    pre = result[1];
    // logit('properCaseName', result);
    if (pre) {
      if (lowerCaseNames.includes(pre.trim().toLowerCase())) pre = pre.toLowerCase();
    } else pre = '';
    return pre + result[2].toUpperCase();
  } else return name;
}
export function properCaseAddress(address: string, oldValue) {
  if (address.substr(0, oldValue.length) !== oldValue) return address;
  const addressShortcuts = {
    Wb: 'Whitley Bay',
    'W/b': 'Whitley Bay',
    Ns: 'North Shields',
    'N/s': 'North Shields',
    Nut: 'Newcastle upon Tyne',
    'N/t': 'Newcastle upon Tyne',
    'N/c': 'Newcastle upon Tyne',
    Wal: 'Wallsend',
    Cul: 'Cullercoats',
    'M/s': 'Monkseaton',
    Mon: 'Monkseaton',
    Mnk: 'Monkseaton',
    Tyn: 'Tynemouth',
    Tm: 'Tynemouth',
    TN: 'Tynemouth',
    'T/m': 'Tynemouth',
  };
  let result,
    addrLines = address.split('\n'),
    //Post Code validation
    pcexp = /^([^]*)([abcdefghijklmnoprstuwyz]{1}[abcdefghklmnopqrstuvwxy]?[0-9]{1,2})(\s*)([0-9]{1}[abdefghjlnpqrstuwxyz]{2})$/i;
  addrLines.forEach((line, index) => {
    if ((result = pcexp.exec(line)))
      line =
        titleize(result[1]) + result[2].toUpperCase() + ' ' + result[4].toUpperCase();
    else {
      line = titleize(line);
      if (addressShortcuts[line]) line = addressShortcuts[line];
    }
    addrLines[index] = line;
  });
  return addrLines.join('\n');
}

export function normalizePhone(value, previousValue) {
  if (!value) {
    return value;
  }
  var onlyNums = value.replace(/[^\d]/g, '');
  if (!previousValue) return value;
  if (!previousValue || value.length > previousValue.length) {
    if (onlyNums.length > 0 && onlyNums[0] != '0') onlyNums = '0191' + onlyNums;
    // typing forward
    if (onlyNums.length === 4) {
      return onlyNums + '-';
    }
    if (onlyNums.length === 7) {
      return onlyNums.slice(0, 4) + '-' + onlyNums.slice(4) + '-';
    }
  }
  if (onlyNums.length <= 4) {
    return onlyNums;
  }
  if (onlyNums.length <= 7) {
    return onlyNums.slice(0, 4) + '-' + onlyNums.slice(4);
  }
  return onlyNums.slice(0, 4) + '-' + onlyNums.slice(4, 7) + '-' + onlyNums.slice(7);
}

export default normalizePhone;
