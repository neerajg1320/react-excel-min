import {debug} from "../../components/config/debugEnabled";
import {useContext, useEffect, useMemo} from "react";
import ReadContext from "../ReadContext";

export const Mappers = () => {
  if (debug.lifecycle) {
    console.log(`Rendering <Mappers>`);
  }

  useEffect(() => {
    if (debug.lifecycle) {
      console.log(`<Mappers>: First render`);
    }

    return () => {
      if (debug.lifecycle) {
        console.log(`<Mappers>: Destroyed`);
      }
    }
  }, []);

  const {
    getMappers,
  } = useContext(ReadContext);

  const mappers = useMemo(() => {
    if (getMappers) {
      return getMappers();
    }
  });

  return (
    <div>
      Bank Mappers
      {mappers && mappers.map((mapper, index) => (
        <div key={index}>
          <h3>{mapper.name}</h3>
          <pre>{JSON.stringify(mapper, null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}
