import {format as fnsFormat, parse as fnsParse, isDate as fnsIsDate, addHours, addMinutes, addSeconds} from "date-fns";

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

export function getValueType(value) {
  let valueType = typeof(value);
  if (valueType === "object") {
    if (isDate(value)) {
      valueType = "date";
    }
  }
  return valueType;
}

export function dateFromString(value, format) {
  if (value && isString(value)) {
    return fnsParse(value, format, new Date());
  }
  return value;
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
  if (value && isString(value)) {
    return parseFloat(value.replaceAll(',',''));
  }

  return value;
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