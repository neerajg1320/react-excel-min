import {useEffect, useState} from "react";
import {useAsyncDebounce} from "react-table";

export const GlobalFilter = ({globalFilter, setGlobalFilter}) => {
  // console.log(`Rendering <GlobalFilter>: filter=${filter}`);

  const [value, setValue] = useState(globalFilter || "");
  const onChange = useAsyncDebounce(val => {
    // console.log(`GlobalFilter: val=${val}`);
    setGlobalFilter(val)
  }, 100);

  // If the value changes from outside
  useEffect(() => {
    // console.log(`filter=${filter}`);
    setValue(globalFilter || "");
  }, [globalFilter]);

  return (
      <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
        <span>Search</span>
        <input
            className="form-control"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              onChange(e.target.value)
            }}
            style={{padding:"4px"}}
        />
      </div>
  );
}