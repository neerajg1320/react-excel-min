import * as React from "react";
import {useEffect} from "react";
import Select from "react-select";
import {listToOptions} from "../../utils/options";

export const HeaderCreator = ({row, schema}) => {
  console.log(`HeaderCreator:rendered row=${JSON.stringify(row)}`);

  useEffect(() => {
    console.log(`HeaderCreator:mounted`);

    return () => {
      console.log(`HeaderCreator:destroyed`);
    }
  }, [])

  const HeaderElement = ({hdrName, choices}) => {
    return (
      <div style={{
        width: "100%",
        display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{width:"50%"}}>{hdrName}</span>
        <span style={{width:"50%"}}><Select options={listToOptions(choices, "")}/></span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection:"column", gap: "10px"
    }}>
      {
        row.map((elm, elmIdx) => {
          return (
            <HeaderElement key={elmIdx} hdrName={elm} choices={schema.map(item => item.keyName)}/>
          );
        })
      }
      <p>Header Creator Kept for display correction</p>
    </div>
  );
}