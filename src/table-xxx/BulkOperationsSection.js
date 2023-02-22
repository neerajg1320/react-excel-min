import {debug} from "../components/config/debug";
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import TableDataContext from "./TableDataContext";
import Button from "react-bootstrap/Button";
import ExpandableButton from "../components/expandableButton/ExpandableButton";
import ColumnsEditBox from "./parts/ColumnsEditBox";
import {DELETE, PATCH} from "./common/operationsTypes";

const BulkOperationsSection = ({edit}) => {
  if (debug.lifecycle) {
    console.log(`Rendering <BulkOperationsComponent>`);
  }

  const debugClicks = false;

  const {
    columns,
    selectedFlatRows,
    toggleAllRowsSelected,
    onChange:updateData
  } = useContext(TableDataContext);
  
  const bulkEnabled = selectedFlatRows && selectedFlatRows?.length > 0;
  const [bulkEditExpanded, setBulkEditExpanded] = useState(false);

  // For debugging purpose
  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<BulkOperationsTable>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<SimpleBulkOperationsTableTable>: Destroyed`);
      }
    }
  }, []);

  const getRowIndices = useCallback((selRows) => {
    return selRows.map(row => {
      return row.index;
    });
  }, []);

  const handleBulkDeleteClick = useCallback(() => {
    const indices = getRowIndices(selectedFlatRows);
    if (debugClicks) {
      console.log(`handleBulkDeleteClick: ids=${JSON.stringify(indices)}`);
    }

    updateData(DELETE, indices);
    setBulkEditExpanded(false);
  }, [selectedFlatRows]);

  const handleBulkEditSaveClick = useCallback((patch) => {
    const indices = getRowIndices(selectedFlatRows);

    if (debugClicks) {
      console.log(`handleBulkEditSaveClick: indices=${JSON.stringify(indices)} patch=${JSON.stringify(patch)}`);
    }

    updateData(PATCH, indices, patch);

    setBulkEditExpanded(false);
  }, [selectedFlatRows]);

  const handleBulkEditCancelClick = useCallback(() => {
    setBulkEditExpanded(false);
  }, []);

  const handleClearSelectionClick = useCallback(() => {
    if (toggleAllRowsSelected) {
      toggleAllRowsSelected(false);
    }
  }, [toggleAllRowsSelected]);

  // Support bulk select
  const bulkColumns = useMemo(() => {
    return columns?.length ? columns.filter(col => col.bulk) : [];
  }, [columns]);


  return (
    <div style={{display:"flex", gap: "10px", alignItems:"center"}}>
      {edit &&
        <>
          <Button variant="danger" size="sm"
                  disabled={!bulkEnabled}
                  onClick={e => handleBulkDeleteClick()}
          >
            Bulk Delete
          </Button>

        {/* We should try and replace below */}
          <ExpandableButton
              title="Bulk Edit"
              disabled={!bulkColumns.length || !bulkEnabled}
              expanded={bulkEditExpanded}
              onChange={exp => setBulkEditExpanded(exp)}
              popupPosition={{left: "60px", top: "25px"}}
          >
            <ColumnsEditBox
                columns={bulkColumns}
                onSave={handleBulkEditSaveClick}
                onCancel={handleBulkEditCancelClick}
                disabled={!bulkEnabled}
            />
          </ExpandableButton>
        </>
      }

      <Button variant="outline-dark" size="sm"
              disabled={!bulkEnabled}
              onClick={handleClearSelectionClick}
      >
        Clear
      </Button>
    </div>
  );
}

// export default EditSelectionTable;

// We use React.memo when we want to render the child only when any props change
export default React.memo(BulkOperationsSection);