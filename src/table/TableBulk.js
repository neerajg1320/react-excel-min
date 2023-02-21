import {TableWrapper} from "./TableWrapper";
import {debug} from "../components/config/debugEnabled";

export const TableBulk = (props) => {
  const {data:initialData, onDataChange:updateData, ledgers, categories} = props;
  if (debug.lifecycle) {
    console.log(`Rendering <TableBulk>`);
  }

  return (
      <TableWrapper {...props} />
  );
}