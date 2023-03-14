// This has to be received for a bank
const kotakHdrSig = [
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
    mandatory: true
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
