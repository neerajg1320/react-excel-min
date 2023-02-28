import {dateFromString, isString} from "../utils/types";

export const bankName = "Kotak2";

export const headerKeynameMap= [
  {
    matchLabels: ["Sl. No."],
    keyName: "serialNum",
  },
  {
    matchLabels: ["Transaction Date"],
    keyName: "transactionDate",
    format: "dd-MM-yyyy"
  },
  {
    matchLabels: ["Value Date"],
    keyName: "valueDate",
    format: "dd-MM-yyyy"
  },
  {
    matchLabels: ["Description"],
    keyName: "description",
  },
  {
    matchLabels: ["Chq / Ref No."],
    keyName: "reference",
  },
  {
    matchLabels: ["Debit"],
    keyName: "debit",
  },
  {
    matchLabels: ["Credit"],
    keyName: "credit",
  },
  {
    matchLabels: ["Balance"],
    keyName: "balance",
  },
  {
    matchLabels: ["Dr / Cr"],
    keyName: "drCr",
  },
  {
    matchLabels: ["Category"],
    keyName: "category",
  },
];
