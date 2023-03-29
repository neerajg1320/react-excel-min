import {useMemo} from "react";
import {listToOptions} from "../../utils/options";
import {MultiSelect} from "react-multi-select-component";

export const RowElement = ({elmValue, keyName, typeChoices, typeInitialValues, onChange}) => {
  const typeOptions = useMemo(() => {
    return listToOptions(typeChoices, "")
  }, [typeChoices]);

  const multiSelection = useMemo(() => {
    return typeOptions.filter(opt => typeInitialValues.includes(opt.value));
  });

  const handleMultiSelectionChange = (sels) => {
    const acceptableTypes = sels.map(sel => sel.value);

    if (onChange) {
      onChange(keyName, acceptableTypes);
    }
  }

  return (
      <div style={{
        width: "100%",
        display: "flex", flexDirection:"row", justifyContent: "space-between", alignItems: "center"
      }}>
        <span style={{textAlign: "left", width:"25%"}}>{keyName}</span>
        <span style={{textAlign: "left", width:"35%"}}>{elmValue}</span>
        <span style={{width:"40%"}}>
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