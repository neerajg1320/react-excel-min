// The keyName comes from the schema
// The format comes from set of formats supported by system

// This has to be received for a bank
const hdfcHdrSig = [
  {
    choices: ['Date'],
    type: 'string',
    mandatory: true,
    keyName: "transactionDate"
  },
  {
    choices: ['Narration'],
    type: 'string',
    mandatory: true,
    keyName: "description"
  },
  {
    choices: ['Chq./Ref.No.'],
    type: 'string',
    mandatory: true,
    keyName: "reference",
  },
  {
    choices: ['Value Dt'],
    type: 'string',
    mandatory: true,
    keyName: "valueDate"
  },
  {
    choices: ['Withdrawal Amt.'],
    type: 'string',
    mandatory: true,
    keyName: "debit"
  },
  {
    choices: ['Deposit Amt.'],
    type: 'string',
    mandatory: true,
    keyName: "credit"
  },
  {
    choices: ['Closing Balance'],
    type: 'string',
    mandatory: true,
    keyName: "balance"
  }
];

// This can be auto discovered
const hdfcDebitTxSig = [
  {
    type: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    type: 'number',
    mandatory: true
  },
  {
    type: 'undefined',
    mandatory: true
  },
  {
    type: 'number',
    mandatory: true
  }
];

// This can be auto discovered
// The following is again dependent
const hdfcCreditTxSig = [
  {
    type: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true,
    format: "dd/MM/yyyy"
  },
  {
    type: 'undefined',
    mandatory: true
  },
  {
    type: 'number',
    mandatory: true
  },
  {
    type: 'number',
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
