// This has to be received for a bank
const hdfcHdrSig = [
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

const hdfcDebitTxSig = [
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

const hdfcCreditTxSig = [
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

export const hdfcSignature = {
  'header': hdfcHdrSig,
  'debit': hdfcDebitTxSig,
  'credit': hdfcCreditTxSig
};
