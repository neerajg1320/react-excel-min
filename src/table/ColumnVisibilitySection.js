import React, {useContext, useEffect, useState} from "react";
import {debug} from "../components/config/debug";
import ExpandableButton from "../components/expandableButton/ExpandableButton";
import {RowCheckbox} from "./parts/RowCheckbox";
import TableDataContext from "./TableDataContext";

const ColumnVisibilitySection = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <ColumnVisibilitySection>`);
  }

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<ColumnVisibilitySection>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<ColumnVisibilitySection>: Destroyed`);
      }
    }
  }, []);

  const [showColumnsExpanded, setShowColumnsExpanded] = useState(false);

  const {
    allColumns,
    getToggleHideAllColumnsProps
  } = useContext(TableDataContext);

  return (
    <>
      {allColumns &&
      <div style={{marginLeft: "20px"}}>
        <ExpandableButton
            title="Show Columns"
            expanded={showColumnsExpanded}
            onChange={setShowColumnsExpanded}
            popupPosition={{top:"100%", left:"0px"}}
        >
          <div style={{
            width: "180px",
            padding: "10px",
            border: "1px dashed gray",
            borderRadius: "5px"
          }}
          >
            <div>
              <RowCheckbox {...getToggleHideAllColumnsProps()}/> Toggle All
            </div>
            {
              // Individual checkbox for hide/show column
              allColumns.map(column => (
                  <div key={column.id}>
                    <div style={{display:"flex", flexDirection:"row", gap:"10px", alignItems: "center"}}>
                      <input type="checkbox" {...column.getToggleHiddenProps()} />
                      <span>{column.render('Header')}</span>
                    </div>
                  </div>
              ))
            }
          </div>
        </ExpandableButton>
      </div>
      }
    </>
  );
}

export default React.memo(ColumnVisibilitySection);