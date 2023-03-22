import {dateFromString, getValueType, isDate, isString, numberFromString} from "./types";

// export const getType = (val) => {
//   if (isDate(val)) {
//     return 'date';
//   }
//   return typeof(val);
// }

export const getRowSignature = (row, rowIdx, numProps) => {
  const debugRowIdx = [4, 6, 8];

  // if (debugRowIdx.includes(rowIdx)) {
  //   console.log(`getRowSignature: row:${row}`);
  // }

  const signatureFullRow = [];

  for (let i=0; i < Math.max(row.length, numProps); i++) {
    signatureFullRow.push(getValueType(row[i]));
  }

  if (debugRowIdx.includes(rowIdx)) {
    console.log(`getRowSignature: rIdx${rowIdx} signatureFullRow:${signatureFullRow}`);
  }

  return signatureFullRow;
};

// Even though rIdx is not needed we are passing it for debugging purpose
export const isSignatureMatch = (acceptableSignature, signature, row, rIdx, sigTag) => {
  const debugMismatch = true;
  const debugRowIdx = [7];
  const debugColIdx = []

  if (debugRowIdx.includes(rIdx)) {
    console.log(`rIdx:${rIdx} acceptableSignature=${JSON.stringify(acceptableSignature, null, 2)}`);
    console.log(`rIdx:${rIdx} signature=${signature}`);
  }

  let match = true;
  const finalRow = [];

  for (let colIdx=0; colIdx < acceptableSignature.length; colIdx++) {
    const rowValue = row[colIdx];

    if (!acceptableSignature[colIdx]['acceptableTypes'].includes(signature[colIdx])) {
      if (acceptableSignature[colIdx]['required']) {
        if (debugMismatch && debugRowIdx.includes(rIdx)) {
          console.log(`Not Found: colIdx:${colIdx} cell=${row[colIdx]} ${signature[colIdx]} not found in ${acceptableSignature[colIdx]['acceptableTypes']}`);
        }
        match = false;
        break;
      }
    }

    const choices = acceptableSignature[colIdx]['choices'];
    if (choices) {
      if (debugRowIdx.includes(rIdx)) {
        console.log(`choices=${choices}`);
      }

      if (!choices.includes(rowValue)) {
        if (debugMismatch && debugRowIdx.includes(rIdx)) {
          console.log(`rIdx:${rIdx} rowValue:${rowValue} not in choices:${choices}`);
        }
        match = false;
        break;
      }
    }

    // Check if the rowValue is convertible to expected type if though it is read as a string
    const valueType = acceptableSignature[colIdx]['finalType'];
    if (valueType) {
      let finalValue = null;
      if (valueType === 'date') {
        const valueFormat = acceptableSignature[colIdx]['format'];
        finalValue = dateFromString(rowValue, valueFormat);
      }
      // else if (valueType === 'number') {
      //   finalValue = numberFromString(rowValue);
      // }

      if (debugRowIdx.includes(rIdx) && debugColIdx.includes(colIdx)) {
        console.log(`isSignatureMatch: rIdx:${rIdx} i:${colIdx} finalValue:[${typeof(finalValue)}]${finalValue}`);
      }

      if (!finalValue) {
        if (debugMismatch && debugRowIdx.includes(rIdx)) {
          console.log(`isSignatureMatch: rIdx:${rIdx} '${rowValue}' is not a valid ${valueType}`);
        }
        match = false;
        break;
      }

      finalRow.push(finalValue);
    } else {
      finalRow.push(rowValue);
    }
  }

  if (match) {
    return {
      match,
      finalRow
    };
  }

  return null;
}
