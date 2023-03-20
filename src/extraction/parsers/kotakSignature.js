// This has to be received for a bank
const kotakHdrSig = [
  {
    choices: ['Sl. No.'],
    acceptableTypes:['string'],
    required: true,
    keyName: 'serialNum'
  },
  {
    choices: ['Transaction Date'],
    acceptableTypes:['string'],
    required: true,
    keyName: "transactionDate"
  },
  {
    choices: ['Value Date'],
    acceptableTypes:['string'],
    required: true,
    keyName: "valueDate"
  },
  {
    choices: ['Description'],
    acceptableTypes:['string'],
    required: true,
    keyName: "description"
  },
  {
    choices: ['Chq / Ref No.'],
    acceptableTypes:['string'],
    required: true,
    keyName: "reference"
  },
  {
    choices: ['Debit'],
    acceptableTypes:['string'],
    required: true,
    keyName: "debit"
  },
  {
    choices: ['Credit'],
    acceptableTypes:['string'],
    required: true,
    keyName: "credit"
  },
  {
    choices: ['Balance'],
    acceptableTypes:['string'],
    required: true,
    keyName: "balance"
  },
  {
    choices: ['Dr / Cr'],
    acceptableTypes:['string'],
    required: true,
    keyName: "balanceType"
  }
];

const kotakDebitTxSig = [
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: false
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['undefined'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true
  }
];

const kotakCreditTxSig = [
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    required: true,
    finalType: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['string'],
    required: false
  },
  {
    acceptableTypes:['undefined'],
    required: true
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
    required: true
  }
];

export const kotakSignature = {
  'header': kotakHdrSig,
  'debit': kotakDebitTxSig,
  'credit': kotakCreditTxSig
};
