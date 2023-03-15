// This has to be received for a bank
const kotakHdrSig = [
  {
    choices: ['Sl. No.'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: 'serialNum'
  },
  {
    choices: ['Transaction Date'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "transactionDate"
  },
  {
    choices: ['Value Date'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "valueDate"
  },
  {
    choices: ['Description'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "description"
  },
  {
    choices: ['Chq / Ref No.'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "reference"
  },
  {
    choices: ['Debit'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "debit"
  },
  {
    choices: ['Credit'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "credit"
  },
  {
    choices: ['Balance'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "balance"
  },
  {
    choices: ['Dr / Cr'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "balanceType"
  }
];

const kotakDebitTxSig = [
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    type: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    type: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: false
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['undefined'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  }
];

const kotakCreditTxSig = [
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    type: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    type: "date",
    format: "dd-MM-yyyy"
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: false
  },
  {
    acceptableTypes:['undefined'],
    mandatory: true
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
    mandatory: true
  }
];

export const kotakSignature = {
  'header': kotakHdrSig,
  'debit': kotakDebitTxSig,
  'credit': kotakCreditTxSig
};
