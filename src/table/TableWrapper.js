import {useLocation} from "react-router-dom";
import {getColumns} from "../schema/generate";
import {colToRTCol} from "./adapters/reactTableAdapter";
import {presetColumns} from "../presets/presetColumns";
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import Button from "react-bootstrap/Button";
import {debug} from "../components/config/debugEnabled";
import BulkOperationsSection from "./BulkOperationsSection";
import TableDataContext from "./TableDataContext";
import TableCore from "./TableCore";
import {DELETE, PATCH} from "./common/operationsTypes";
import GlobalFilterSection from "./GlobalFilterSection";
import PaginationSection from "./PaginationSection";
import ColumnVisibilitySection from "./ColumnVisibilitySection";
import AppContext from "../AppContext";

// We derive columns from data
// We will just convert the columns.
// Any modification of columns should be handled above this.


export const TableWrapper = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <TableWrapper>`);
  }

  const {
    data:initialData,
    onDataChange: updateData,
    ledgers
  } = useContext(AppContext);

  const [data, setData] = useState(initialData);

  const {state} = useLocation();

  // TBD: We should put this in the context as well
  const headersMap = useMemo(() => state?.headersMap && JSON.parse(state?.headersMap), []);

  useEffect(() => {
    // console.log(`TableWrapper: initialData changed`);
    // console.log(appData);
    setData(initialData);
  }, [initialData]);

  // Data Features:
  // Update with commit
  const updateWithCommit = useMemo(() => false, []);
  const [updates, setUpdates] = useState([]);

  // // Table Section

  // Used for re-rendering the table
  const tableKeyRef = useRef(1);
  const tableInstanceRef = useRef({});

  // Here we put features which affect each other
  // Here is the list:
  // 1. Bulk, Selection
  //    When a bulk operation is completed we need to reset the selected rows
  // 2. Filter, Pagination
  //    When we filter data the page numnber needs to be reset to 0.
  // 3. ColumnFilters, GlobalFilters
  //    When we clear filters we clear filters on both.
  const {toggleAllRowsSelected} = tableInstanceRef.current;

  // Table features:
  const [featureSelection, setFeatureSelection] = useState(true);
  const [featureEdit, setFeatureEdit] = useState(true);
  const [featureBulk, setFeatureBulk] = useState(true);
  const [featureGlobalFilter, setFeatureGlobalFilter] = useState(true);
  const [featurePagination, setFeaturePagination] = useState(true);
  const [featureColumnFilter, setFeatureColumnFilter] = useState(true);
  const [featureSorting, setFeatureSorting] = useState(true);
  const [featureColumnVisibility, setFeatureColumnVisibility] = useState(false);

  const [layoutDebug, setLayoutDebug] = useState(true);
  const [layoutShowTypes, setLayoutShowTypes] = useState(false);
  const [layoutShowHeaderTypes, setLayoutShowHeaderTypes] = useState(false);

  // We can't change following to ref as we need to rerender BulkSection
  const [selectedRows, setSelectedRows] = useState([])
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const globalFilterValueRef = useRef(undefined);


  const [visibleColumns, setVisibleColumns] = useState([]);

  // Store table position so that we can restore
  const tableScrollPositionRef = useRef(0);

  // console.log(`globalFilter='${globalFilterValueRef.current}'`);

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<TableWrapper>: First render`);
    }

    // console.log(`headersMap:`, headersMap);

    return () => {
      if (debug.lifecycle) {
        console.log(`<TableWrapper>: Destroyed`);
      }
    }
  }, []);

  // col must have keyName property
  const attachPresetProperties = useCallback((col, index, choices) => {
    const mPresetCols = presetColumns.filter(pcol=> pcol.keyName === col.keyName);

    col.index = index;

    if (mPresetCols.length) {
      col = mPresetCols[0];
      col.choices = choices;
    }
    return colToRTCol(col, {showTypes:layoutShowTypes});
  }, []);


  // The columns are derived from data only once.
  // We will change this behaviour in the future if needed.
  const columns = useMemo(() => {
    return getColumns(data);
  }, []);

  const selectables = useMemo(() => {
    // This is compile time mapping.
    // For future: Can we do this run time?
    return [
      {
        'keyName': 'category',
        'choices': ledgers.map(ledger => ledger.name)
      }
    ];
  }, [ledgers]);

  const rtColumns = useMemo(() => {
    return columns.map((col, index) => {
      const selIndex = selectables.findIndex(sel => sel.keyName === col.keyName);
      let choices;
      if (selIndex >= 0) {
        choices = selectables[selIndex].choices;
      }

      return attachPresetProperties(col, index, choices);
    });
  }, [columns, selectables]);

  const defaultColumnFilterState = {
    flagBlank: false,
    flagText: true,
    filterText:"",
    textFlags:{}
  };

  const colFiltersInitState = useMemo(() => {
    return rtColumns.map(col => {
      // console.log(col);
      return {
        id: col.id,
        value: defaultColumnFilterState
      };
    });
  }, [rtColumns]);

  const columnFiltersValueRef = useRef(colFiltersInitState);

  // Keep this function as this is used for causing a render
  // Check the behaviour before and after in case this has to be deleted
  const handleSelectionUpdate = useCallback((seletedFlatRows) => {
    // console.log(`handleSelectionUpdate: `, seletedFlatRows);
    setSelectedRows(seletedFlatRows);
  }, []);

  const handleRTableChange = useCallback((rt) => {
    // console.log(`handleRTableChange: `, rt);
    tableInstanceRef.current = rt;
  }, []);

  // convert before using this to ids and patch
  const applyUpdate = useCallback((prevData, {action, payload:{indices, patch}}) => {
    // console.log(`applyUpdate: action=${action}`);

    switch (action) {
      case PATCH:
        // Here we should mark pending
        const updatedData = prevData.map((item, item_idx) => {
          if (indices.includes(item_idx)) {
            return {...item, ...patch, modifyMarker:true};
          }
          return {...item};
        })

        // console.log(`updatedData=${JSON.stringify(updatedData, null, 2)}`);
        return updatedData;

      case DELETE:
        // return prevData.filter((item, index) => !indices.includes(index))
        // Here we should mark for delete
        return prevData.map((item, item_idx) => {
          if (indices.includes(item_idx)) {
            return {...item, deleteMarker:true};
          }
          return {...item};
        });

      default:
        return prevData;
    }
  }, []);

  const commitUpdates = useCallback((updates) => {
    // Since data is updated on the previous state
    setData((prevData) => {
      const newData = updates.reduce((pData, update, index) => {
        return applyUpdate(pData, update);
      }, prevData);

      if (updateData) {
        setTimeout(() => {
          updateData(newData, updates, 'dataSourceTable');
        })
      }
      return newData;
    });

  }, [applyUpdate]);

  const handleCommitClick = useCallback((updates) => {
    // console.log(`updates count: ${updates.length}`);
    if (updates.length < 1) {
      return
    }

    commitUpdates(updates);

    setUpdates([]);

    // Reset the selection of rows
    if (toggleAllRowsSelected) {
      toggleAllRowsSelected(false);
    }
  }, [commitUpdates, toggleAllRowsSelected]);

  const handleDataChange = useCallback((action, indices, patch) => {
    // console.log('handleDataChange:', action, indices, patch);

    const update = {action, payload:{indices, patch}};

    if (updateWithCommit) {
      setUpdates((prevUpdates) => {
        return [...prevUpdates].concat(update);
      });
    } else {
      commitUpdates([update]);

      // Reset the selection of rows
      if (toggleAllRowsSelected) {
        toggleAllRowsSelected(false);
      }
    }
  }, [commitUpdates, toggleAllRowsSelected]);


  const handleResetClick = useCallback((updates) => {
    // setTableKey((prevTableKey) => prevTableKey + 1);
    tableKeyRef.current += 1;

    setUpdates([]);
  }, []);

  // TBD: we get these so that we can update the sibling component
  // See if we can avoid the whole re-render
  const handlePageChange = useCallback((pageIndex) => {
    // console.log(`handlePageChange: ${pageIndex}`);
    setPageIndex(pageIndex);
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    // console.log(`handlePageChange: ${pageIndex}`);
    setPageSize(pageSize);
  }, []);

  const providePageIndex = () => {
    // console.log(`providePageIndex: pageIndex=${pageIndex}`)
    return pageIndex;
  }

  // We need to fix the pageIndex when filtering starts
  const handleGlobalFilterChange = useCallback((value) => {
    // console.log(`handleGlobalFilterChange: value=${value}`);

    if (featurePagination) {
      if (!globalFilterValueRef.current && value) {
        // console.log(`handleGlobalFilterChange: Filter active pulse`);
      }

      if (globalFilterValueRef.current && !value) {
        // console.log(`handleGlobalFilterChange: Filter inactive pulse`);
      }
    }

    globalFilterValueRef.current = value;
  }, [globalFilterValueRef])

  const provideGlobalFilter = () => {
    return globalFilterValueRef.current;
  }

  const handleColumnsFiltersChange = (value) => {
    console.log(`TableWrapper:handleColumnsFiltersChange value:`, value);
    columnFiltersValueRef.current = value;
  }

  // This is called from the ColumnFilterWithIcon component
  const handleColumnFilterChange = (columnId, newValue) => {
    // console.log(`TableWrapper:handleColumnFilterChange column=${columnId} newValue=`, newValue);
    const columnFilters = columnFiltersValueRef.current;

    if (newValue === undefined) {
      newValue = defaultColumnFilterState;
    }

    if (featurePagination) {
      const oldValue = columnFilters.filter(col => col.id === columnId)[0]?.value;

      if (oldValue?.filterText === "" && newValue?.filterText !== "") {
        console.log(`handleColumnFilterChange: Filter active pulse`);
      }

      if (oldValue?.filterText !== "" && newValue?.filterText === "") {
        console.log(`handleColumnFilterChange: Filter inactive pulse`);
      }
    }

    columnFiltersValueRef.current = columnFilters.map(col => {
      if (col.id === columnId) {
        return {...col, value:newValue};
      }
      return col;
    });
  }

  const provideColumnsFilters = () => {
    return columnFiltersValueRef.current;
  }

  // TBV: Check if this can be in TableWrapper
  const handleFilterClearClick = () => {
    // console.log(`Need to clear filters`);
    const {setGlobalFilter, setAllFilters} = tableInstanceRef.current;
    setAllFilters([]);
    setGlobalFilter("");
  }

  const handleTableCoreScroll = (e) => {
    // console.log("scrolling!", e.target.scrollLeft)
    // setTablePosition(e.target.scrollLeft);
    tableScrollPositionRef.current = e.target.scrollLeft;
  }

  const handleVisibleColumnsChange = (visibleColumns) => {
    // console.log(`handleVisibleColumnsChange: called`);
    setVisibleColumns(visibleColumns);
  }


  const tableContext = {
    data,
    columns: rtColumns,
    headersMap, // header(column in excel file) info
    onChange: handleDataChange,

    featureSelection,
    featureGlobalFilter,
    featureBulk,
    featureEdit,
    featurePagination,
    featureColumnFilter,
    featureSorting,
    featureColumnVisibility,

    layoutFooter: false,
    layoutFixed: true,
    layoutResize: true, // dependent of layoutFixed
    layoutHeaderTooltip: true,
    layoutShowHeaderTypes,
    layoutDebug,

    tableInstance: tableInstanceRef.current,
    allColumns: tableInstanceRef.current.allColumns,
    getToggleHideAllColumnsProps: tableInstanceRef.current.getToggleHideAllColumnsProps,
    selectedFlatRows: tableInstanceRef.current.selectedFlatRows,
    toggleAllRowsSelected:tableInstanceRef.current.toggleAllRowsSelected,

    nextPage: tableInstanceRef.current.nextPage,
    previousPage: tableInstanceRef.current.previousPage,
    canNextPage: tableInstanceRef.current.canNextPage,
    canPreviousPage: tableInstanceRef.current.canPreviousPage,
    pageOptions: tableInstanceRef.current.pageOptions,
    gotoPage: tableInstanceRef.current.gotoPage,
    pageCount: tableInstanceRef.current.pageCount,
    setPageSize: tableInstanceRef.current.setPageSize,

    // state changes because of any of pagination, globalFilter, columnFilter will render all
    state: tableInstanceRef.current.state,

    setGlobalFilter: tableInstanceRef.current.setGlobalFilter,
    
    onSelectionChange: handleSelectionUpdate,
    onRTableChange: handleRTableChange,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    getPageIndex: providePageIndex,

    onGlobalFilterChange: handleGlobalFilterChange,
    getGlobalFilter: provideGlobalFilter,
    onColumnsFiltersChange: handleColumnsFiltersChange,
    onColumnFilterChange: handleColumnFilterChange,
    getColumnsFilters: provideColumnsFilters,

    onVisibleColumnsChange: handleVisibleColumnsChange,
  };

  return (
      <div style={{
        width: "95%",
        padding: "40px 20px",
        display:"flex", flexDirection:"row", alignItems: "flex-start",
        boxShadow: "0 0 3px 0 rgba(0, 0, 0, 0.5)"
      }}>
        <TableDataContext.Provider value={tableContext}>
          {!data &&
            <div style={{
              display:"flex", flexDirection:"row", justifyContent:"center", alignItems: "center"
            }}>
              <h1>Please upload an excel file</h1>
            </div>
          }
          {data &&
            <div style={{
              width: "100%",
              display:"flex", flexDirection:"column", gap:"20px", justifyContent:"space-evenly", alignItems:"center",
            }}>

              <div style={{
                display:"flex", flexDirection:"row", justifyContent:'space-between', gap:"40px",
                width: "100%", padding: "0 40px",
              }}>
                {featureBulk &&
                  <div>
                    <BulkOperationsSection edit={featureEdit}/>
                  </div>
                }

                {featureColumnVisibility && <ColumnVisibilitySection />}

                {layoutDebug &&
                    <div style={{display: "flex", flexDirection: "row", gap: "10px"}}>
                      <Button className="btn-outline-info bg-transparent" size="sm"
                              onClick={e => {
                                rtColumns.forEach(col => console.log(JSON.stringify(col)))
                              }}
                      >
                        Log Columns
                      </Button>
                      <Button className="btn-outline-info bg-transparent" size="sm"
                              onClick={e => {
                                console.log(JSON.stringify(data, null, 2))
                              }}
                      >
                        Log Data
                      </Button>
                    </div>
                }

                <div style={{
                    display: "flex", flexDirection:"row", gap: "20px"
                  }}>
                  {(featureGlobalFilter || featureColumnFilter) &&
                    <Button className="btn-outline-dark bg-transparent"
                            size="sm"
                            onClick={handleFilterClearClick}
                    >
                      Clear Filters
                    </Button>
                  }
                  {featureGlobalFilter && <GlobalFilterSection />}
                </div>
              </div>

              <div style={{
                  height: "60vh",
                  width:"100%",
                  padding: "10px 10px 20px 10px",
                  overflow: "scroll",
                  background: "darkgray",
                }}
                onScroll={handleTableCoreScroll}
              >
                  <TableCore key={tableKeyRef.current} />
              </div>

              {featurePagination && <PaginationSection />}

              {updateWithCommit &&
              <div style={{
                display: "flex", flexDirection: "row", gap: "20px"
              }}>
                <Button
                    className="btn-outline-primary bg-transparent"
                    disabled={updates.length < 1}
                    onClick={e => handleResetClick(updates)}
                >
                  Reset
                </Button>
                <Button
                    disabled={updates.length < 1}
                    onClick={e => handleCommitClick(updates)}
                >
                  Commit
                </Button>
              </div>
              }
            </div>
          }
        </TableDataContext.Provider>
      </div>
  );

};
