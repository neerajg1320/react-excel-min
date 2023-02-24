import * as React from 'react';
import {Routes, Route, redirect} from 'react-router-dom';
import {ReadWrapper} from "./fileReader/ReadWrapper";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {debug} from "./components/config/debug";
import {HomeLayout} from "./components/HomeLayout";
import {TallyWrapper} from "./tally/TallyWrapper";
import {Categories} from "./category/Categories";
import {TableBulk} from "@glassball/table";

import AppContext from "./AppContext";

// The groups are kept here so that the state can be preserved across Category component render
const defaultGroups = [
  {
    name: "Direct Incomes"
  },
  {
    name: "Indirect Incomes"
  },
  {
    name: "Direct Expenses"
  },
  {
    name: "Indirect Expenses"
  },
];

const defaultCategories = [
  {
    name: "Travel",
    group: "Indirect Expenses"
  },
  {
    name: "Salary",
    group: "Indirect Expenses"
  },
  {
    name: "Stationary",
    group: "Indirect Expenses"
  },
  {
    name: "Food",
    group: "Indirect Expenses"
  },
  {
    name: "Transport",
    group: "Indirect Expenses"
  },
  {
    name: "Cotton",
    group: "Direct Expenses"
  }
];


const App = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <App>`);
  }

  const debugData = false;
  const debugLedgers = false;
  const debugCategories = true;

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

  // The App keeps a copy of data
  const [data, setData] = useState([]);

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

  // The following two could be turned to refs
  const modifiedRowsRef = useRef([]);
  const deletedRowsRef = useRef([]);
  const tallySavedRef = useRef(false);
  const tableRef = useRef();

  const clearMarkedRows = useCallback(() => {
    console.log(`App: clearMarkedRows()`);
    modifiedRowsRef.current = [];
    deletedRowsRef.current = [];
  }, []);

  // The App component just maintains a copy of data.
  // The modification are done in table and tally components.
  const handleDataChange = useCallback((data, updates, source) => {
    console.log(`handleDataChange: source=${source} tallySaved=${tallySavedRef.current} data=${JSON.stringify(data, null, 2)}`);

    let newData = data;

    // TBD: We can do the below asynchronously
    // In case it is a data modify or delete action

    if (source === "dataSourceFileReader") {
      const indices = data.map((item,index) => index);
      if (indices.length > 0) {
        // setModifiedRows(indices);
        tallySavedRef.current = false;
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
        tableRef.current.clearMarkedRows();
        tallySavedRef.current = true;
      }

    } else {
      console.error(`handleDataChange: source '${source}' not supported`);
    }

    setData(newData);
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

      if (debugLedgers) {
        console.log(`handleLedgersChange: newSelectables=${JSON.stringify(newSelectables, null, 2)}`)
      }

      return newSelectables;
    })
  };

  const handleLedgersChange = useCallback((newLedgers) => {
    if (debugLedgers) {
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

  // Currently we are not using the AppContext
  const appContext = {
    data,
    onDataChange: handleDataChange,
    ledgers:ledgersRef.current,
    onLedgersChange: handleLedgersChange,
    tallySaved:tallySavedRef.current,
    modifiedRows: modifiedRowsRef.current,
    deletedRows: deletedRowsRef.current,
    // categories,
    // onCategoriesChange: handleCategoriesChange,
    // groups,
  }

  return (
    <AppContext.Provider value={appContext}>
      {/* We add voucherIds generated by tally */}
      <TallyWrapper >
        <Routes>
          <Route element={<HomeLayout />}>

            {/* Data read from excel file */}
            <Route index element={<ReadWrapper />} />

            {/* Transactions are categorized by user */}
            <Route
                path="transactions"
                element={
                  <TableBulk
                      data={data}
                      onDataChange={handleDataChange}
                      updateWithCommit={false}
                      selectables={transactionSelectables}
                      ref={tableRef}
                  />
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
    </AppContext.Provider>
  );
};

export default App;
