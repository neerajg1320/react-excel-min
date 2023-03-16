// The keyName comes from the schema
// The format comes from set of formats supported by system

// This has to be received for a bank
const hdfcHdrSig = [
  {
    choices: ['Date'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "transactionDate"
  },
  {
    choices: ['Narration'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "description"
  },
  {
    choices: ['Chq./Ref.No.'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "reference",
  },
  {
    choices: ['Value Dt'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "valueDate"
  },
  {
    choices: ['Withdrawal Amt.'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "debit"
  },
  {
    choices: ['Deposit Amt.'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "credit"
  },
  {
    choices: ['Closing Balance'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "balance"
  }
];

// This can be auto discovered
const hdfcDebitTxSig = [
  {
    acceptableTypes:['string'],
    mandatory: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['number'],
    mandatory: true
  },
  {
    acceptableTypes:['undefined'],
    mandatory: true
  },
  {
    acceptableTypes:['number'],
    mandatory: true
  }
];

// This can be auto discovered
// The following is again dependent
const hdfcCreditTxSig = [
  {
    acceptableTypes:['string'],
    mandatory: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['undefined'],
    mandatory: true
  },
  {
    acceptableTypes:['number'],
    mandatory: true
  },
  {
    acceptableTypes:['number'],
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
