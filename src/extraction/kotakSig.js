// This has to be received for a bank
const kotakHdrSig = [
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: 'serialNum'
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "transactionDate"
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "valueDate"
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "description"
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "reference"
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "debit"
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "credit"
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "balance"
  },
  {
    acceptableType: 'string',
    mandatory: true,
    keyName: "balanceType"
  }
];

const kotakDebitTxSig = [
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
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: false
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'undefined',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true
  }
];

const kotakCreditTxSig = [
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
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: true
  },
  {
    acceptableType: 'string',
    mandatory: false
  },
  {
    acceptableType: 'undefined',
    mandatory: true
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
    mandatory: true
  }
];

export const kotakSignature = {
  'header': kotakHdrSig,
  'debit': kotakDebitTxSig,
  'credit': kotakCreditTxSig
};
