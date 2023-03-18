import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import Select from "react-select";
import {listToOptions} from "../../utils/options";

export const HeaderCreator = ({row, schema, onEvent}) => {
  console.log(`HeaderCreator:rendered row=${JSON.stringify(row)}`);
  const mandatoryKeys = useMemo(() => {
    return schema.filter(elm => elm.required).map(elm => elm.keyName);
  }, [schema]);

  // console.log(`mandatoryKeys=${mandatoryKeys}`);

  const bufferRef = useRef({
    mapper: {}
  });
  const [mapperSufficient, setMapperSufficient] = useState(false);

  useEffect(() => {
    console.log(`HeaderCreator:mounted`);

    return () => {
      console.log(`HeaderCreator:destroyed`);
    }
  }, [])

  const HeaderElement = ({hdrName, choices, initialValue}) => {
    const [value, setValue] = useState(initialValue);

    const schemaKeyOptions = useMemo(() => {
      return listToOptions(choices, "")
    }, [choices]);
    const debug = false;

    const handleSelectChange = (option) => {
      if (debug) {
        console.log(`option.value=${option.value}`);
      }

      if (option.value === "") {
        delete bufferRef.current.mapper[hdrName];
      } else {
        bufferRef.current.mapper[hdrName] = option.value;
      }

      setValue(option.value);

      // This part can be taken out by using a callback
      const schemaKeys = Object.keys(bufferRef.current.mapper).map((k) => bufferRef.current.mapper[k]);

      if (debug) {
        console.log(`mapper:${JSON.stringify(bufferRef.current.mapper, null, 2)}`);
        console.log(`schemaKeys:${JSON.stringify(schemaKeys, null, 2)}`);
        console.log(`mandatoryKeys=${mandatoryKeys}`);
      }

      if (schemaKeys.length >= mandatoryKeys.length) {
        const allMandatoryKeysMapped = mandatoryKeys.every(sKey => schemaKeys.includes(sKey))
        setMapperSufficient(allMandatoryKeysMapped);

        if (allMandatoryKeysMapped) {
          if (onEvent) {
            onEvent({name:'complete'}, {...bufferRef.current.mapper});
          }
        }
      }
    }

    return (
      <div style={{
        width: "100%",
        display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{width:"50%"}}>{hdrName}</span>
        <span style={{width:"50%"}}>
          <Select
              value={schemaKeyOptions.filter(opt => opt.value === value)}
              options={schemaKeyOptions}
              onChange={handleSelectChange}
          />
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection:"column", gap: "10px",
      textAlign: "center"
    }}>
      {
        row.map((elm, elmIdx) => {
          return (
            <HeaderElement
                key={elmIdx}
                hdrName={elm}
                choices={schema.map(item => item.keyName)}
                initialValue={bufferRef.current.mapper[elm]}
            />
          );
        })
      }
      {
        mapperSufficient ?
            <p style={{backgroundColor:'rgba(0, 255, 0, 0.2)'}}>Mapper Complete</p> :
            <p style={{backgroundColor:'rgba(255, 0, 0, 0.2)'}}>Mapper Incomplete</p>
      }
      <p>Header Creator Kept for display correction</p>
    </div>
  );
}