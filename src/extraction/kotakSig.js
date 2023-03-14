// This has to be received for a bank
const kotakHdrSig = [
  {
    type: 'string',
    mandatory: true,
    keyName: 'serialNum'
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "transactionDate"
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "valueDate"
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "description"
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "reference"
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "debit"
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "credit"
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "balance"
  },
  {
    type: 'string',
    mandatory: true,
    keyName: "balanceType"
  }
];

const kotakDebitTxSig = [
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
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: false
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'undefined',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true
  }
];

const kotakCreditTxSig = [
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
    mandatory: true
  },
  {
    type: 'string',
    mandatory: true
  },
  {
    type: 'string',
    mandatory: false
  },
  {
    type: 'undefined',
    mandatory: true
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
    mandatory: true
  }
];

export const kotakSignature = {
  'header': kotakHdrSig,
  'debit': kotakDebitTxSig,
  'credit': kotakCreditTxSig
};
