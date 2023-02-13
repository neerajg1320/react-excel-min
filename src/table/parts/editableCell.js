import {useEffect, useState} from "react";
import {PATCH} from "../common/operationsTypes";

// https://cloudnweb.dev/2020/08/how-to-build-an-actionable-data-table-with-react-table-and-tailwindcss/
const EditableCell = ({value: initialValue, row, column, updateData}) => {
  // console.log(`Render Editable Cell`);
  const [value, setValue] = useState(initialValue || "");

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    if (initialValue) {
      // console.log(`initialValue=${initialValue}`);
      setValue(initialValue);
    }

    // console.log(row);
    // console.log(column);
  }, [initialValue]);

  return (
    <>
      <form>
        <input
            className="form-control"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={(e) => updateData(PATCH, [row.index], {[column.keyName]: value})}
        />
      </form>
    </>
  );
}

export default EditableCell;
