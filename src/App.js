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
import {getAllDateFormats, isString} from "./utils/types";
import {axisSignature} from "./extraction/parsers/axisSignature";
import {bankStatementSchema} from "./extraction/schemas/bankStatement";
import Switch from "react-switch";
import {RuleCreator} from "./extraction/components/RuleCreator";

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

  const dateFormats = useMemo(() => {
    return getAllDateFormats();
  }, []);

  const formatList = useMemo(() => {
    const fmtList = dateFormats.map(fmt => {
      return {
        ...fmt,
        type: 'date'
      }
    })

    // console.log(`fmtList:${JSON.stringify(fmtList, null, 2)}`);

    return fmtList;
  }, [dateFormats]);

  // The App keeps a copy of signatures
  // TBD: We are yet to verify the json created using a rule with the related schema
  const [signatureList, setSignatureList] = useState([
    // {
    //   signature: kotakSignature,
    //   name: 'Kotak',
    //   dateRange:{},
    //   schema: bankStatementSchema,
    // },
    // {
    //   signature: hdfcSignature,
    //   name: 'HDFC',
    //   dateRange:{},
    //   schema: bankStatementSchema,
    // },
    // {
    //   signature: axisSignature,
    //   name: 'Axis',
    //   dateRange:{},
    //   schema: bankStatementSchema,
    // }
  ]);

  //
  const [highlighterDetected, setHighlighterDetected] = useState(false);
  const [highlighterApplied, setHighlighterApplied] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const [headerRule, setHeaderRule] = useState(undefined);
  const [signatureName, setSignatureName] = useState(undefined);
  const [signature, setSignature] = useState({});

  // Currently we have two rule types: 'header', 'data'
  const [ruleType, setRuleType] = useState(undefined);
  // Tag signifies type of data like 'debit', 'credit'. There is no limitation on number of tags
  const [ruleTag, setRuleTag] = useState({});
  const [ruleSampleRows, setRuleSampleRows] = useState([]);

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
    console.log(`data:${JSON.stringify(data, null, 2)}`);
    // console.log(`detectHighlighter:`, signatures);

    data.map((row, rIdx) => {
      if (signatures) {
        const rSig = getRowSignature(row, rIdx, -1, formatList);

        for (let i=0; i < signatures.length; i++) {
          const signatureInfo = signatures[i];

          // Don't apply a signature if it doesn't have a header
          if (!signatureInfo['signature'] || !signatureInfo['signature']['header']) {
            continue;
          }

          const bankMatch = isSignatureMatch(signatureInfo['signature']['header'], rSig, row, rIdx, 'header');
          if (bankMatch) {
            // console.log(`Signature Matched: bank:${signatureInfo.name}`);

            transactionsBufferRef.current = {
              ...transactionsBufferRef.current,
              headerFound: true,
              headerSignature: signatureInfo['signature']['header'],
              debitSignature: signatureInfo['signature']['debit'],
              creditSignature: signatureInfo['signature']['credit'],
              columns: [],
              data: []
            }

            // console.log(`rowHighlightingRules: rIdx:${rIdx} highlighter detected from hardcoded signatures`);
            setHighlighterDetected(true);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    console.log(`signatureList.signaure: ${JSON.stringify(signatureList.map(sig => sig), null, 2)}`);

    detectHighlighter(rows, signatureList);
  }, [rows, signatureList]);


  // Rules for highlighter detection
  // This helps in finding the proable rows which are a header
  // We often skip this one
  const headerDetectionRules = useMemo(() => {
    const debugRowIdx = [3,4];
    const headerMemberThreshold = 5;

    return [
      {
        name: 'constructor',
        rule: (row, rIdx) => {
          const rSig = getRowSignature(row, rIdx, -1, formatList);
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
          // This should not be done automatically
          // This should be marked from the table using a click button with choices
          // Mark as Header
          // Mark as Debit
          // Mark as Credit
          // Mark as <Custom>
          // Can we make event handler for selected rows change
          // if (detectionBufferRef.current.headerProbables.length === 1) {
          //   setSelectedHeader(detectionBufferRef.current.headerProbables[0])
          // }
        }
        break;

      case 'start':
        detectionBufferRef.current.headerProbables = [];
        break;

      default:
        console.error(`event '${event.name}' not supported`);
    }

  }

  // These are simple highlighter which are used when the [header, debit, credit] rules are already created
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
          const rSig = getRowSignature(row, rIdx, -1, formatList);
          let tag;
          let matchRowSignature;
          let finalRow;

          // If header is already found. This would work for one table per file
          if (transactionsBufferRef.current.headerFound) {
            if (isSignatureMatch(transactionsBufferRef.current.headerSignature, rSig, row, rIdx, 'header')) {
              matchRowSignature = transactionsBufferRef.current.headerSignature;
              tag = 'header';
            } else {
              let result;

              if (transactionsBufferRef.current.debitSignature) {
                result = isSignatureMatch(transactionsBufferRef.current.debitSignature, rSig, row, rIdx, 'debit');
                if (result) {
                  tag = 'debit';
                  matchRowSignature = transactionsBufferRef.current.debitSignature;
                  finalRow = result.finalRow;
                }
              }

              if (!result) {
                if (transactionsBufferRef.current.creditSignature) {
                  result = isSignatureMatch(transactionsBufferRef.current.creditSignature, rSig, row, rIdx, 'credit');
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

  const handleRuleCreatorEvent = (event, {tag, rule}) => {
    // console.log(`handleRuleCreatorEvent:${JSON.stringify(event)} tag:${tag} rule:${JSON.stringify(rule, null, 2)}`);

    if (tag === 'header') {
      setHeaderRule(rule);
      setSignatureName('Axis')

      const sigObj = {
        signature: {
          [tag]: rule
        },
        name: 'Axis',
        dateRange:{},
        schema: bankStatementSchema,
      };

      setSignature(sigObj);

      // setSignatureList((prev) => {
      //   return [...prev, sigObj]
      // });
    } else {
      // console.log(`handleRuleCreatorEvent: signature=${JSON.stringify(signature, null, 2)}`);
      setSignature((prevSignature) => {
        return {
          ...prevSignature,
          signature: {
            ...prevSignature.signature,
            [tag]: rule
          }
        }
      });
    }
  }

  useEffect(() => {
    // console.log(`useEffect[signature]: signature=`, signature);

    setSignatureList((prev) => {
      // return [...prev, sigObj]
      // Temporarily a single member list
      return [signature];
    });
  }, [signature]);
  
  const handleSelectionChange = (selRows) => {
    // console.log(`handleSelectionChange: selRows=`, selRows);
    setSelectedRows(selRows);
  }

  const handleCreateRule = useCallback((tag, selRows) => {
    // console.log(`handleCreateRule: tag=${tag} selRows=`, selRows.map(row => row.original));
    switch (tag) {
      case 'header':
        setRuleType(tag);
        setRuleTag(tag);
        setRuleSampleRows(selRows.map(row => row.original));
        break;

      case 'debit':
      case 'credit':
        setRuleType('data');
        setRuleTag(tag)
        setRuleSampleRows(selRows.map(row => row.original));
        break;

      default:
        console.log(`handleCreateRule: tag:${tag} is not supported`)
    }
  }, []);


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
            <Route index element={<ReadWrapper onDataChange={handleDataChange} formatList={formatList}/>} />

            {/* Transactions are categorized by user */}
            <Route
                path="transactions"
                element={
                  <>
                    <div style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "20px"
                    }}>
                      <div style={{
                        width: "100%",
                        display: "flex", flexDirection: "row", justifyContent:"space-between", gap:"20px"
                      }}>
                        <Button className="btn-outline-info" onClick={handleShowData}>
                          Show Data
                        </Button>
                        <Button className="btn-outline-info" onClick={handleClearData}>
                          Clear Data
                        </Button>
                      </div>
                    </div>

                    {
                      <>
                      <h4>Raw Table</h4>
                      <TableBulk
                          data={rows}
                          stylerRules={headerDetectionRules}
                          onRulesEvent={handleDetectionRulesEvent}
                          ref={rawTableRef}
                          onSelectionChange={handleSelectionChange}
                      />
                      <div style={{
                        width: "100%", margin: "20px 0 10px 0",
                        display: "flex", flexDirection: "row", justifyContent:"center", gap:"20px"
                      }}>
                        <div style={{
                          display: "flex", flexDirection: "row", justifyContent:"space-between", gap:"10px"
                        }}>
                          <Button
                              className="btn-outline-info"
                              onClick={() => handleCreateRule('header', selectedRows)}
                              disabled={!(headerRule === undefined && selectedRows.length > 0)}
                          >
                            Create Header
                          </Button>
                          <Button
                              className="btn-outline-info"
                              onClick={() => handleCreateRule('debit', selectedRows)}
                              disabled={!(headerRule !== undefined && selectedRows.length > 0)}
                          >
                            Create Debit
                          </Button>
                          <Button
                              className="btn-outline-info"
                              onClick={() => handleCreateRule('credit', selectedRows)}
                              disabled={!(headerRule !== undefined && selectedRows.length > 0)}
                          >
                            Create Credit
                          </Button>
                        </div>

                        <span>Highlighter Detected</span>
                        <Switch checked={highlighterDetected} onChange={handleToggleHighlighterDetected} />
                      </div>
                      <div style={{marginBottom:"50px"}}>
                      </div>
                      </>
                    }

                    {
                      (ruleSampleRows && ruleSampleRows.length > 0) &&
                      <RuleCreator
                          type={ruleType}
                          tag={ruleTag}
                          rows={ruleSampleRows}
                          headerRule={headerRule}
                          schema={bankStatementSchema}
                          onEvent={handleRuleCreatorEvent}
                          formatList={formatList}
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
