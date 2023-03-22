import * as React from "react";
import {Fragment, useEffect, useMemo, useRef, useState} from "react";
import Select from "react-select";
import {listToOptions} from "../../utils/options";
import {getAllDateFormats, getAllTypes, getValueType} from "../../utils/types";
import Button from "react-bootstrap/Button";

// The schema is needed for headers
// For rows it should be filtered schema i.e. only the rows which are present in the
// The RuleCreator is first called to create HeaderElement
// Then it is called to create RowElements. So the RowElements can make use of a filtered Schema
// We will pass a schemaMap which carries the info of which index maps to which row
export const RuleCreator = ({rows, schema, type, tag, onEvent}) => {
  console.log(`HeaderCreator:rendered rows=`, rows);

  useEffect(() => {
    console.log(`HeaderCreator:mounted`);

    return () => {
      console.log(`HeaderCreator:destroyed`);
    }
  }, []);

  const typeChoices = useMemo(() => {
    return getAllTypes();
  }, []);

  const dateFormats = useMemo(() => {
    return getAllDateFormats();
  }, []);

  const row = useMemo(() => {
    // Here we need to make a composite row
    return rows[0];
  }, [rows]);

  const requiredKeys = useMemo(() => {
    return schema.filter(elm => elm.required).map(elm => elm.keyName);
  }, [schema]);

  const bufferRef = useRef({
    mapper: {
      // "SRL NO": "serialNum",
      // "Tran Date": "valueDate",
      // "CHQNO": "reference",
      // "PARTICULARS": "description",
      // "DR": "debit",
      // "CR": "credit"
    }
  });
  const [mapperSufficient, setMapperSufficient] = useState(false);

  const handleSaveMapperClick = () => {
    if (onEvent) {
      onEvent(
          {name:'complete'},
          {
            tag,
            rule: row.map((elm) => {
              const keyName = bufferRef.current.mapper[elm] !== undefined ? bufferRef.current.mapper[elm] : 'none';

              return {
                // acceptableTypes: tag === 'header' ? ['string'] : getValueType(v),
                acceptableTypes: ['string'],
                keyName,
                required: true,
                // finalType has to be added
                // format has to be added
              };
            })
      });
    }
  }

  // Header Element
  const HeaderElement = ({elmValue, keyNameChoices, keyNameInitialValue}) => {
    const [value, setValue] = useState(keyNameInitialValue);

    const schemaKeyOptions = useMemo(() => {
      return listToOptions(keyNameChoices, "")
    }, [keyNameChoices]);
    const debug = false;

    const handleSelectChange = (option) => {
      if (debug) {
        console.log(`option.value=${option.value}`);
      }

      if (option.value === "") {
        delete bufferRef.current.mapper[elmValue];
      } else {
        bufferRef.current.mapper[elmValue] = option.value;
      }

      setValue(option.value);

      // This part can be taken out by using a callback
      const schemaKeys = Object.keys(bufferRef.current.mapper).map((k) => bufferRef.current.mapper[k]);

      if (debug) {
        console.log(`mapper:${JSON.stringify(bufferRef.current.mapper, null, 2)}`);
        console.log(`schemaKeys:${JSON.stringify(schemaKeys, null, 2)}`);
        console.log(`requiredKeys=${requiredKeys}`);
      }

      // This has to be outside the header element
      if (schemaKeys.length >= requiredKeys.length) {
        const allMandatoryKeysMapped = requiredKeys.every(sKey => schemaKeys.includes(sKey))
        setMapperSufficient(allMandatoryKeysMapped);
      }
    };

    return (
      <div style={{
        width: "100%",
        display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{textAlign: "left", width:"50%"}}>{elmValue}</span>
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

  // Row Element
  const RowElement = ({elmValue, hdrValue, typeChoices, typeInitialValue}) => {
    const [typeValue, setTypeValue] = useState(typeInitialValue);

    const typeOptions = useMemo(() => {
      return listToOptions(typeChoices, "")
    }, []);

    const debug = true;

    const handleSelectChange = (option) => {
      if (debug) {
        console.log(`option.value=${option.value}`);
      }

      if (option.value === "") {
        delete bufferRef.current.mapper[elmValue];
      } else {
        bufferRef.current.mapper[elmValue] = option.value;
      }

      setTypeValue(option.value);

      // This part can be taken out by using a callback
      const schemaKeys = Object.keys(bufferRef.current.mapper);

      if (debug) {
        console.log(`mapper:${JSON.stringify(bufferRef.current.mapper, null, 2)}`);
        console.log(`schemaKeys:${JSON.stringify(schemaKeys, null, 2)}`);
        console.log(`requiredKeys=${requiredKeys}`);
      }

      if (schemaKeys.length >= requiredKeys.length) {
        const allMandatoryKeysMapped = requiredKeys.every(sKey => schemaKeys.includes(sKey))
        setMapperSufficient(allMandatoryKeysMapped);

        if (allMandatoryKeysMapped) {
          // if (onEvent) {
          //   onEvent({name:'complete'}, {
          //     tag,
          //     mapper: Object.fromEntries(row.map((elm) => {
          //       const keyName = bufferRef.current.mapper[elm] !== undefined ? bufferRef.current.mapper[elm] : 'notfound';
          //       return [elm,  keyName]
          //     }))
          //   });
          // }
        }
      }
    };

    return (
        <div style={{
          width: "100%",
          display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{textAlign: "left", width:"30%"}}>{hdrValue}</span>
          <span style={{textAlign: "left", width:"30%"}}>
            {['string', 'blank'].includes(typeValue) ? `[${elmValue.length}]'${elmValue}'` : elmValue}
          </span>
          <span style={{width:"40%"}}>
          <Select
              value={typeOptions.filter(opt => opt.value === typeValue)}
              options={typeOptions}
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
      {/*<pre>{JSON.stringify(row, null, 2)}</pre>*/}
      {(row && row.length > 0) &&
        row.map((elm, elmIdx) => {
          const hdrValue = schema[elmIdx].keyName;
          bufferRef.current.mapper[hdrValue] = elm;

          return  (
              <Fragment key={elmIdx}>
              {type === 'header' ?
                <HeaderElement
                    elmValue={elm}
                    keyNameChoices={[...schema.map(item => item.keyName), 'none']}
                    keyNameInitialValue={bufferRef.current.mapper[elm] || 'none'}
                />
                :
                <RowElement
                    elmValue={elm}
                    hdrValue={hdrValue}
                    typeChoices={typeChoices}
                    typeInitialValue={getValueType(elm)}
                />
              }
              </Fragment>
          );
        })
      }
      {
        mapperSufficient ?
            <p style={{backgroundColor:'rgba(0, 255, 0, 0.2)'}}>Mapper Complete</p> :
            <p style={{backgroundColor:'rgba(255, 0, 0, 0.2)'}}>Mapper Incomplete</p>
      }
      <Button onClick={handleSaveMapperClick} disabled={!mapperSufficient}>
        Save Mapper
      </Button>
      <p>Header Creator Kept for display correction</p>
    </div>
  );
}