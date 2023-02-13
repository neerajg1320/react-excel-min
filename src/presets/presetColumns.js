import {indiaDateFormat} from "../utils/types";

export const statementColumns = [
  {
    header: "SNo",
    matchLabels: ["Sl. No."],
    keyName: "serialNum",
    width: 50,
    type: "number",
    required: false,
    alignment: "center"
  },
  {
    header: "Transaction Date",
    matchLabels: ["Transaction Date", "Date"],
    keyName: "transactionDate",
    width: 100,
    type: "date",
    // format: `${indiaDateFormat} HH:mm`,
    required: true
  },
  {
    header: "Value Date",
    matchLabels: ["Value Date", "Value Dt"],
    keyName: "valueDate",
    width: 100,
    type: "date",
    format: indiaDateFormat,
    required: false
  },
  {
    header: "Description",
    matchLabels: ["Description", "Narration"],
    keyName: "description",
    width: 250,
    type: "string",
    required: true,
    format: "yyyy-MM-dd",
  },
  {
    header: "Reference",
    matchLabels: ["Chq / Ref number", "Chq./Ref.No."],
    keyName: "reference",
    width: 80,
    type: "string",
    acceptedTypes: ["string", "number"],
    required: false
  },
  {
    header: "Debit",
    matchLabels: ["Debit", "Withdrawal Amt."],
    keyName: "debit",
    width: 80,
    type: "number",
    required: false,
  },
  {
    header: "Credit",
    matchLabels: ["Credit", "Deposit Amt."],
    keyName: "credit",
    width: 80,
    type: "number",
    required: false
  },
  {
    header: "Balance",
    matchLabels: ["Balance", "Closing Balance"],
    keyName: "balance",
    width: 100,
    type: "number",
    required: true
  },
  {
    header: "DrCr",
    matchLabels: ["Dr / Cr"],
    keyName: "drCr",
    width: 50,
    type: "string",
    required: false,
    alignment: "center"
  }
];

export const accountingColumns = [
  {
    header: "Category",
    matchLabels: ["Category"],
    keyName: "category",
    edit: true,
    bulk: true,
    type: 'select', // This needs to be fixed now
    choices: [
      'Conveyance', 'Lodging', 'Stationary', 'Salary', 'Travel', "Suspense"
    ],
    width: 120,
    defaultValue: "Suspense",
    required: true
  },
  {
    header: "Voucher Id",
    matchLabels: ["VoucherId"],
    keyName: "voucherId",
    edit: false,
    bulk: false,
    defaultValue: -1,
    width: 50,
    required: true,
    hidden: false
  },
  {
    header: "Remarks",
    matchLabels: ["Remarks"],
    keyName: "remarks",
    edit: true,
    bulk: true,
    type: 'input',
    defaultValue: ""
  }
];

export const shadowColumns = [
  {
    keyName: "id",
    edit: false,
    hidden: true
  },
  {
    keyName: "modifyMarker",
    edit: false,
    hidden: true
  },
  {
    keyName: "deleteMarker",
    edit: false,
    hidden: true
  },
]
export const presetColumns = [...statementColumns, ...accountingColumns, ...shadowColumns];
