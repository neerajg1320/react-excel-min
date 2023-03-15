// This has to be received for a bank
const kotakHdrSig = [
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: 'serialNum'
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "transactionDate"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "valueDate"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "description"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "reference"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "debit"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "credit"
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "balance"
  },
  {
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
