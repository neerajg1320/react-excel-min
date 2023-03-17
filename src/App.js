import * as React from 'react';
import {Routes, Route, redirect} from 'react-router-dom';
import {ReadWrapper} from "./fileReader/ReadWrapper";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {debug} from "./components/config/debug";
import {HomeLayout} from "./components/HomeLayout";
import {TallyWrapper} from "./tally/TallyWrapper";
import {Categories} from "./category/Categories";
import {TableBulk} from "@glassball/table";
import {defaultCategories} from "./presets/categoires";
import {defaultGroups} from "./presets/groups";
import {getRowSignature, isSignatureMatch} from "./utils/signature";
import {kotakSignature} from "./extraction/parsers/kotakSignature";
import {rowStyles} from "./extraction/rowHighlight";
import {hdfcSignature} from "./extraction/parsers/hdfcSignature";
import Button from "react-bootstrap/Button";
import {isString} from "./utils/types";
import {axisSignature} from "./extraction/parsers/axisSignature";
import {bankStatementSchema} from "./extraction/schemas/bankStatement";

// The groups are kept here so that the state can be preserved across Category component render


const App = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <App>`);
  }

  const debugSelectables = false;

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<App>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<App>: Destroyed`);
      }
    }
  }, []);


  // The App keeps a copy of signatures
  // TBD: We are yet to verify the json created using a rule with the related schema
  const [signatureList, setSignatureList] = useState([
    {
      signature: kotakSignature,
      name: 'Kotak',
      dateRange:{},
      schema: bankStatementSchema,
    },
    {
      signature: hdfcSignature,
      name: 'HDFC',
      dateRange:{},
      schema: bankStatementSchema,
    },
    {
      signature: axisSignature,
      name: 'Axis',
      dateRange:{},
      schema: bankStatementSchema,
    }
  ]);

  // The App keeps a copy of data
  const [rows, setRows] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);

  // The App stores categories which are used in Transactions and Categories components
  const [categories, setCategories] = useState(defaultCategories);
  const ledgersRef = useRef([]);
  const bufferRef = useRef({});
  const groups = useMemo(() => {
    return defaultGroups
  });

  const [transactionSelectables, setTransactionSelectables] = useState([
    {
      keyName: "category",
      choices: defaultCategories.map(category => category.name)
    }
  ]);

  const highlightersCombinedSignature = useMemo(() => {
    const createRowObj = (headerSig, finalValues, rIdx) => {
      const debugRowsIdx = [13];

      const obj = {}
      for (let i=0; i<headerSig.length; i++) {
        const key = headerSig[i].keyName;

        let value = finalValues[i];

        if (isString(value)) {
          value = value.trim();
          if (value === "") {
            value = undefined;
          }
        }

        obj[key] = value;
      }
      return obj;
    };

    // We can make style as a function as well
    return [
      {
        name: 'header',
        rule: (row, rIdx) => {
          const rSig = getRowSignature(row, rIdx, -1);
          let tag;
          let matchRowSignature;
          let finalRow;

          // If header is already found. This would work for one table per file
          if (bufferRef.current.headerFound) {
            if (isSignatureMatch(bufferRef.current.headerSignature, rSig, row, rIdx)) {
              matchRowSignature = bufferRef.current.headerSignature;
              tag = 'header';
            } else {
              let result = isSignatureMatch(bufferRef.current.debitSignature, rSig, row, rIdx);
              if (result) {
                tag = 'debit';
                matchRowSignature = bufferRef.current.debitSignature;
                finalRow = result.finalRow;
              } else {
                let result = isSignatureMatch(bufferRef.current.creditSignature, rSig, row, rIdx);
                if (result) {
                  tag = 'credit';
                  matchRowSignature = bufferRef.current.creditSignature;
                  finalRow = result.finalRow;
                }
              }
            }
          } else {
            // Find header if not found yet
            if (signatureList) {

              for (let i=0; i < signatureList.length; i++) {
                const signatureInfo = signatureList[i];
                const bankMatch = isSignatureMatch(signatureInfo['signature']['header'], rSig, row, rIdx);
                if (bankMatch) {
                  tag = 'header';
                  matchRowSignature = signatureInfo['signature']['header'];

                  console.log(`Signature Matched: bank:${signatureInfo.name}`);

                  bufferRef.current = {
                    ...bufferRef.current,
                    headerFound: true,
                    headerSignature: signatureInfo['signature']['header'],
                    debitSignature: signatureInfo['signature']['debit'],
                    creditSignature: signatureInfo['signature']['credit'],
                    columns: [],
                    data: []
                  }
                }
              }
            }
          }

          if(matchRowSignature) {
            // Add row to data if it is a debit or credit row
            if (['debit', 'credit'].includes(tag)) {
              const rowObj = createRowObj(bufferRef.current.headerSignature, finalRow, rIdx);
              rowObj['category'] = "";
              rowObj['meta'] = {tag};
              bufferRef.current.data.push(rowObj);
            }

            return {
              style: rowStyles[tag]
            }
          }

          return false;
        }
      }
    ]
  }, []);

  // The following two could be turned to refs
  const modifiedRowsRef = useRef([]);
  const deletedRowsRef = useRef([]);
  const tallySavedRef = useRef(false);
  const transactionsTableRef = useRef();
  const rowsTableRef = useRef();

  const clearMarkedRows = useCallback(() => {
    console.log(`App: clearMarkedRows()`);
    modifiedRowsRef.current = [];
    deletedRowsRef.current = [];
  }, []);

  // The App component just maintains a copy of data.
  // The modification are done in table and tally components.
  // rows: All the rows of excel in json format
  // txsData: The extracted transactions.
  const handleDataChange = useCallback((rows, txsData, updates, source) => {
    if (rows) {
      console.log(`handleDataChange[${source}]:  rows.length=${rows.length}`);
    }
    if (transactionsData) {
      console.log(`handleDataChange[${source}]: transactionsData.length=${transactionsData.length}`);
    }

    // TBD: We can do the below asynchronously
    // In case it is a data modify or delete action

    if (source === "dataSourceFileReader") {
      if (txsData) {
        const indices = txsData.map((item, index) => index);
        if (indices.length > 0) {
          // setModifiedRows(indices);
          tallySavedRef.current = false;
        }
      }

      if (rows) {
        // console.log(`rows=`, rows);
        setRows(rows);
        bufferRef.current = {};
      }
    } else if (source === "dataSourceTable") {
        // For now we do nothing here.
      console.log(`handleDataChange:dataSourceTable updates=${JSON.stringify(updates, null, 2)}`);
      modifiedRowsRef.current = updates.modifiedRows;
      deletedRowsRef.current = updates.deletedRows;
    } else if (source === "dataSourceTally") {
      // We can count the Tally Operations here. This will happen only if data is submitted to Tally
      // We should get the indices here and clear the modifiedRows
      // console.log(`handleDataChange: source:${source} updates=`, updates);

      const responseIds = updates[0].payload;

      // We need to be very careful here
      // We need to check if all responses are accounted
      if (responseIds.length > 0) {
        clearMarkedRows();
        transactionsTableRef.current.clearMarkedRows();
        tallySavedRef.current = true;
      }

    } else {
      console.error(`handleDataChange: source '${source}' not supported`);
    }

    setTransactionsData(txsData);
  }, []);

  const updateCategoriesInSelectables = (newCategories) => {
    setTransactionSelectables((prev) => {
      const newSelectables = [
        ...prev.filter(selectable => selectable.keyName !== 'category'),
        {
          keyName: "category",
          choices: newCategories ? newCategories.map(ledger => ledger.name) : []
        }
      ];

      if (debugSelectables) {
        console.log(`handleLedgersChange: newSelectables=${JSON.stringify(newSelectables, null, 2)}`)
      }

      return newSelectables;
    })
  };

  const handleLedgersChange = useCallback((newLedgers) => {
    if (debugSelectables) {
      console.log(`App: handleLedgersChange:`, newLedgers);
    }

    ledgersRef.current = newLedgers;

    if (newLedgers && newLedgers.length > 0) {
      updateCategoriesInSelectables(newLedgers);
    }
  }, []);

  const handleCategoriesChange = useCallback((newCategories) => {
    console.log(`App: handleCategoriesChange:`, newCategories);

    // The following changes the list in the Category tab
    setCategories(newCategories);

    // This changes the category selection in the Transactions tab
    if (!ledgersRef.current || ledgersRef.current.length < 1) {
      updateCategoriesInSelectables(newCategories);
    }
  }, []);

  const handleShowData = () => {
    console.log(`handleShowData: data:${JSON.stringify(bufferRef.current.data,null, 2)}`);
  }

  const handleClearData = () => {
    bufferRef.current.data = undefined;
  }

  const handleRulesComplete = () => {
    console.log(`handleRulesComplete():`);
    // handleShowData();
    setTransactionsData(bufferRef.current.data);
  }

  return (
      <TallyWrapper
            data={transactionsData}
            onDataChange={handleDataChange}
            onLedgersChange={handleLedgersChange}
            tallySaved={tallySavedRef.current}
            modifiedRows={modifiedRowsRef.current}
            deletedRows={deletedRowsRef.current}
      >
        <Routes>
          <Route element={<HomeLayout />}>

            {/* Data read from excel file */}
            <Route index element={<ReadWrapper onDataChange={handleDataChange} />} />

            {/* Transactions are categorized by user */}
            <Route
                path="transactions"
                element={
                  <>
                    <div>
                      <Button className="btn-outline-info" onClick={handleShowData}>
                        Show Data
                      </Button>
                      <Button className="btn-outline-info" onClick={handleClearData}>
                        Clear Data
                      </Button>
                    </div>

                    <TableBulk
                        data={rows}
                        stylerRules={highlightersCombinedSignature}
                        onRulesComplete={handleRulesComplete}
                        ref={rowsTableRef}
                    />
                    {
                      bufferRef.current.data?.length > 0 &&
                      <TableBulk
                          data={transactionsData}
                          onDataChange={handleDataChange}
                          updateWithCommit={false}
                          selectables={transactionSelectables}
                          ref={transactionsTableRef}
                      />
                    }

                    </>
                } />

            {/* Category information added by user */}
            <Route
                path="categories"
                element={
                  <Categories
                      {...{categories, groups}}
                      onCategoriesChange={handleCategoriesChange}
                  />
                }
            />

            <Route path="*" element={<p>There's nothing here: 404!</p>} />
          </Route>
        </Routes>
      </TallyWrapper>
  );
};

export default App;
