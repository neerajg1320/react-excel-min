import React, {useContext, useEffect, useMemo, useRef} from "react";
import TableDataContext from "./TableDataContext";
import {GlobalFilter} from "./filter/GlobalFilter";
import {debug} from "../components/config/debug";

const GlobalFilterSection = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <GlobalFilterSection>`);
  }

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<GlobalFilterSection>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<GlobalFilterSection>: Destroyed`);
      }
    }
  }, []);

  const {
    state,
    setGlobalFilter,
    onGlobalFilterChange: updateGlobalFilter
  } = useContext(TableDataContext);

  const globalFilter = state?.globalFilter;

  // This is important. The updated value is stored in the TableWrapper.
  // It is provided to TableCore upon re-render.
  useEffect(() => {
    // console.log(`Global Filter: ${globalFilter}`)
    updateGlobalFilter(globalFilter);
  }, [globalFilter]);

  // We need to reset the pageIndex to 0 when we start typing in the filter
  return (
      <>
        <GlobalFilter {...{globalFilter, setGlobalFilter}}/>
      </>
  )

}

export default React.memo(GlobalFilterSection);
