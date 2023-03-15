import {isDate} from "./types";

export const getType = (val) => {
  if (isDate(val)) {
    return 'date';
  }
  return typeof(val);
}

export const getRowSignature = (row, rowIdx, numProps) => {
  const debugRowIdx = [14];

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
  const debugRowIdx = [14];

  if (debugRowIdx.includes(rIdx)) {
    // console.log(`rIdx:${rIdx} acceptableSignature=${JSON.stringify(acceptableSignature)}`);
    console.log(`rIdx:${rIdx} signature=${signature}`);
  }

  let match = true;
  for (let i=0; i < acceptableSignature.length; i++) {
    if (!acceptableSignature[i]['acceptableTypes'].includes(signature[i])) {
      if (acceptableSignature[i]['mandatory']) {
        match = false;
        break;
      }
    }

    const choices = acceptableSignature[i]['choices'];
    if (choices) {
      if (debugRowIdx.includes(rIdx)) {
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
