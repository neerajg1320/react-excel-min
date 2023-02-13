import React, {useContext, useEffect} from "react";
import {debug} from "../components/config/debug";
import TableDataContext from "./TableDataContext";

const PaginationSection = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <PaginationSection>`);
  }

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<PaginationSection>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<PaginationSection>: Destroyed`);
      }
    }
  }, []);

  const {
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    state,
  } = useContext(TableDataContext);

  const {
    pageIndex,
    pageSize
  } = state || {};

  return (
    <div>
      <span>
        Page{' '}
        <strong>
          {pageIndex + 1} of {pageOptions?.length}
        </strong>{' '}
      </span>
      <span>
        | Go to page: {' '}
        <input type="number"
               value={(pageIndex || 0) + 1}
               onChange={e => {
                 const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
                 gotoPage(pageNumber)
               }}
               style={{width: 50}}
        />
      </span>
      <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
        {
          [10, 25, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>Show {pageSize}</option>
          ))
        }
      </select>
      <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
        {'<<'}
      </button>
      <button onClick={() => previousPage()} disabled={!canPreviousPage}>
        Previous
      </button>
      <button onClick={() => nextPage()} disabled={!canNextPage}>
        Next
      </button>
      <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
        {'>>'}
      </button>
    </div>
  );
};

export default PaginationSection;

