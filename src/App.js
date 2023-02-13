import * as React from 'react';
import {Routes, Route, redirect} from 'react-router-dom';
import {TableWrapper} from "./table/TableWrapper";
import {ReadWrapper} from "./fileReader/ReadWrapper";
import {useCallback, useEffect, useRef, useState} from "react";
import {debug} from "./components/config/debug";
import {HomeLayout} from "./components/HomeLayout";
import {TallyWrapper} from "./tally/TallyWrapper";
import AppContext from "./AppContext";

const App = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <App>`);
  }

  const debugData = false;
  const debugLedgers = false;

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
  const [ledgers, setLedgers] = useState([]);
  // The following two could be turned to refs
  const [modifiedRows, setModifiedRows] = useState([]);
  const [deletedRows, setDeletedRows] = useState([]);
  const tallySavedRef = useRef(false);


  const updateModifiedRows = useCallback((indices) => {
    setModifiedRows((prev) => {
      const newIds = indices.filter(index => !prev.includes(index));
      return [...prev, ...newIds];
    });
  }, [setModifiedRows]);

  const updateDeletedRows = useCallback((indices) => {
    setDeletedRows((prev) => {
      const newIds = indices.filter(index => !prev.includes(index));
      return [...prev, ...newIds];
    });

    // Remove the deleted indices from the modifiedRows
    setModifiedRows((prev) => {
      return prev.filter(index => !indices.includes(index))
    });
  }, [setDeletedRows, setModifiedRows]);

  const clearMarkedRows = useCallback(() => {
    setModifiedRows([]);
    setDeletedRows([]);
  }, [setModifiedRows, setDeletedRows]);

  useEffect(() => {
    if (debugData) {
      console.log(`modifiedRows:`, modifiedRows);
      console.log(`deletedRows:`, deletedRows);
    }
  }, [modifiedRows, deletedRows]);

  // The App component just maintains a copy of data.
  // The modification are done in table and tally components.
  const handleDataChange = useCallback((data, updates, source) => {
    // console.log(`handleDataChange: source=${source} tallySaved=${tallySavedRef.current} data=`, data);

    let newData = data;

    // TBD: We can do the below asynchronously
    // In case it is a data modify or delete action

    if (source === "dataSourceFileReader") {
      const indices = data.map((item,index) => index);
      if (indices.length > 0) {
        setModifiedRows(indices);
        tallySavedRef.current = false;
      }
    } else if (source === "dataSourceTable") {
      if (updates) {
        // console.log(`App:handleDataChange`, updates, data);
        const modificationUpdates = updates.filter(update => update.action === 'PATCH');
        const modifiedIndices = modificationUpdates.reduce((prev, update) => {
          const newIds = update.payload.indices.filter(index => !prev.includes(index));
          return [...prev, ...newIds];
        }, [])
        if (modifiedIndices.length > 0) {
          updateModifiedRows(modifiedIndices);
        }

        const deletionUpdates = updates.filter(update => update.action === 'DELETE');
        const deletedIndices = deletionUpdates.reduce((prev, update) => {
          const newIds = update.payload.indices.filter(index => !prev.includes(index));
          return [...prev, ...newIds];
        }, [])
        if (deletedIndices.length > 0) {
          // TBD: This is the place where we need to check if data is in sync with server
          if (tallySavedRef.current) {
            updateDeletedRows(deletedIndices);
          } else {
            newData = data.filter((item, index) => !deletedIndices.includes(index));
          }
        }
      }
    } else if (source === "dataSourceTally") {
      // We can count the Tally Operations here. This will happen only if data is submitted to Tally
      // We should get the indices here and clear the modifiedRows
      // console.log(`handleDataChange: source:${source} updates=`, updates);

      const responseIds = updates[0].payload;

      // We need to be very careful here
      // We need to check if all responses are accounted
      if (responseIds.length > 0) {
        clearMarkedRows();
        tallySavedRef.current = true;
      }

    } else {
      console.error(`handleDataChange: source '${source}' not supported`);
    }

    setData(newData);
  }, []);

  const handleLedgersChange = useCallback((ledgers) => {
    if (debugLedgers) {
      console.log(`App: handleLedgersChange:`, ledgers);
    }
    setLedgers(ledgers);
  }, []);

  // Currently we are not using the AppContext
  const appContext = {
    data,
    onDataChange: handleDataChange,
    ledgers,
    onLedgersChange: handleLedgersChange,
    tallySaved:tallySavedRef.current,
    modifiedRows,
    deletedRows
  }

  return (
    <AppContext.Provider value={appContext}>
      {/* We add voucherIds generated by tally */}
      <TallyWrapper data={data} onDataChange={handleDataChange} onLedgersChange={handleLedgersChange}>
        <Routes>
          <Route element={<HomeLayout />}>

            {/* Data read from excel file */}
            <Route index element={<ReadWrapper />} />

            {/* Category information added by user */}
            <Route path="table" element={<TableWrapper />} />

            <Route path="*" element={<p>There's nothing here: 404!</p>} />
          </Route>
        </Routes>
      </TallyWrapper>
    </AppContext.Provider>
  );
};

export default App;
