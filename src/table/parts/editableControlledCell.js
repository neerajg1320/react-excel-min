import {useEffect, useState} from "react";
import {debug} from "../../components/config/debug";
import {PATCH} from "../common/operationsTypes";

// https://cloudnweb.dev/2020/08/how-to-build-an-actionable-data-table-with-react-table-and-tailwindcss/
const EditableControlledCell = ({value:initialValue, row, column, updateData}) => {
  if (debug.lifecycle) {
    console.log(`Rendering <EditableControlledCell>`);
  }
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<EditableControlledCell>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<EditableControlledCell>: Destroyed`);
      }
    }
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // console.log(`value=${value} initialValue=${initialValue}`);

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

export default EditableControlledCell;
