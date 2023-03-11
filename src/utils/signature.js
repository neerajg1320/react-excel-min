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