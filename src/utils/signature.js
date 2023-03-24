import {dateFromString, getValueType, isDate, isString, numberFromString} from "./types";

export const getRowSignature = (row, rIdx, numProps, formatList) => {
  const debugRowIdx = [];

  const signatureFullRow = [];

  if (debugRowIdx.includes(rIdx)) {
    console.log(`getRowSignature: row=${JSON.stringify(row)}`);
  }

  for (let colIdx=0; colIdx < Math.max(row.length, numProps); colIdx++) {
    const value = row[colIdx];
    let valueType;
    let finalValue = value;

    if (debugRowIdx.includes(rIdx)) {
      console.log(`getRowSignature: value=${value} typeof(value)=${typeof(value)}`);
    }

    let valueInfo = getValueType(value, formatList);

    if (debugRowIdx.includes(rIdx)) {
      console.log(`after getValue call: value=${value} typeof(value)=${typeof(value)}`);
    }

    // This should have been avoided to keep the logic clean.
    if(typeof(valueInfo) === 'object') {
      if (debugRowIdx.includes(rIdx)) {
        console.log(`object identified: valueType=${JSON.stringify(valueInfo)}`);
      }
      valueType = valueInfo['type'];
      finalValue = valueInfo['finalValue'];
    } else {
      valueType = valueInfo;
    }

    if (debugRowIdx.includes(rIdx)) {
      console.log(`getRowSignature: rIdx=${rIdx} colIdx=${colIdx} valueType=${JSON.stringify(valueInfo)} finalValue=${finalValue}`);
    }
    const sigElm = {finalType: valueType, finalValue:finalValue};
    if (debugRowIdx.includes(rIdx)) {
      console.log(`getRowSignature: sigElm=${JSON.stringify(sigElm)}`);
    }

    signatureFullRow.push(sigElm);
  }

  if (debugRowIdx.includes(rIdx)) {
    console.log(`getRowSignature: rIdx${rIdx} signatureFullRow:${JSON.stringify(signatureFullRow)}`, signatureFullRow);
  }

  return signatureFullRow;
};

// Even though rIdx is not needed we are passing it for debugging purpose
export const isSignatureMatch = (acceptableSigList, sigList, row, rIdx, sigTag) => {
  const debugMismatch = false;
  const debugRowIdx = [];
  const debugColIdx = []

  const signature = sigList.map(sig => sig['finalType'])

  if (!acceptableSigList) {
    throw `isSignatureMatch acceptableSigList:${JSON.stringify(acceptableSigList, null, 2)} is not valid`;
  }

  if (debugRowIdx.includes(rIdx)) {
    console.log(`rIdx:${rIdx} acceptableSigList=${JSON.stringify(acceptableSigList.map(item => item['acceptableTypes'][0]))}`);
    console.log(`rIdx:${rIdx} sigList=${JSON.stringify(sigList)}`);
  }

  let match = true;
  const finalRow = [];

  for (let colIdx=0; colIdx < acceptableSigList.length; colIdx++) {
    const rowValue = row[colIdx];

    if (!acceptableSigList[colIdx]['acceptableTypes'].includes(signature[colIdx])) {
      if (acceptableSigList[colIdx]['required']) {
        if (debugMismatch && debugRowIdx.includes(rIdx)) {
          console.log(`Not Found: colIdx:${colIdx} cell=${row[colIdx]} ${signature[colIdx]} not found in ${acceptableSigList[colIdx]['acceptableTypes']}`);
        }
        match = false;
        break;
      }
    }

    const choices = acceptableSigList[colIdx]['choices'];
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
    const valueType = acceptableSigList[colIdx]['finalType'];
    if (valueType) {
      let finalValue = null;
      if (valueType === 'date') {
        const valueFormat = acceptableSigList[colIdx]['format'];
        finalValue = dateFromString(rowValue, valueFormat);
      }

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
      finalRow.push(sigList[colIdx]['finalValue']);
    }
  }

  if (match) {
    const result = {
      match,
      finalRow
    }
    if (debugRowIdx.includes(rIdx)) {
      console.log(`isSignatureMatch: result=${JSON.stringify(result, null, 2)}`);
    }
    return result;
  }

  return null;
}
