import * as React from "react";
import {Fragment, useEffect, useMemo, useRef, useState} from "react";
import Select from "react-select";
import {MultiSelect} from "react-multi-select-component";
import {listToOptions} from "../../utils/options";
import {getAllDateFormats, getAllTypes, getValueType, isString} from "../../utils/types";
import Button from "react-bootstrap/Button";
import {debug} from "../../components/config/debug";

// The schema is needed for headers
// For rows it should be filtered schema i.e. only the rows which are present in the
// The RuleCreator is first called to create HeaderElement
// Then it is called to create RowElements. So the RowElements can make use of a filtered Schema
// We will pass a schemaMap which carries the info of which index maps to which row
// The headerRule is required. It will be passed to type=data rows
export const RuleCreator = ({rows, schema, type, tag, onEvent, headerRule, formatList}) => {
  if (debug.lifecycle) {
    console.log(`RuleCreator:rendered`);
  }

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`RuleCreator:mounted`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`RuleCreator:destroyed`);
      }
    }
  }, []);

  const typeChoices = useMemo(() => {
    return getAllTypes();
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
      "CR": "credit",
      "Date": "transactionDate",
      "Narration": "description",
      "Chq./Ref.No.": "reference",
      "Value Dt": "valueDate",
      "Withdrawal Amt.": "debit",
      "Deposit Amt.": "credit",
      "Closing Balance": "balance",
    },
    rowMapper: {
    }
  });
  const [mapperSufficient, setMapperSufficient] = useState(false);

  const handleSaveMapperClick = (type, tag) => {
    // console.log(`handleSaveMapperClick: type=${type} tag=${tag}`);

    const eventObj = {
      tag
    };
    if (tag === 'header') {
      eventObj['rule'] = row.map((elm) => {
        const keyName = bufferRef.current.headerMapper[elm] !== undefined ? bufferRef.current.headerMapper[elm] : 'none';
        return {
          choices: [elm],
          acceptableTypes: ['string'],
          keyName,
          required: true,
        };
      });

      if (onEvent) {
        onEvent({name:'complete'}, eventObj);
      }
    } else {
      // console.log(`row[${row.length}]=${JSON.stringify(row)}`, row);
      // console.log(`headerRule[${headerRule.length}]=${JSON.stringify(headerRule, null, 2)}`);

      eventObj['rule'] = headerRule.map((hdrRuleElm, elmIdx) => {
        const keyName = hdrRuleElm.keyName;
        const elm = row[elmIdx];

        // This is not correct. The acceptableTypes have to be extracted from the RowElement
        console.log(`handleSaveMapperClick: rowMapper=${JSON.stringify(bufferRef.current.rowMapper, null, 2)}`);

        let valueType = getValueType(elm, formatList);
        if (typeof(valueType) === 'object') {
          valueType = valueType['type'];
        }

        return {
          acceptableTypes: [valueType],
          keyName,
          required: true,
          // finalType has to be added
          // format has to be added
        };
      });

      // Here we are updating the logic
      eventObj['rule'] = Object.entries(bufferRef.current.rowMapper).map(([keyName, rowRuleElm]) => {
        return {
          acceptableTypes: rowRuleElm.acceptableTypes,
          keyName,
          required:true
        };
      });

      // We need to add the onEvent call
      if (onEvent) {
        onEvent({name:'complete'}, eventObj);
      }
    }
  }

  // Header Element
  const HeaderElement = ({elmValue, keyNameChoices, keyNameInitialValue}) => {
    const schemaKeyOptions = useMemo(() => {
      return listToOptions(keyNameChoices, "")
    }, [keyNameChoices]);
    const [selection, setSelection] = useState(schemaKeyOptions.filter(opt => opt.value === keyNameInitialValue));
    const debug = false;

    const handleSelectChange = (sel) => {
      if (debug) {
        console.log(`option.value=${sel.value}`);
      }

      if (sel.value === "") {
        delete bufferRef.current.headerMapper[elmValue];
      } else {
        bufferRef.current.headerMapper[elmValue] = sel.value;
      }

      setSelection(sel);

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
              value={selection}
              options={schemaKeyOptions}
              onChange={handleSelectChange}
          />
        </span>
      </div>
    );
  }

  // Row Element
  // Need to pass the row value so that it can be put in samples
  const RowElement = ({elmValue, keyName, typeChoices, typeInitialValue}) => {
    const [typeValue, setTypeValue] = useState(typeInitialValue);
    const [multiSelection, setMultiSelection] = useState([]);

    const typeOptions = useMemo(() => {
      return listToOptions(typeChoices, "")
    }, []);

    const debug = true;

    const handleSelectionChange = (selection) => {
      if (debug) {
        console.log(`option.value=${selection.value}`);
      }

      setTypeValue(selection.value);

      // Update the rowMapper
      const acceptableTypes = [selection.value];
      bufferRef.current.rowMapper[keyName] = {
        ...bufferRef.current.rowMapper[keyName],
        acceptableTypes
      };

      console.log(`bufferRef.current.rowMapper[${keyName}]=${bufferRef.current.rowMapper[keyName]}`);

      // This part can be taken out by using a callback
      const mappedKeys = Object.keys(bufferRef.current.rowMapper);

      if (debug) {
        console.log(`mappedKeys:${JSON.stringify(mappedKeys, null, 2)}`);
        console.log(`requiredKeys=${requiredKeys}`);
      }

      if (mappedKeys.length >= requiredKeys.length) {
        const allMandatoryKeysMapped = requiredKeys.every(sKey => mappedKeys.includes(sKey))
        setMapperSufficient(allMandatoryKeysMapped);
      }
    };

    const handleMultiSelectionChange = (selections) => {
      console.log(`handleMultiSelectChange: selections=${JSON.stringify(selections)}`);
      setMultiSelection(selections);
      const mappedKeys = Object.keys(bufferRef.current.rowMapper);
      if (mappedKeys.length >= requiredKeys.length) {
        const allMandatoryKeysMapped = requiredKeys.every(sKey => mappedKeys.includes(sKey))
        setMapperSufficient(allMandatoryKeysMapped);
      }
    }

    return (
        <div style={{
          width: "100%",
          display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{textAlign: "left", width:"25%"}}>{keyName}</span>
          <span style={{textAlign: "left", width:"25%"}}>
            {['string', 'blank'].includes(typeValue) ? `[${elmValue?.length}]'${elmValue}'` : elmValue}
          </span>
          <span style={{width:"25%"}}>
            <Select
                value={typeOptions.filter(opt => opt.value === typeValue)}
                options={typeOptions}
                onChange={handleSelectionChange}
            />
          </span>
          <span style={{width:"25%"}}>
            <MultiSelect
                options={typeOptions}
                value={multiSelection}
                onChange={handleMultiSelectionChange}
                labelledBy="Select"
            />
          </span>
        </div>
    );
  }

  // For the RuleCreator component
  return (
    <div style={{
      display: "flex", flexDirection:"column", gap: "10px",
      textAlign: "center"
    }}>

      {
        (type === 'header' && row && row.length > 0) &&
        row.map((elm, elmIdx) => {
          return  (
            <HeaderElement
                key={elmIdx}
                elmValue={elm}
                keyNameChoices={[...schema.map(item => item.keyName), 'none']}
                keyNameInitialValue={bufferRef.current.headerMapper[elm] || 'none'}
            />
          );
        })
      }

      {
          (type !== 'header' && headerRule && headerRule.length > 0) &&
          headerRule.map((elm, elmIdx) => {

            const value = row[elmIdx];

            let typeIntialValue = getValueType(value, formatList);
            if (typeof(typeIntialValue) === 'object') {
              typeIntialValue = typeIntialValue['type'];
            }

            const keyName = headerRule[elmIdx].keyName;
            bufferRef.current.rowMapper[keyName] = {
              acceptableTypes: [typeIntialValue],
              samples: [
                {
                  type: typeIntialValue,
                  value: value
                }
              ]
            };

            return  (
              <RowElement
                  key={elmIdx}
                  elmValue={value}
                  keyName={keyName}
                  typeChoices={typeChoices}
                  typeInitialValue={typeIntialValue}
              />
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