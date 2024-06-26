import * as React from "react";
import {Fragment, useEffect, useMemo, useRef, useState} from "react";
import {getAllDateFormats, getAllTypes, getValueType} from "../../utils/types";
import Button from "react-bootstrap/Button";
import {debug} from "../../components/config/debug";
import {HeaderElement} from "./HeaderElement";
import {RowElement} from "./RowElement";

// The schema is needed for headers
// For rows it should be filtered schema i.e. only the rows which are present in the
// The RuleCreator is first called to create HeaderElement
// Then it is called to create RowElements. So the RowElements can make use of a filtered Schema
// We will pass a schemaMap which carries the info of which index maps to which row
// The headerRule is required. It will be passed to type=data rows
export const RuleCreator = ({rows, schema, name:initialName, type, tag, onEvent, headerRule, formatList}) => {
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

  const [ruleName, setRuleName] = useState(initialName || "");

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

  const defaultMapper = useMemo(() => {
    return {
      "SRL NO": "serialNum",
      "Tran Date": "valueDate",
      "CHQNO": "reference",
      "PARTICULARS": "description",
      "DR": "debit",
      "CR": "credit",
      "BAL": "balance",
      "Date": "transactionDate",
      "Narration": "description",
      "Chq./Ref.No.": "reference",
      "Value Dt": "valueDate",
      "Withdrawal Amt.": "debit",
      "Deposit Amt.": "credit",
      "Closing Balance": "balance",
      "Sl. No.": "serialNum",
      "Transaction Date": "transactionDate",
      "Value Date": "valueDate",
      "Description": "description",
      "Chq / Ref No.": "reference",
      "Debit": "debit",
      "Credit": "credit",
      "Balance": "balance",
      "Dr / Cr": "drCr",
      "Withdrawals": "debit",
      "Deposits": "credit",
      "Ref No./Cheque No.": "reference",
      "Txn Date": "transactionDate"
    }
  });
  const [headerMapper, setHeaderMapper] = useState(defaultMapper);
  const [rowMapper, setRowMapper] = useState({});

  const [mapperSufficient, setMapperSufficient] = useState(false);

  useEffect(() => {
    // This achieves the required rerender as well.
    // TBD: we need to fix this logic.
    // Note: Do not remove the setMapperSufficient till we fix the rerender logic for rowMapper
    setMapperSufficient(false);

    if (type != 'header' && (headerRule && headerRule.length > 0)) {
      console.log(`Clearing the rowMapper`);
      console.log(`headerRule: ${JSON.stringify(headerRule, null, 2)}`);
      console.log(`row: ${JSON.stringify(row, null, 2)}`);

      const newRowMapper = Object.fromEntries(

        headerRule.map((elm, elmIdx) => {
          const value = row[elmIdx];

          const keyName = elm.keyName;
          
          let typeIntialValue = getValueType(value, formatList);
          if (typeof(typeIntialValue) === 'object') {
            typeIntialValue = typeIntialValue['type'];
          }

          return [keyName, {
            acceptableTypes: [typeIntialValue],
            samples: [
              {
                type: typeIntialValue,
                value: value
              }
            ]
          }];

        })
      )
      setRowMapper(newRowMapper);
    }
  }, [type, tag, row, headerRule])

  const handleSaveMapperClick = (name, type, tag) => {
    console.log(`handleSaveMapperClick: type=${type} tag=${tag}`);

    const eventObj = {
      name: ruleName,
      tag
    };

    if (tag === 'header') {
      eventObj['rule'] = row.map((elm) => {
        const keyName = headerMapper[elm] !== undefined ? headerMapper[elm] : 'none';
        return {
          choices: [elm],
          acceptableTypes: ['string'],
          keyName,
          required: true,
        };
      });
    } else {
      eventObj['rule'] = Object.entries(rowMapper).map(([keyName, rowRuleElm]) => {
        return {
          acceptableTypes: rowRuleElm.acceptableTypes,
          keyName,
          required:true
        };
      });
    }

    if (onEvent) {
      onEvent({name:'complete'}, eventObj);
    }
  }

  const handleHeaderElementMappingChange = (key, value) => {
    console.log(`handleHeaderElementMappingChange: ${key} ${value}`)

    setHeaderMapper((prevHeaderMapper) => {
      const updatedHeaderMapper = {
        ...prevHeaderMapper
      }

      if (value === "") {
        delete updatedHeaderMapper[key];
      } else {
        updatedHeaderMapper[key] = value;
      }

      return updatedHeaderMapper;
    });
  }

  useEffect(() => {
    const schemaKeys = Object.entries(headerMapper).map(([k, v]) => v);

    if (debug.details) {
      console.log(`mapper:${JSON.stringify(headerMapper, null, 2)}`);
      console.log(`schemaKeys:${JSON.stringify(schemaKeys, null, 2)}`);
      console.log(`requiredKeys=${requiredKeys}`);
    }

    // This has to be outside the header element
    if (ruleName && schemaKeys.length >= requiredKeys.length) {
      const allMandatoryKeysMapped = requiredKeys.every(sKey => schemaKeys.includes(sKey))
      setMapperSufficient(allMandatoryKeysMapped);
    }
  }, [headerMapper, requiredKeys])

  const handleRowElementTypesChange = (keyName, acceptableTypes) => {
    console.log(`handleRowElementTypesChange: ${keyName} ${acceptableTypes}`)

    setRowMapper((prevRowMapper) => {
      return  {
        ...prevRowMapper,
        [keyName]: {
          ...prevRowMapper[keyName],
          acceptableTypes
        }
      }
    });
  }

  useEffect(() => {
    const mappedKeys = Object.keys(rowMapper);
    if (ruleName && mappedKeys.length >= requiredKeys.length) {
      const allMandatoryKeysMapped = requiredKeys.every(sKey => mappedKeys.includes(sKey))
      setMapperSufficient(allMandatoryKeysMapped);
    }
  }, [rowMapper, requiredKeys])

  return (
    <div style={{
      display: "flex", flexDirection:"column", gap: "10px",
      textAlign: "center"
    }}>

      <div style={{
        display: "flex", flexDirection: "row", gap: "20px",
        marginBottom: "20px"
      }}>
        <span style={{fontWeight: "bold"}}>Signature Name:</span>
        <span><input value={ruleName} onChange={(e) => {setRuleName(e.target.value)}}/></span>
      </div>
      {
        (type === 'header' && row && row.length > 0) &&
        row.map((elm, elmIdx) => {
          return  (
            <HeaderElement
                key={elmIdx}
                elmValue={elm}
                keyNameChoices={[...schema.map(item => item.keyName), 'none']}
                keyNameInitialValue={headerMapper[elm] || 'none'}
                onChange={handleHeaderElementMappingChange}
            />
          );
        })
      }

      {
        (type !== 'header' && headerRule && headerRule.length > 0) &&
        headerRule.map((elm, elmIdx) => {
          const value = row[elmIdx];

          const keyName = elm.keyName;

          return  (
            <Fragment key={elmIdx}>
              {rowMapper[keyName] ?
                <RowElement
                    elmValue={value}
                    keyName={keyName}
                    typeChoices={typeChoices}
                    typeInitialValues={rowMapper[keyName]['acceptableTypes']}
                    onChange={handleRowElementTypesChange}
                />
                  :
                  <h4>{`${rowMapper[keyName]} is not valid`}</h4>
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

      <Button onClick={() => handleSaveMapperClick(ruleName, type, tag)} disabled={!mapperSufficient}>
        Save Mapper
      </Button>
      <p>Header Creator Kept for display correction</p>
    </div>
  );
}