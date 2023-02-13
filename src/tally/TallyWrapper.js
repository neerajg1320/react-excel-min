import {Provider} from "react-redux";
import store from "./state/store";
import {useEffect} from "react";
import {debug} from "../components/config/debug";
import {TallyMain} from "./TallyMain";

export const TallyWrapper = (props) => {
  if (debug.lifecycle) {
    console.log(`Rendering <TallyWrapper>`);
  }

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<TallyWrapper>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<TallyWrapper>: Destroyed`);
      }
    }
  }, []);


  return (
    <Provider store={store}>
      <TallyMain {...props} />
    </Provider>
  )
}
