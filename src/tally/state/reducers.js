import {combineReducers} from "redux";
import tallyReducer from "./tallyReducer";

const rootReducer = combineReducers({
  tally: tallyReducer,
})

export default rootReducer;