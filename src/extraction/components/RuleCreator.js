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
// The headerRule is required. It will be passed to type=data rows
export const RuleCreator = ({rows, schema, type, tag, onEvent, headerRule}) => {
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
    headerMapper: {
      "SRL NO": "serialNum",
      "Tran Date": "valueDate",
      "CHQNO": "reference",
      "PARTICULARS": "description",
      "DR": "debit",
      "CR": "credit"
    },
    rowMapper: {
    }
  });
  const [mapperSufficient, setMapperSufficient] = useState(false);

  const handleSaveMapperClick = (type, tag) => {
    console.log(`handleSaveMapperClick: type=${type} tag=${tag}`);

    if (onEvent) {
      onEvent(
          {name:'complete'},
          {
            tag,
            // When we want to use data from multiple rows we will use reduce
            rule: row.map((elm) => {
              const keyName = bufferRef.current.headerMapper[elm] !== undefined ? bufferRef.current.headerMapper[elm] : 'none';

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
        delete bufferRef.current.headerMapper[elmValue];
      } else {
        bufferRef.current.headerMapper[elmValue] = option.value;
      }

      setValue(option.value);

      // This part can be taken out by using a callback
      const schemaKeys = Object.keys(bufferRef.current.headerMapper).map((k) => bufferRef.current.headerMapper[k]);

      if (debug) {
        console.log(`mapper:${JSON.stringify(bufferRef.current.headerMapper, null, 2)}`);
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
  const RowElement = ({elmValue, elmIndex, hdrValue, typeChoices, typeInitialValue}) => {
    const [typeValue, setTypeValue] = useState(typeInitialValue);

    const typeOptions = useMemo(() => {
      return listToOptions(typeChoices, "")
    }, []);

    const debug = true;

    const handleSelectChange = (option) => {
      if (debug) {
        console.log(`option.value=${option.value}`);
      }

      setTypeValue(option.value);

      console.log(`bufferRef.current.rowMapper[${hdrValue}]=${bufferRef.current.rowMapper[hdrValue]}`);

      // This part can be taken out by using a callback
      const mappedKeys = Object.keys(bufferRef.current.rowMapper);

      if (debug) {
        console.log(`mapper:${JSON.stringify(bufferRef.current.rowMapper, null, 2)}`);
        console.log(`mappedKeys:${JSON.stringify(mappedKeys, null, 2)}`);
        console.log(`requiredKeys=${requiredKeys}`);
      }

      if (mappedKeys.length >= requiredKeys.length) {
        const allMandatoryKeysMapped = requiredKeys.every(sKey => mappedKeys.includes(sKey))
        setMapperSufficient(allMandatoryKeysMapped);
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
      {(row && row.length > 0) &&
        row.map((elm, elmIdx) => {

          let hdrValue;
          if (type === 'data') {
            hdrValue = headerRule ? headerRule[elmIdx].keyName : `notfound[$elmIdx]`;
            bufferRef.current.rowMapper[hdrValue] = elm;
          }

          return  (
              <Fragment key={elmIdx}>
              {type === 'header' ?
                <HeaderElement
                    elmValue={elm}
                    keyNameChoices={[...schema.map(item => item.keyName), 'none']}
                    keyNameInitialValue={bufferRef.current.headerMapper[elm] || 'none'}
                />
                :
                <RowElement
                    elmValue={elm}
                    elmIndex={elmIdx}
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
      <Button onClick={() => handleSaveMapperClick(type, tag)} disabled={!mapperSufficient}>
        Save Mapper
      </Button>
      <p>Header Creator Kept for display correction</p>
    </div>
  );
}