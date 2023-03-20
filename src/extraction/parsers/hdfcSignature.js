// The keyName comes from the schema
// The format comes from set of formats supported by system

// This has to be received for a bank
const hdfcHdrSig = [
  {
    choices: ['Date'],
    acceptableTypes:['string'],
    required: true,
    keyName: "transactionDate"
  },
  {
    choices: ['Narration'],
    acceptableTypes:['string'],
    required: true,
    keyName: "description"
  },
  {
    choices: ['Chq./Ref.No.'],
    acceptableTypes:['string'],
    required: true,
    keyName: "reference",
  },
  {
    choices: ['Value Dt'],
    acceptableTypes:['string'],
    required: true,
    keyName: "valueDate"
  },
  {
    choices: ['Withdrawal Amt.'],
    acceptableTypes:['string'],
    required: true,
    keyName: "debit"
  },
  {
    choices: ['Deposit Amt.'],
    acceptableTypes:['string'],
    required: true,
    keyName: "credit"
  },
  {
    choices: ['Closing Balance'],
    acceptableTypes:['string'],
    required: true,
    keyName: "balance"
  }
];

// This can be auto discovered
const hdfcDebitTxSig = [
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['number'],
    required: true
  },
  {
    acceptableTypes:['undefined'],
    required: true
  },
  {
    acceptableTypes:['number'],
    required: true
  }
];

// This can be auto discovered
// The following is again dependent
const hdfcCreditTxSig = [
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd/MM/yy"
  },
  {
    acceptableTypes:['undefined'],
    required: true
  },
  {
    acceptableTypes:['number'],
    required: true
  },
  {
    acceptableTypes:['number'],
    required: true
  }
];

// These can be auto discovered
// The header has to be confirmed and others can be derived.
export const hdfcSignature = {
  'header': hdfcHdrSig,
  'debit': hdfcDebitTxSig,
  'credit': hdfcCreditTxSig
};
