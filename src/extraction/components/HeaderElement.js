import {useMemo} from "react";
import {listToOptions} from "../../utils/options";
import Select from "react-select";

export const HeaderElement = ({elmValue, keyNameChoices, keyNameInitialValue, onChange}) => {
  const schemaKeyOptions = useMemo(() => {
    return listToOptions(keyNameChoices, "")
  }, [keyNameChoices]);

  const selection = useMemo(() => {
    return schemaKeyOptions.filter(opt => opt.value === keyNameInitialValue);
  });

  const handleSelectChange = (sel) => {
    if (onChange) {
      onChange(elmValue, sel.value);
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