import {isString, valToString} from "../../utils/types";

export const filterUsingRegex = (rows, columnIds, filterValue) => {
  // console.log(`rows[]=${rows.length} columnsIds=${JSON.stringify(columnIds, null, 2)}`);
  // console.log(`filterValue=${JSON.stringify(filterValue, null, 2)}`);

  const { flagBlank, flagText, filterText, textFlags } = filterValue;

  // None of the filters is active
  if (!flagText && !flagBlank) {
    return rows;
  }

  // Blank filter is not active, Text filter is active but textbox is empty
  if (!flagBlank && (flagText && !filterText)) {
    return rows;
  }

  // console.log(`textFlags=${JSON.stringify(textFlags, null, 2)}`);

  let finalFilterText;
  let re;

  if (textFlags.regex || textFlags.caps) {
    finalFilterText = filterText;
  } else {
    finalFilterText = filterText.toLowerCase();
  }

  if (textFlags.regex) {
    try {
      let reFlags = "";
      if (!textFlags.caps) {
        reFlags = reFlags.concat("i");
      }
      re = new RegExp(finalFilterText, reFlags);
    } catch (err) {
      console.log(`${filterText} is not a valid regex`);
      return [];
    }
  }

  const filteredRows = rows.filter((row, row_idx) => {
    // We can change below to for loop to use early termination
    // Doesn't make much difference now as we use only one column
    const filteredCols = columnIds.filter(colId => {
      // console.log(`flagBlank=${flagBlank} filterText=${filterText}`);

      // If blank is set then look for blank match as well
      if (flagBlank) {
        if (!row.values[colId]) {
          return true;
        }
      }

      let finalCellText;

      if (flagText) {
        if (filterText) {
          if (row.values[colId]) {

            if (textFlags.regex || textFlags.caps || !isString(row.values[colId])) {
              finalCellText = valToString(row.values[colId]);
            } else {
              finalCellText = row.values[colId]?.toLowerCase();
            }

            if (textFlags.regex) {
              // console.log(`finalCellText=${finalCellText} finalFilterText=${finalFilterText}`);
              const match = finalCellText.match(re)
              if (match) {
                return true;
              }
            } else {
              if (textFlags.full) {
                if (finalCellText === finalFilterText)
                  return true;
              } else {
                // console.log(`finalCellText=${finalCellText} finalFilterText=${finalFilterText}`);
                if (finalCellText.includes(finalFilterText))
                  return true;
              }
            }
          }
        } else {
          return true;
        }
      }
      return false;
    })

    // console.log(`row:${row_idx} filteredCols=${JSON.stringify(filteredCols)}`);
    return filteredCols.length > 0;
  });

  // console.log(`Filtered Rows`, filteredRows);
  return filteredRows;

}