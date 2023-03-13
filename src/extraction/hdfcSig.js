// This has to be received for a bank
const hdfcHdrSig = [
  {
    choices: ['Date'],
    type: 'string',
    mandatory: true
  },
  {
    choices: ['Narration'],
    type: 'string',
    mandatory: true
  },
  {
    choices: ['Chq./Ref.No.'],
    type: 'string',
    mandatory: true
  },
  {
    choices: ['Value Dt'],
    type: 'string',
    mandatory: true
  },
  {
    choices: ['Withdrawal Amt.'],
    type: 'string',
    mandatory: true
  },
  {
    choices: ['Deposit Amt.'],
    type: 'string',
    mandatory: true
  },
  {
    choices: ['Closing Balance'],
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
