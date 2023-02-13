export const bankName = "HDFC";

export const headerKeynameMap= [
  {
    matchLabels: ["Date"],
    keyName: "transactionDate",
    format: "dd/MM/yyyy"
  },
  {
    matchLabels: ["Value Dt"],
    keyName: "valueDate",
    format: "dd/MM/yyyy"
  },
  {
    matchLabels: ["Narration"],
    keyName: "description",
  },
  {
    matchLabels: ["Chq./Ref.No."],
    keyName: "reference",
  },
  {
    matchLabels: ["Withdrawal Amt."],
    keyName: "debit",
  },
  {
    matchLabels: ["Deposit Amt."],
    keyName: "credit",
  },
  {
    matchLabels: ["Closing Balance"],
    keyName: "balance",
  },
];
