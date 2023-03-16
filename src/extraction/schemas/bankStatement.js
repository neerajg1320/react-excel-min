import {indiaDateFormat} from "../../utils/types";

export const BankStatementSchema = [
  {
    header: "SNo",
    keyName: "serialNum",
    width: 50,
    type: "number",
    required: false,
    alignment: "center"
  },
  {
    header: "Transaction Date",
    keyName: "transactionDate",
    width: 100,
    type: "date",
    required: false
  },
  {
    header: "Value Date",
    keyName: "valueDate",
    width: 100,
    type: "date",
    format: indiaDateFormat,
    required: false
  },
  {
    header: "Description",
    keyName: "description",
    width: 250,
    type: "string",
    required: true,
    format: "yyyy-MM-dd",
  },
  {
    header: "Reference",
    keyName: "reference",
    width: 80,
    type: "string",
    acceptedTypes: ["string", "number"],
    required: false
  },
  {
    header: "Debit",
    keyName: "debit",
    width: 80,
    type: "number",
    required: false,
  },
  {
    header: "Credit",
    keyName: "credit",
    width: 80,
    type: "number",
    required: false
  },
  {
    header: "Balance",
    keyName: "balance",
    width: 100,
    type: "number",
    required: true
  },
  {
    header: "DrCr",
    keyName: "drCr",
    width: 50,
    type: "string",
    required: false,
    alignment: "center"
  }
]

