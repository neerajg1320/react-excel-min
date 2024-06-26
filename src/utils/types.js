import {
  format as fnsFormat,
  parse as fnsParse,
  isDate as fnsIsDate,
  isValid as fnsIsValid,
  getYear,
  addHours, addMinutes, addSeconds,
  addYears
} from "date-fns";

export const isoDateFormat = "yyyy-MM-dd";
export const indiaDateFormat = "dd/MM/yyyy";

export function isString(val) {
  return (typeof val === 'string' || val instanceof String)
}

export function isDate(val) {
  // Kept for reference
  // return val instanceof Date && !isNaN(val)

  return fnsIsDate(val);
}

export function valToString(val, format) {
  if (isDate(val)) {
    return fnsFormat(val, format ? format : indiaDateFormat);
  }

  return val ? val.toString() : "";
}

export function getAllTypes() {
  return [
      'undefined',
      'string',
      'blank',
      'number',
      'date',
      'object'
  ];
}

export function getAllDateFormats() {
  return [
    {
      name: 'ISO9661',
      format: 'dd-MM-yyyy',
    },
    {
      name: 'Date-India',
      format: 'dd/MM/yyyy',
    },
    {
      name: 'Date-US',
      format: 'MM/dd/yyyy',
    },
    {
      name: 'SBI',
      format: 'dd-MMM-yy'
    }
  ];
}

export function getValueType(value, formatList, debug=false) {
  if (debug && isString(value) && value.length === 10) {
    console.log(`getValueType: value=${value}`);
  }

  if (value === undefined) {
    return 'undefined';
  }

  if (isNaN(value)) {
    const type = typeof(value);

    if (type === 'object') {
      if (isDate(value)) {
        return 'date'
      }

      return 'object'
    }

    if (isString(value)) {
      if (value.trim() === "") {
        return 'blank';
      }

      // Check for formats like date etc
      if (debug) {
        console.log(`formatList=${JSON.stringify(formatList)}`);
      }

      if (formatList) {
        for (const fmt of formatList) {
          if (fmt['type'] === 'date') {
            const finalValue = dateFromString(value, fmt['format']);
            if (debug) {
              console.log(`finalValue=${finalValue}`);
            }

            if (isDate(finalValue)) {
              return {
                type: fmt['type'],
                finalValue
              };
            }
          }
        }
      }

      return 'string';
    }

    return type;
  }

  // The blank string has to be classified as a string
  if (typeof(value) === 'string' && value.trim() === "") {
    return 'blank';
  }

  return 'number';
}

// dateFromString:
// returns
//    a date object if input is a valid date string
//    null if input is not a valid date string
export function dateFromString(value, format) {
  let date;

  if (value && isString(value)) {
    try {
      date = fnsParse(value, format, new Date());
      if (!fnsIsValid(date)) {
        // console.error(`dateFromString: '[${typeof(date)}]${date}' is not a valid date`);
        date = null;
      } else {
        // Fix the year and change 20 to 2020
        const year = getYear(date);
        if (year < 100) {
          date = addYears(date, 2000);
        }

      }
    } catch (e) {
      console.error(`dateFromString: ${e}`);
    }
  }

  return date;
}

export function dateFromNumber(value) {
  if (value) {
    // console.log(`Need to convert number:${value} to date`);

    // https://stackoverflow.com/questions/16229494/converting-excel-date-serial-number-to-date-using-javascript
    let utc_days  = Math.floor(value - 25569);
    let utc_value = utc_days * 86400;
    let date_info = new Date(utc_value * 1000);

    let fractional_day = value - Math.floor(value) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    let seconds = total_seconds % 60;

    total_seconds -= seconds;

    let hours = Math.floor(total_seconds / (60 * 60));
    let minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
  }

  return value;
}

export function numberFromString(value) {
  let num;
  if (value && isString(value)) {
    num = parseFloat(value.replaceAll(',',''));
    if (isNaN(num)) {
      num = null;
    }
  }

  return num;
}

// Strangely Sheetjs reads the data and reduces 5:30 hrs and an adiitional 10 seconds
export function fixDatesInObject(obj) {

  const adjustedObj = Object.fromEntries(Object.entries(obj).map(([key, value]) =>{
    if (isDate(value)) {
      // console.log(`key=${key} value=${JSON.stringify(value)}`);
      value = addSeconds(addMinutes(addHours(value, 5), 30), 10);
    }
    return [key, value];
  }));

  return adjustedObj;
}