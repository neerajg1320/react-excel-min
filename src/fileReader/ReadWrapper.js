import {debug} from "../components/config/debug";
import {useNavigate} from "react-router-dom";
import {useCallback, useContext, useMemo, useState} from "react";
import ReadContext from "./ReadContext";
import {accountingColumns, presetColumns, statementColumns} from "../presets/presetColumns";
import {generateKeyFromHeader} from "../schema/core";
import {dateFromNumber, dateFromString, getValueType, isDate, isString, numberFromString} from "../utils/types";
import ReadExcel from "./xlsx/ReadExcel";
import {Mappers} from "./mappers/Mappers";
import {getRowSignature} from "../utils/signature";
import * as React from "react";
import * as hdfc from "../banks/hdfc";
import * as kotak from "../banks/kotak";
import * as kotak2 from "../banks/kotak2";

export const ReadWrapper = ({onDataChange: updateData, transactions=true, formatList}) => {
  if (debug.lifecycle) {
    console.log(`Rendering <Read>`);
  }

  const debugFiltering = false;
  const debugRowIdx = debugFiltering ? 0 : -1;

  const navigate = useNavigate();

  const [interpretValues, setInterpretValues] = useState(true);
  const [showMappers, setShowMappers] = useState(false);

  // Comment: The headerMapper based logic is not right. But we can use the key renaming logic
  const mappers = useMemo(() => {
    const mappers = []
    // TBD: Put default headerMapper attributes
    mappers.push({name: hdfc.bankName, matchThreshold: 7, headerKeynameMap: hdfc.headerKeynameMap});
    mappers.push({name: kotak.bankName, matchThreshold: 9, headerKeynameMap: kotak.headerKeynameMap});
    mappers.push({name: kotak2.bankName, matchThreshold: 9, headerKeynameMap: kotak2.headerKeynameMap});
    return mappers;
  });

  const getMappers = useCallback(() => {
    return mappers;
  });

  const readContext = {
    getMappers,
    interpretValues
  };

  const getKeyFromPresets = useCallback((headerName) => {
    // TBD: need to update matching algo
    const matchingColumns = presetColumns.filter(col => {
      return col.matchLabels.includes(headerName)
    });

    if (matchingColumns.length > 0) {
      const matchingCol = matchingColumns[0]
      return matchingCol.keyName;
    }

    console.log(`headerName=${headerName} not found in presets`);
    return null;
  }, []);

  // Kept for future use: Would be used for banks which aren't supported yet
  // The input data is an object of the form {..., excelHeader: value, ...}
  // The normalized data is an object of the form {..., keyName: value, ...}
  const dataNormalizeUsingCommon = useCallback((data) => {
    const nData = data.map(row => {
      return Object.fromEntries(Object.entries(row).map(([headerName, val]) => {
        const keyName = getKeyFromPresets(headerName) || generateKeyFromHeader(headerName);
        return [keyName, val];
      }));
    })
    return nData;
  }, []);

  const getKeyFromMapper = useCallback((headerName, headerKeynameMap) => {
    // console.log(`getKeyFromMapper: headerName=${headerName}`);

    const matchingColumns = headerKeynameMap.filter(col => {
      return col.matchLabels.includes(headerName)
    });

    if (matchingColumns.length > 0) {
      const matchingCol = matchingColumns[0]
      return matchingCol.keyName;
    }

    console.log(`headerName=${headerName} not found in presets`);
    return null;
  }, []);


  // The following is used when we read excel with a header row specified
  // The input data is an object of the form {..., excelHeader: value, ...}
  // The normalized data is an object of the form {..., keyName: value, ...}
  const dataNormalizeUsingMapper = useCallback((data) => {
    // First we match a headerMapper from the headerMapper array

    const [matchedMapper, exactMapper] = getMatchedMapper(Object.keys(data[0]));

    // Then we use the headerMapper to create data
    if (matchedMapper) {
      const {name, headerKeynameMap} = matchedMapper;
      console.log(`dataNormalizeUsingMapper: Match Found: name=${name} keysMatched=${headerKeynameMap.length}`);
      console.log(matchedMapper);
      const nData = data.map(row => {
        return Object.fromEntries(Object.entries(row).map(([headerName, val]) => {
          const keyName = getKeyFromMapper(headerName, headerKeynameMap) || generateKeyFromHeader(headerName);
          return [keyName, val];
        }));
      });

      console.log(`nData=${JSON.stringify(nData, null, 2)}`);

      return nData;
    }

    return data;
  }, [getMappers]);

  const addAccountingColumns = useCallback((data) => {
    if (!data) {
      return;
    }

    return data.map((row) => {
      const accRow = {...row};
      const rowProps = Object.keys(accRow);

      accountingColumns.forEach(accCol => {
        if (!rowProps.includes(accCol.keyName)) {
          if (accCol.required) {
            accRow[accCol.keyName] = accCol.defaultValue;
          }
        }
      });
      return accRow
    });
  }, []);


  const isAllString = (rowSignature) => {
    let result = true;
    for (let i=0; i < rowSignature.length; i++) {
      if (rowSignature[i] !== "string") {
        result = false;
        break;
      }
    }

    return result;
  }

  const getMatchedMapper = (headers) => {
    const mappers = getMappers();
    // console.log(`mappers=`, mappers);

    let matchedPresetMapper;
    let exactMapper;

    for (let mprIdx=0; mprIdx < mappers.length; mprIdx++) {
      const {matchThreshold, headerKeynameMap} = mappers[mprIdx];

      const hdrKeyEntries = headers.reduce((prev, hdrName) => {
        const matchingEntries = headerKeynameMap.filter(item => item.matchLabels.includes(hdrName));
        if (matchingEntries.length) {
          const keyName = matchingEntries[0].keyName;
          const statementColumn = statementColumns.filter(col => col.keyName === keyName)[0];
          const exactMapperEntry = {
            ...matchingEntries[0],
            statementColumn,
            detectedTypes: [],
            acceptedTypes: []
          };
          return [...prev, [hdrName, exactMapperEntry]];
        }

        return [...prev];
      }, []);

      // console.log(`getMatchedMapper: headers.length:${headers.length} hdrKeyEntries.length:${hdrKeyEntries.length} headerKeynameMap.length:${headerKeynameMap.length}`)

      // In case of exact match or matched keys are above threshold then we declare a match and stop matching loop
      // The logic has to be modified.
      // We need to pick the best match. Thresholds should be reported.
      // We need to show match percentage with the compared headers
      if (hdrKeyEntries.length === headerKeynameMap.length || (matchThreshold && hdrKeyEntries.length >= matchThreshold)) {
        // console.log(`hdrKeyMap: ${JSON.stringify(hdrKeyEntries, null, 2)}`);
        matchedPresetMapper = mappers[mprIdx];
        exactMapper = Object.fromEntries(hdrKeyEntries);
        // console.log(`exactMapper: ${JSON.stringify(exactMapper, null, 2)}`);
        break;
      }
    }

    return [matchedPresetMapper, exactMapper];
  }

  // There are two isSignatureMatch.
  // The other one is in utils/signature.js
  // The other is better because it considers value as well.
  const isSignatureMatch = (mSignature, signature, rowIdx, matchType) => {
    let match = true;
    if (rowIdx === debugRowIdx) {
      console.log(`mSignature=${JSON.stringify(mSignature)}  signature=${JSON.stringify(signature)}`);
    }
    for (let i=0; i < mSignature.length; i++) {
      if (mSignature[i] && !mSignature[i].includes(signature[i])) {
        if (rowIdx === 1) {
          console.log(`i:${i} no match: mSignature[i]=${mSignature[i]}  signature[i]=${signature[i]}`);
        }
        match = false;
        break;
      }
    }
    return match;
  }

  const filterStatementRows = useCallback((data) => {
    // console.log(`data=`, data);

    const filterThreshold = 6;
    let matchedPresetMapper, exactMapper;
    let matchRowSignature;

    let headerRow;
    let matchedRows = [];

    for (let rowIdx=0; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];

      if (rowIdx === debugRowIdx) {
        console.log(`${rowIdx}: matchedMapper=`, matchedPresetMapper);
      }

      const numProps = matchedPresetMapper ? matchedPresetMapper.headerKeynameMap.length : -1;
      const signature = getRowSignature(row, rowIdx, numProps, formatList).map(sig => sig['finalType']);
      // console.log(`[${rowIdx}] signature=`, signature);

      if (signature.length >= filterThreshold) {
        // All strings signature is a possible header
        if (isAllString(signature)) {
          // Example: row=["Sl. No.","Transaction Date","Value Date","Description","Chq / Ref No.","Debit","Credit","Balance","Dr / Cr"]
          // console.log(`row=`, row);

          const headers = Object.entries(row).map(([k, val]) => val);
          // TBD: We need to optimize the logic here.
          // We need not look for every row from scratch
          const [resultMapper, resultExactMapper] = getMatchedMapper(headers);

          if (resultMapper) {
            matchedPresetMapper = resultMapper;
            exactMapper = resultExactMapper;

            if (debugFiltering) {
              console.log(`${rowIdx}: Found Header Row:`, row);
              console.log(`matchedMapper.headerKeynameMap: ${JSON.stringify(matchedPresetMapper.headerKeynameMap, null, 2)}`);
              console.log(`exactMapper: ${JSON.stringify(exactMapper, null, 2)}`);
            }
            headerRow = {...row};

            if (debugFiltering) {
              console.log(headerRow);
            }

            // Get the type of the keyNames from the statement
            // From the statementColumns create an acceptable signature
            matchRowSignature = headers.map(hdrName => {
              const statementCol = exactMapper[hdrName]?.statementColumn;
              if (statementCol) {
                const acceptedTypes = exactMapper[hdrName].acceptedTypes;

                if (statementCol.acceptedTypes) {
                  statementCol.acceptedTypes.forEach(t => acceptedTypes.push(t));
                } else {
                  acceptedTypes.push(statementCol.type)
                }

                // const acceptedTypes = [statementCol.type];

                // We are accepting strings as dates as well
                if (statementCol.type === "date") {
                  acceptedTypes.push('string');
                  acceptedTypes.push('number');
                }

                if (statementCol.type === "number") {
                  acceptedTypes.push('string');
                }

                if (!statementCol.required) {
                  acceptedTypes.push('undefined');
                }

                return acceptedTypes;
              }
            });

            // console.log(`matchRowSignature=`, matchRowSignature);
          }
        } else {
          if (matchRowSignature) {
            const isMatch = isSignatureMatch(matchRowSignature, signature, rowIdx);
            if (isMatch) {
              matchedRows.push({...row});
            }

            if (rowIdx === debugRowIdx) {
              console.log(`${rowIdx}: matchRowSignature=`, matchRowSignature);
              console.log(`${rowIdx}: signature=`, signature);
              console.log(`match:${isMatch}`);
            }

          }
        }
      }
    }

    if (!matchedPresetMapper) {
      console.error(`No matching mappers found`);
    }

    return {headerRow, matchedRows, matchedPresetMapper, exactMapper};

  }, [formatList]);

  const createDataFromRows = (header, rows, matchedPresetMapper, exactMapper,
                              {skipUndefined, interpretValues, interpretHeaderTypes}
  ) => {
    if (!matchedPresetMapper) {
      console.error(`Invalid matchedPresetMapper:${matchedPresetMapper}`);
      return;
    }

    // header is an array of column names in file. We need to get keyNames
    const keyNames = matchedPresetMapper.headerKeynameMap.map(item => [item.keyName]);

    const data = rows.map((row, rowIdx) => {
      const item = {};
      for (let i=0; i < keyNames.length; i++) {
        if (!header[i]) {
          continue;
        }

        const headerName = header[i];

        if(!Object.keys(exactMapper).includes(headerName)) {
          console.error(`header '${headerName}' not found in exactMapper`);
          continue;
        }

        const {keyName, format, statementColumn, parse, detectedTypes} =  exactMapper[headerName];

        if (skipUndefined && row[i] === undefined) {
          continue;
        }

        // console.log(`statementColumn=${JSON.stringify(statementColumn, null, 2)}`);

        if (debugRowIdx === rowIdx) {
          console.log(`headerName='${headerName}' keyName='${keyName}' format='${format}' row[${i}]='${row[i]}':${typeof(row[i])}`);
        }

        const value = row[i];
        let interpretedValue;
        if (interpretValues) {
          if (parse) {
            interpretedValue = parse(value, rowIdx);
          }

          if (interpretedValue === undefined && value !== undefined) {
            if (statementColumn && statementColumn.type) {
              if (statementColumn.type === "date") {
                if (isString(value)) {
                  if (debugRowIdx === rowIdx) { console.log(`got string`);}
                  interpretedValue = dateFromString(value, format);
                } else {
                  if (debugRowIdx === rowIdx) { console.log(`got not string`);}
                  interpretedValue = dateFromNumber(value);
                }
              } else if (statementColumn.type === "number") {
                interpretedValue = numberFromString(value);
              } else if (statementColumn.type === "string") {
                interpretedValue = String(value);
              }
            }
          }
        }
        item[keyName] = interpretedValue !== undefined ? interpretedValue : value;

        if (debugRowIdx === rowIdx) {
          console.log(`converted=${item[keyName]} ${typeof(item[keyName])}`);
        }

        if (interpretHeaderTypes) {
          const valueType = getValueType(item[keyName]);
          if (!detectedTypes.includes(valueType)) {
            detectedTypes.push(valueType);
          }
        }
      }

      if (debugRowIdx === rowIdx) {
        console.log(`item=${JSON.stringify(item, null, 2)}`);
      }

      return item;
    });

    return data;
  }

  const onLoadComplete = ({data}) => {
    let txsData=null;
    let update={};

    if (transactions) {
      // console.log(`ReadWrapper:onLoadComplete data=`, data);
      const {headerRow, matchedRows, matchedPresetMapper, exactMapper} = filterStatementRows(data);

      // This takes excel rows and create data using a mappper
      const filteredData = createDataFromRows(
          headerRow,
          matchedRows,
          matchedPresetMapper,
          exactMapper,
          {
            skipUndefined: false,
            interpretValues,
            interpretHeaderTypes: true
          }
      )

      if (!filteredData) {
        console.log('No transactions detected');
      } else {
        // console.log(`filteredData:`, filteredData);
        txsData = addAccountingColumns(filteredData);
        update = {action: 'ADD', payload:txsData};
      }
    }

    if (updateData) {
      updateData(data, txsData, [update], 'dataSourceFileReader');
    }

    // navigate('/transactions', { state: { data:accountingData, headersMap:JSON.stringify(exactMapper) } });
    navigate('/transactions');
  };

  return (
    <ReadContext.Provider value={readContext}>
      <ReadExcel onComplete={onLoadComplete}/>
      {showMappers && <Mappers />}
    </ReadContext.Provider>
  );
};