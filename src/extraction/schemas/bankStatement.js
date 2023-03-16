import {indiaDateFormat} from "../../utils/types";

export const bankStatementSchema = [
  {
    keyName: "serialNum",
    header: "SNo",
    width: 50,
    type: "number",
    required: false,
    alignment: "center"
  },
  {
    keyName: "transactionDate",
    header: "Transaction Date",
    width: 100,
    type: "date",
    required: false
  },
  {
    keyName: "valueDate",
    header: "Value Date",
    width: 100,
    type: "date",
    format: indiaDateFormat,
    required: false
  },
  {
    keyName: "description",
    header: "Description",
    width: 250,
    type: "string",
    required: true,
    format: "yyyy-MM-dd",
  },
  {
    keyName: "reference",
    header: "Reference",
    width: 80,
    type: "string",
    acceptedTypes: ["string", "number"],
    required: false
  },
  {
    keyName: "debit",
    header: "Debit",
    width: 80,
    type: "number",
    required: false,
  },
  {
    keyName: "credit",
    header: "Credit",
    width: 80,
    type: "number",
    required: false
  },
  {
    keyName: "balance",
    header: "Balance",
    width: 100,
    type: "number",
    required: true
  },
  {
    keyName: "drCr",
    header: "DrCr",
    width: 50,
    type: "string",
    choices: ["DR", "CR"],
    required: false,
    alignment: "center"
  }
]

