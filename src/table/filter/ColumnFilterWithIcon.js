import {BiSearchAlt} from "react-icons/bi";
import {FaSearchPlus} from "react-icons/fa";
import {AiOutlineClose} from "react-icons/ai";
import {TiTick} from "react-icons/ti";
import ExpandableButton from "../../components/expandableButton/ExpandableButton";
import {useCallback, useContext, useEffect, useState} from "react";
import InputWithIcons from "../../components/inputFlags/InputWithIcons";
import {debug} from "../../components/config/debug";
import TableDataContext from "../TableDataContext";

export const ColumnFilterWithIcon = ({ column: renderedColumn }) => {
  if (debug.lifecycle && renderedColumn.id === "description") {
    console.log(`Rendering <ColumnFilterWithIcon>`);
  }

  useEffect(() => {
    if (debug.lifecycle && renderedColumn.id === "description") {
      console.log(`<ColumnFilterWithIcon>: First render`);
    }

    return () => {
      if (debug.lifecycle && renderedColumn.id === "description") {
        console.log(`<ColumnFilterWithIcon>: Destroyed`);
      }
    }
  }, []);


  const { filterValue, setFilter } = renderedColumn;
  const [expanded, setExpanded] = useState(false);

  const [blankEnabled, setBlankEnabled] = useState(filterValue?.flagBlank);
  const [textEnabled, setTextEnabled] = useState(filterValue?.flagText);
  const [filterText, setFilterText] = useState(filterValue?.filterText);
  const [textFlags, setTextFlags] = useState(filterValue?.filterText);

  // This should be taken out if we can find a way to know which column filter changed
  const {
    onColumnFilterChange: updateColumnFilter
  } = useContext(TableDataContext);

  // useEffect(() => {
  //   // console.log(renderedColumn);
  //   if (renderedColumn.id === "description") {
  //     console.log(`ColumnFilterWithIcon: filterValue=${JSON.stringify(filterValue)}`);
  //   }
  //   // updateColumnFilter(renderedColumn.id, filterValue);
  // }, [filterValue]);

  useEffect(() => {
    // Check if we need state
    // console.log(`ColumnFilterWithIcon: filterText=${filterText}`)
    const filterObject = {
      flagBlank: blankEnabled,
      flagText: textEnabled,
      filterText,
      textFlags
    }
    // This is a hook we are trying
    updateColumnFilter(renderedColumn.id, filterObject);
    setFilter(filterObject);
  }, [blankEnabled, textEnabled, filterText, textFlags]);

  const clearFilter = useCallback(() => {
    setExpanded(!expanded);
    updateColumnFilter(renderedColumn.id, undefined);
    setFilter(undefined);
  }, [expanded]);

  const searchIcon = (filterValue?.flagBlank ||
      (filterValue?.flagText && filterValue?.filterText)) ?
      <FaSearchPlus
          onClick={e => setExpanded(!expanded)}
          style={{cursor: "pointer"}}
      /> :
      <BiSearchAlt
          onClick={e => setExpanded(!expanded)}
          style={{cursor: "pointer"}}
      />;

  return (
      <>
      <ExpandableButton
          title="S"
          icon={searchIcon}
          expanded={expanded}
          onChange={e => setExpanded(!expanded)}
          popupPosition={renderedColumn.index < 3 ?
              {top:"100%", left:"50%"}:
                  renderedColumn.index < 6 ?
                  {top:"100%", transform: "translate(-50%, 0)"} :
                  {top:"100%", right:"50%"}
          }
      >
        <div style={{color:"black", display:"flex", flexDirection:"column", gap:"5px", alignItems: "start"}}>
          <div style={{width: "100%", color:"black", display:"flex", justifyContent: "space-between", gap: "10px"}}>
            <div
                style={{
                  color:"black",
                  display:"flex",
                  flexDirection:"row",
                  justifyContent: "start",
                  gap: "5px",
                  alignItems:"center"
                }}
            >
              <span style={{color:"black", fontSize:".8em", fontWeight: "normal" }}>
                {renderedColumn.Header}
              </span>
              <BiSearchAlt  />
            </div>

            <div>
              <TiTick
                  style={{color:"green", fontSize: "1.3em", cursor:"pointer"}}
                  onClick={e => setExpanded(!expanded)}
              />
              <AiOutlineClose
                  onClick={e => clearFilter()}
                  style={{color:"red", cursor: "pointer"}}
              />
            </div>
          </div>

          <div style={{display:"flex", flexDirection:"row", justifyContent: "space-between", gap:"10px"}}>
            <input type="checkbox"
                   defaultChecked={true}
                   onChange={e => {
                     setTextEnabled(e.target.checked);
                   }}
            />
            <InputWithIcons
                disabled={!textEnabled}
                defaultValue={{text: filterValue?.filterText, flags:filterValue?.textFlags }}
                onChange={({text, flags}) => {
                  // console.log(`text=${text} flags=${JSON.stringify(flags, null, 2)}`)
                  setFilterText(text);
                  setTextFlags(flags);
                }}
            />
          </div>

          <div style={{display:"flex", alignItems:"center", gap:"5px",
                       fontSize:"0.9em", fontWeight: "normal", marginTop: "5px"}}
          >
            <input type="checkbox"
                   onChange={e => {
                     setBlankEnabled(e.target.checked);
                   }}
            />
            <label>Blanks</label>
          </div>
        </div>
      </ExpandableButton>
      </>
  );
}