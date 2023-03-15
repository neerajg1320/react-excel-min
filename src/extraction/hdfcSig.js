// The keyName comes from the schema
// The format comes from set of formats supported by system

// This has to be received for a bank
const hdfcHdrSig = [
  {
    choices: ['Date'],
    acceptableType: 'string',
    mandatory: true,
    keyName: "transactionDate"
  },
  {
    choices: ['Narration'],
    acceptableType: 'string',
    mandatory: true,
    keyName: "description"
  },
  {
    choices: ['Chq./Ref.No.'],
    acceptableType: 'string',
    mandatory: true,
    keyName: "reference",
  },
  {
    choices: ['Value Dt'],
    acceptableType: 'string',
    mandatory: true,
    keyName: "valueDate"
  },
  {
    choices: ['Withdrawal Amt.'],
    acceptableType: 'string',
    mandatory: true,
    keyName: "debit"
  },
  {
    choices: ['Deposit Amt.'],
    acceptableType: 'string',
    mandatory: true,
    keyName: "credit"
  },
  {
    choices: ['Closing Balance'],
    acceptableType: 'string',
    mandatory: true,
    keyName: "balance"
  }
];

// This can be auto discovered
const hdfcDebitTxSig = [
  {
    acceptableType: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    acceptableType: 'number',
    mandatory: true
  },
  {
    acceptableType: 'undefined',
    mandatory: true
  },
  {
    acceptableType: 'number',
    mandatory: true
  }
];

// This can be auto discovered
// The following is again dependent
const hdfcCreditTxSig = [
  {
    acceptableType: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    acceptableType: 'undefined',
    mandatory: true
  },
  {
    acceptableType: 'number',
    mandatory: true
  },
  {
    acceptableType: 'number',
    mandatory: true
  }
];

// These can be auto discovered
// The header has to be confirmed and others can be derived.
export const hdfcSignature = {
  'header': hdfcHdrSig,
  'debit': hdfcDebitTxSig,
  'credit': hdfcCreditTxSig
};
