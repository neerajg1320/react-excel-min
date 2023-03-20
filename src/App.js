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
import {rowStyles} from "./extraction/highlighters/statementHighlight";
import {detectionStyles} from "./extraction/highlighters/detectionHighlight";
import {hdfcSignature} from "./extraction/parsers/hdfcSignature";
import Button from "react-bootstrap/Button";
import {isString} from "./utils/types";
import {axisSignature} from "./extraction/parsers/axisSignature";
import {bankStatementSchema} from "./extraction/schemas/bankStatement";
import Switch from "react-switch";
import ExpandableButton from "./components/expandableButton/ExpandableButton";
import {HeaderCreator} from "./extraction/components/HeaderCreator";

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
    // {
    //   signature: axisSignature,
    //   name: 'Axis',
    //   dateRange:{},
    //   schema: bankStatementSchema,
    // }
  ]);

  //
  const [highlighterDetected, setHighlighterDetected] = useState(false);
  const [headersDetected, setHeadersDetected] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState(undefined);
  const [createHeaderExpanded, setCreateHeaderExpanded] = useState(false);
  const [highlighterApplied, setHighlighterApplied] = useState(false);

  // The App keeps a copy of data
  const [rows, setRows] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);

  const rawTableRef = useRef();
  const detectionBufferRef = useRef({
    headerProbables: []
  });
  const highlightedTableRef = useRef();
  const transactionsBufferRef = useRef({});
  const transactionsTableRef = useRef();

  // The App stores categories which are used in Transactions and Categories components
  const [categories, setCategories] = useState(defaultCategories);
  const ledgersRef = useRef([]);

  const groups = useMemo(() => {
    return defaultGroups
  });

  const [transactionSelectables, setTransactionSelectables] = useState([
    {
      keyName: "category",
      choices: defaultCategories.map(category => category.name)
    }
  ]);

  const detectHighlighter = useCallback((data, signatures) => {
    // console.log(`data:${JSON.stringify(data)}`);

    data.map((row, rIdx) => {
      if (signatures) {
        const rSig = getRowSignature(row, rIdx, -1);

        for (let i=0; i < signatures.length; i++) {
          const signatureInfo = signatures[i];
          const bankMatch = isSignatureMatch(signatureInfo['signature']['header'], rSig, row, rIdx);
          if (bankMatch) {
            console.log(`Signature Matched: bank:${signatureInfo.name}`);

            transactionsBufferRef.current = {
              ...transactionsBufferRef.current,
              headerFound: true,
              headerSignature: signatureInfo['signature']['header'],
              debitSignature: signatureInfo['signature']['debit'],
              creditSignature: signatureInfo['signature']['credit'],
              columns: [],
              data: []
            }

            console.log(`rowHighlightingRules: rIdx:${rIdx} highlighter detected from hardcoded signatures`);
            setHighlighterDetected(true);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    console.log(`useEffect[row, signatureList] signatureList[${signatureList.length}]`);

    detectHighlighter(rows, signatureList);
  }, [rows, signatureList]);


  // Rules for highlighter detection
  const headerDetectionRules = useMemo(() => {
    const debugRowIdx = [3,4];
    const headerMemberThreshold = 5;

    return [
      {
        name: 'constructor',
        rule: (row, rIdx) => {
          const rSig = getRowSignature(row, rIdx, -1);
          const rSigSet = [...new Set(rSig)];

          if (debugRowIdx.includes(rIdx)) {
            console.log(`rIdx:${rIdx} rSig=${rSig} rSigSet[${rSigSet.length}]=${JSON.stringify([...rSigSet], null, 2)}`);
          }

          // Below is the detection condition for the header.
          // For now we just need to detect the header.
          // Later we will add support to detect headerless tables
          if (rSigSet.length === 1 && rSigSet.includes('string') && rSig.length > headerMemberThreshold) {
            detectionBufferRef.current.headerProbables.push(row);

            return {
              style: detectionStyles['header']
            }
          }

          return false;
        }
      }
    ]
  }, []);

  const handleDetectionRulesEvent = (event) => {
    console.log(`handleDetectionRulesEvent: ${JSON.stringify(event)}`);

    switch (event.name) {
      case 'complete':
        console.log(`detectionBufferRef:${JSON.stringify(detectionBufferRef.current, null, 2)}`);
        if (detectionBufferRef.current.headerProbables.length > 0) {
          setHeadersDetected(true);
          if (detectionBufferRef.current.headerProbables.length === 1) {
            setSelectedHeader(detectionBufferRef.current.headerProbables[0])
          }
        }
        break;

      case 'start':
        detectionBufferRef.current.headerProbables = [];
        setHeadersDetected(false);
        break;

      default:
        console.error(`event '${event.name}' not supported`);
    }

  }

  // Highlight Rows using hardcoded header parsers
  const rowHighlightingRules = useMemo(() => {
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
          if (transactionsBufferRef.current.headerFound) {
            if (isSignatureMatch(transactionsBufferRef.current.headerSignature, rSig, row, rIdx)) {
              matchRowSignature = transactionsBufferRef.current.headerSignature;
              tag = 'header';
            } else {
              let result;

              if (transactionsBufferRef.current.debitSignature) {
                result = isSignatureMatch(transactionsBufferRef.current.debitSignature, rSig, row, rIdx);
                if (result) {
                  tag = 'debit';
                  matchRowSignature = transactionsBufferRef.current.debitSignature;
                  finalRow = result.finalRow;
                }
              }

              if (!result) {
                if (transactionsBufferRef.current.debitSignature) {
                  result = isSignatureMatch(transactionsBufferRef.current.creditSignature, rSig, row, rIdx);
                  if (result) {
                    tag = 'credit';
                    matchRowSignature = transactionsBufferRef.current.creditSignature;
                    finalRow = result.finalRow;
                  }
                }
              }
            }
          }

          if(matchRowSignature) {
            // Add row to data if it is a debit or credit row
            if (['debit', 'credit'].includes(tag)) {
              const rowObj = createRowObj(transactionsBufferRef.current.headerSignature, finalRow, rIdx);
              rowObj['category'] = "";
              rowObj['meta'] = {tag};
              transactionsBufferRef.current.data.push(rowObj);
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
        transactionsBufferRef.current = {};
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
    console.log(`handleShowData: data:${JSON.stringify(transactionsBufferRef.current.data,null, 2)}`);
  }

  const clearTransactionsData = () => {
    transactionsBufferRef.current.data = [];
    setTransactionsData([]);
  }

  const handleClearData = () => {
    clearTransactionsData();
  }



  const handleHighlightingRulesEvent = (event) => {
    if (event.name === 'complete') {
      setTransactionsData(transactionsBufferRef.current.data);
      setHighlighterApplied(true);
    }
  }

  const handleToggleHighlighterDetected = (value) => {
    if (!value) {
      setHighlighterApplied(value);
      clearTransactionsData();
    }
    setHighlighterDetected(value);
  }

  const handleCreatorEvent = (event, mapper) => {
    console.log(`event:${JSON.stringify(event)} mapper:${JSON.stringify(mapper, null, 2)}`);
    const detectedSignature = Object.entries(mapper).map(([k,v]) => {
        // console.log(`item:${k}, ${v}`);
        return {
          acceptableTypes: ['string'],
          keyName: v,
          required: true
        };
    });
    console.log(`detector=${JSON.stringify(detectedSignature, null, 2)}`);

    const sigObj = {
      signature: {
        'header': detectedSignature
      },
      name: 'Axis',
      dateRange:{},
      schema: bankStatementSchema,
    };

    setSignatureList((prev) => {
      return [...prev, sigObj]
    });
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
                    <div style={{
                      display: "flex", flexDirection: "row", alignItems: "center", gap: "20px"
                    }}>
                      <Button className="btn-outline-info" onClick={handleShowData}>
                        Show Data
                      </Button>
                      <Button className="btn-outline-info" onClick={handleClearData}>
                        Clear Data
                      </Button>
                      <ExpandableButton
                          title="Create Header"
                          expanded={createHeaderExpanded}
                          onChange={setCreateHeaderExpanded}
                          popupPosition={{right: "0px", top: "35px"}}
                      >
                        <div>
                          <p>Fill this in</p>
                        </div>
                      </ExpandableButton>

                      <span>Highlighter Detected</span>
                      <Switch checked={highlighterDetected} onChange={handleToggleHighlighterDetected} />
                    </div>

                    {
                      <>
                      <h4>Raw Table</h4>
                      <TableBulk
                          data={rows}
                          stylerRules={headerDetectionRules}
                          onRulesEvent={handleDetectionRulesEvent}
                          ref={rawTableRef}
                      />
                      </>
                    }

                    {
                      selectedHeader &&
                      <HeaderCreator
                          row={selectedHeader}
                          schema={bankStatementSchema}
                          onEvent={handleCreatorEvent}
                      />
                    }

                    {
                      highlighterDetected &&
                      <>
                      <h4>Highlighted Table</h4>
                      <TableBulk
                          data={rows}
                          stylerRules={rowHighlightingRules}
                          onRulesEvent={handleHighlightingRulesEvent}
                          ref={highlightedTableRef}
                      />
                      </>
                    }

                    {
                      (transactionsData && transactionsData.length > 0)  &&
                      <>
                      <h4>Transactions Table</h4>
                      <TableBulk
                          data={transactionsData}
                          onDataChange={handleDataChange}
                          updateWithCommit={false}
                          selectables={transactionSelectables}
                          ref={transactionsTableRef}
                      />
                      </>
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
