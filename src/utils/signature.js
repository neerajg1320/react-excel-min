import {isDate} from "./types";

export const getType = (val) => {
  if (isDate(val)) {
    return 'date';
  }
  return typeof(val);
}

export const getRowSignature = (row, rowIdx, numProps) => {
  // if (rowIdx === 12 || rowIdx === 13) {
  //   console.log(`getRowSignature: numProps:${numProps} typeof(row)=${typeof(row)} row:${JSON.stringify(row, null, 2)}`, row);
  // }

  // Problem we are calling Object.keys for an array when called for raw
  // if (Array.isArray(row)) {
  //   console.log(`row is Array`);
  // } else {
  //   console.log(`row is ${typeof(row)}`);
  // }

  const signatureFullRow = [];
  for (let i=0; i < Math.max(row.length, numProps); i++) {
    signatureFullRow.push(getType(row[i]));
  }

  // if (rowIdx === 12 || rowIdx === 13) {
  //   console.log(`getRowSignature: signatureFullRow:${JSON.stringify(signatureFullRow, null, 2)}`);
  // }

  return signatureFullRow;
};

// Even though rIdx is not needed we are passing it for debugging purpose
export const isSignatureMatch = (acceptableSignature, signature, row, rIdx) => {
  if (rIdx === -1 || rIdx === -1) {
    console.log(`rIdx:${rIdx} acceptableSignature=${JSON.stringify(acceptableSignature)}`);
    console.log(`rIdx:${rIdx} signature=${signature}`);
  }

  let match = true;
  for (let i=0; i < acceptableSignature.length; i++) {
    if (acceptableSignature[i]['type'] !== signature[i]) {
      match = false;
      break;
    }

    const choices = acceptableSignature[i]['choices'];
    if (choices) {
      if (rIdx === -1) {
        console.log(`choices=${choices}`);
      }

      const value = row[i];
      if (!choices.includes(value)) {
        // console.log(`rIdx:${rIdx} value:${value} not in choices:${choices}`);
        match = false;
        break;
      }
    }
  }

  return match;
}
