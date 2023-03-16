import {dateFromString, isDate, isString, numberFromString} from "./types";

export const getType = (val) => {
  if (isDate(val)) {
    return 'date';
  }
  return typeof(val);
}

export const getRowSignature = (row, rowIdx, numProps) => {
  const debugRowIdx = [];

  if (debugRowIdx.includes(rowIdx)) {
    console.log(`getRowSignature: row:${row}`);
  }

  const signatureFullRow = [];

  for (let i=0; i < Math.max(row.length, numProps); i++) {
    signatureFullRow.push(getType(row[i]));
  }

  return signatureFullRow;
};

// Even though rIdx is not needed we are passing it for debugging purpose
export const isSignatureMatch = (acceptableSignature, signature, row, rIdx) => {
  const debugRowIdx = [];
  const debugColIdx = []

  if (debugRowIdx.includes(rIdx)) {
    console.log(`rIdx:${rIdx} acceptableSignature=${JSON.stringify(acceptableSignature)}`);
    console.log(`rIdx:${rIdx} signature=${signature}`);
  }

  let match = true;
  for (let i=0; i < acceptableSignature.length; i++) {
    const rowValue = row[i];

    if (!acceptableSignature[i]['acceptableTypes'].includes(signature[i])) {
      if (acceptableSignature[i]['mandatory']) {
        if (debugRowIdx.includes(rIdx)) {
          console.log(`Not Found: ${signature[i]} not found in ${acceptableSignature[i]['acceptableTypes']}`);
        }
        match = false;
        break;
      }
    }

    const choices = acceptableSignature[i]['choices'];
    if (choices) {
      if (debugRowIdx.includes(rIdx)) {
        console.log(`choices=${choices}`);
      }

      if (!choices.includes(rowValue)) {
        // console.log(`rIdx:${rIdx} rowValue:${rowValue} not in choices:${choices}`);
        match = false;
        break;
      }
    }


    // Check if the rowValue is convertible to expected type if though it is read as a string
    const valueType = acceptableSignature[i]['finalType'];
    if (valueType) {
      let finalValue = null;
      if (valueType === 'date') {
        const valueFormat = acceptableSignature[i]['format'];
        finalValue = dateFromString(rowValue, valueFormat);
      } else if (valueType === 'number') {
        finalValue = numberFromString(rowValue);
      }

      if (debugRowIdx.includes(rIdx) && debugColIdx.includes(i)) {
        console.log(`isSignatureMatch: rIdx:${rIdx} i:${i} finalValue:[${typeof(finalValue)}]${finalValue}`);
      }

      if (!finalValue) {
        // console.log(`isSignatureMatch: rIdx:${rIdx} '${rowValue}' is not a valid ${valueType}`);
        match = false;
        break;
      }
    }

  }

  if (match) {
    return {
      match
    };
  }

  return null;
}
