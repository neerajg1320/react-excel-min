// This has to be received for a bank
const axisHdrSig = [
  {
    choices: ['SRL NO'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: 'serialNum'
  },
  {
    choices: ['Tran Date'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "valueDate"
  },
  {
    choices: ['CHQNO'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "reference"
  },
  {
    choices: ['PARTICULARS'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "description"
  },
  {
    choices: ['DR'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "debit"
  },
  {
    choices: ['CR'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "credit"
  },
  {
    choices: ['BAL'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "balance"
  },
  {
    choices: ['SOL'],
    acceptableTypes:['string'],
    mandatory: true,
    keyName: "sol"
  }
];

const axisDebitTxSig = [
  {
    acceptableTypes:['number'],
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
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    type: "number"
  },
  {
    choices: [' '],
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

const axisCreditTxSig = [
  {
    acceptableTypes:['number'],
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
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    choices: [' '],
    acceptableTypes:['string'],
    mandatory: true
  },
  {
    acceptableTypes:['string'],
    mandatory: true,
    type: "number"
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

export const axisSignature = {
  'header': axisHdrSig,
  'debit': axisDebitTxSig,
  'credit': axisCreditTxSig
};
