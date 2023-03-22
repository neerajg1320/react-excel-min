
// This has to be received for a bank


const axisHdrSig = [
  {
    choices: ['SRL NO'],
    acceptableTypes:['string'],
    required: true,
    keyName: 'serialNum'
  },
  {
    choices: ['Tran Date'],
    acceptableTypes:['string'],
    required: true,
    keyName: "valueDate"
  },
  {
    choices: ['CHQNO'],
    acceptableTypes:['string'],
    required: true,
    keyName: "reference"
  },
  {
    choices: ['PARTICULARS'],
    acceptableTypes:['string'],
    required: true,
    keyName: "description"
  },
  {
    choices: ['DR'],
    acceptableTypes:['string'],
    required: true,
    keyName: "debit"
  },
  {
    choices: ['CR'],
    acceptableTypes:['string'],
    required: true,
    keyName: "credit"
  },
  {
    choices: ['BAL'],
    acceptableTypes:['string'],
    required: true,
    keyName: "balance"
  },
  {
    choices: ['SOL'],
    acceptableTypes:['string'],
    required: true,
    keyName: "sol"
  }
];

const axisDebitTxSig = [
  {
    acceptableTypes:['number'],
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
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['number'],
    required: true
  },
  {
    acceptableTypes:['blank'],
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

const axisCreditTxSig = [
  {
    acceptableTypes:['number'],
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
    required: true
  },
  {
    acceptableTypes:['string'],
    required: true
  },
  {
    acceptableTypes:['blank'],
    required: true
  },
  {
    acceptableTypes:['number'],
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

export const axisSignature = {
  'header': axisHdrSig,
  'debit': axisDebitTxSig,
  'credit': axisCreditTxSig
};
