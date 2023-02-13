import './table.css';
import './table-column-resizer.css';
import {
  useTable,
  useRowSelect,
  useGlobalFilter,
  usePagination,
  useFilters,
  useSortBy,
  useBlockLayout,
  useResizeColumns
} from "react-table";
import {RowCheckbox} from "./parts/RowCheckbox";
import EditableCell from "./parts/editableControlledCell";
import SelectableCell from "./parts/selectableCell";
import React, {useCallback, useContext, useEffect, useMemo, useRef} from "react";
import {debug} from "../components/config/debug";
import TableDataContext from "./TableDataContext";
import {ColumnFilterWithIcon} from "./filter/ColumnFilterWithIcon";
import {filterUsingRegex} from "./filter/customFilter";
import TooltipComponent from "../components/tooltip/TooltipComponent";

// Supports:
//  - Rows Selection
//  - Edit cells using input and select


const TableCore = () => {
  const {
    data,
    columns,
    headersMap,
    onChange:updateData,

    featureSelection,
    featureGlobalFilter,
    featureEdit,
    featurePagination,
    featureColumnFilter,
    featureSorting,

    layoutFooter,
    layoutFixed,
    layoutResize,
    layoutHeaderTooltip,
    layoutShowHeaderTypes,

    onSelectionChange: updateSelection,
    onRTableChange: updateRTable,
    onPageChange: updatePageIndex,
    onPageSizeChange: updatePageSize,
    getPageIndex: getCurrentPageIndex,

    getGlobalFilter,
    getColumnsFilters,

    onVisibleColumnsChange: updateVisibleColumns,
  } = useContext(TableDataContext);

  if (debug.lifecycle) {
    console.log(`Rendering <TableCore>`);
  }
  // console.log(`<TableCore>: data.length=${data.length} columns.length=${columns.length}`);
  // console.log(JSON.stringify(columns, null, 2));

  // For debugging purpose
  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<TableCore>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<TableCore>: Destroyed`);
      }
    }
  }, []);

  const usePrepareColumn = useCallback((hooks) => {
    // Support row select
    const selectionColumn = {
      id: "selection",
      Header: ({getToggleAllRowsSelectedProps}) => (
          <div>
            <RowCheckbox {...getToggleAllRowsSelectedProps()} />
          </div>

      ),
      Cell: ({ row }) => (
          <div style={{
            height: "100%",
            display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"
          }}>
            <RowCheckbox {...row.getToggleRowSelectedProps()} />
          </div>
      ),
      enableAddons: false,
      enableSorting: false,
      width: 50
    };

    hooks.visibleColumns.push((paramColumns) => {
      const headColumns = featureSelection ? [selectionColumn] : [];

      if (featureEdit) {
        return headColumns.concat([
          ...paramColumns.map(col => {
            if (col.edit) {
              if (col.type === 'input') {
                // The following is equivalent to col.Cell = EditableCell
                // We have kept it for uniformity
                col.Cell = (props) => {
                  return <EditableCell {...props} />
                };

              } else if (col.type === 'select') {
                col.Cell = (props) => {
                  const {rows, page, row} = props;
                  // Add a check for featurePagination
                  let view = rows;
                  if (page) {
                    view = page;
                  }

                  // To take care of the cases where last has lesser number of rows.
                  const topThreshold = 5;

                  const positionInView = view.findIndex(item => item.index === row.index);
                  const placement = (positionInView > topThreshold) ? "top" : "bottom"
                  return <SelectableCell choices={col.choices} {...props} {...{placement}} />
                }
              } else {
                // If not type is specified then input by default
                col.Cell = EditableCell
              }
            }
            return col;
          }),
        ])
      } else {
        return headColumns.concat([...paramColumns]);
      }
    })
  }, [featureSelection, featureEdit]);


  const pluginHooks = useMemo(() => {
    const hooks = [];
    if (featureGlobalFilter) {
      hooks.push(useGlobalFilter);
    }
    if (featureColumnFilter) {
      hooks.push(useFilters);
    }
    if (featureSorting) {
      hooks.push(useSortBy);
    }
    if (featurePagination) {
      hooks.push(usePagination);
    }
    if (featureSelection) {
      hooks.push(useRowSelect);
    }
    if (layoutFixed) {
      hooks.push(useBlockLayout);
    }
    if (layoutResize) {
      hooks.push(useResizeColumns);
    }

    hooks.push(usePrepareColumn);

    return hooks;
  }, [featureSelection, featureGlobalFilter, featureEdit, featurePagination])

  const currentPageIndex = useMemo(() => {
    return getCurrentPageIndex();
  }, [getCurrentPageIndex]);

  // console.log(`<TableCore>: currentPageIndex:${currentPageIndex}`);

  const defaultColumnAttrs = useMemo(() => {
    let attrs = {};

    if (featureColumnFilter) {
      attrs = {
        Filter: ColumnFilterWithIcon,
        filter: filterUsingRegex,
      }
    }

    if (layoutFixed || layoutResize) {
      attrs = {
        ...attrs,
        ...{
          // maxWidth: 300,
          // minWidth: 100,
          // width: 125,
        }
      }
    }

    // console.log(`defaultColumnAttrs=`, attrs);
    return attrs;
  }, [featureSelection]);

  const hiddenColumns = useMemo(() => {
      return columns.map(col => {
        if (col.hidden === true) {
          // console.log(`empty column = ${JSON.stringify(col, null, 2)}`);
          // console.log(`returning ${ col.id}`);

          return col.id;
        }
      });
  }, [columns]);

  const globalFilter = useMemo(() => {
    return getGlobalFilter();
  }, [getGlobalFilter]);

  const columnsFilters = useMemo(() => {
    return getColumnsFilters();
  }, [getColumnsFilters]);

  const initialState = useMemo(() => {
    let initState = {}

    // The hidden columns
    initState = {
      ...initState,
      hiddenColumns
    };

    if (featurePagination) {
      initState = {
        ...initState,
        pageIndex: currentPageIndex,
      }
    }

    if (featureGlobalFilter) {
      initState = {
        ...initState,
        globalFilter
      }
    }

    if (featureColumnFilter) {
      // console.log(`TableCore:columnsFilters`, columnsFilters);
      initState = {
        ...initState,
        filters:columnsFilters
      }
    }

    return initState;
  }, [currentPageIndex, hiddenColumns, globalFilter, columnsFilters]);

  const tableInstance = useTable({
        columns,
        data,
        updateData,
        autoResetSelectedRows: false,
        initialState,
        defaultColumn: defaultColumnAttrs,
      },
      // useRowSelect is causing two renders
      // https://github.com/TanStack/table/issues/1496
      // As per above don't worry about rerenders as they are performant in react-table
      // To disable just comment out useRowSelect and Selection column
      ...pluginHooks,
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    footerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    page,
    gotoPage,
    state,
    visibleColumns
  } = tableInstance;

  const rowsPrevRef = useRef([]);
  const visibleRows = useMemo(() => {
    return featurePagination ? page : rows
  }, [page, rows]);


  useEffect(() => {
    if (rows.length != rowsPrevRef.current.length) {
      // console.log(`TableCore:rows prevRowCount:${rowsPrevRef.current.length} count=${rows.length}`)
      if (featurePagination) {
        if (currentPageIndex > 0) {
          // console.log(`TableCore: Page index reset to 0`);
          setTimeout(() => {
            gotoPage(0);
          }, 0);
        }
      }
    }
    rowsPrevRef.current = rows;
  }, [rows, currentPageIndex, gotoPage]);
  // console.log(`tableInstance=`, tableInstance);

  useEffect(() => {
    // console.log(`visibleColumns=`, visibleColumns);
    updateVisibleColumns(visibleColumns);
  }, [visibleColumns]);

  const { pageIndex, pageSize } = state;
  useEffect(() => {
    updatePageIndex(pageIndex);
    updatePageSize(pageSize);
  }, [pageIndex, pageSize]);

  // Note: Causes a rerender
  // Required for rerendering the BulkSelection component
  useEffect(() => {
    updateSelection(selectedFlatRows);
  }, [selectedFlatRows]);

  useEffect(() => {
    // console.log(`Updated tableInstance`);
    updateRTable(tableInstance);
  }, [tableInstance]);

  return (
  <>
  <table {...getTableProps()}>
    <thead>
    {headerGroups.map(headerGroup => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {
            headerGroup.headers.map((hdrColumn) => (
              //  If we want header to be clickable then modify getHeaderProps call as 
              //  getHeaderProps(featureSorting ? hdrColumn.getSortByToggleProps() : {})
              <th {...hdrColumn.getHeaderProps()}>
                <div style={{
                  display:"flex", flexDirection:"column"
                }}>
                  <div style={{
                      display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center", gap:"10px"
                    }}
                  >
                    <div style={{
                      width:"100%",
                      // border: "1px dashed white"
                    }}>
                      <TooltipComponent message={hdrColumn.render('Header')}
                                        disabled={!layoutHeaderTooltip || (hdrColumn.enableAddons === false) }
                      >
                        <span style={{whiteSpace:"nowrap"}}>
                          {hdrColumn.render('Header')}
                        </span>
                      </TooltipComponent>
                    </div>
                    {hdrColumn.enableAddons !== false &&
                      <div style={{display: "flex", flexDirection: "row", gap: "5px", alignItems: "center"}}>
                        {(featureSorting && (hdrColumn.enableSorting !== false)) &&
                            <span {...hdrColumn.getSortByToggleProps()}>{hdrColumn.isSorted ? (hdrColumn.isSortedDesc ? ' >' : ' <') : '<>'}</span>}
                        {featureColumnFilter && <span>{hdrColumn.canFilter ? hdrColumn.render('Filter') : null}</span>}
                        {layoutResize &&
                            <div
                                {...hdrColumn.getResizerProps()}
                                className={`resizer ${hdrColumn.isResizing ? "isResizing" : ""}`}
                            />
                        }
                      </div>
                    }
                  </div>
                  {layoutShowHeaderTypes &&
                    <div style={{fontSize:"0.7em", "fontWeight": "normal"}}>
                      {(JSON.stringify(headersMap[hdrColumn.header]?.detectedTypes)?.replaceAll('"', ''))}
                    </div>
                  }
                </div>
              </th>
            ))
          }
        </tr>
    ))}
    </thead>
    <tbody {...getTableBodyProps()}>
    {
      visibleRows.map((row) => {
        prepareRow(row);
        return (
            <tr {...row.getRowProps()}>
              {
                row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  );
                })
              }
            </tr>
        );
      })
    }
    </tbody>
    <tfoot>
    {layoutFooter &&
      footerGroups.map(footerGroup => (
          <tr {...footerGroup.getFooterGroupProps()}>
            {
              footerGroup.headers.map(column => (
                  <td {...column.getFooterProps()}>
                    {column.render('Footer')}
                  </td>
              ))
            }
          </tr>
      ))
    }
    </tfoot>
  </table>
  </>
  );
}

// export default TableCore;

// We use React.memo when we want to render the child only when any props change
export default React.memo(TableCore);