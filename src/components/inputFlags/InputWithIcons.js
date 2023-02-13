import {RxLetterCaseCapitalize} from "react-icons/rx";
import {TbLetterF} from "react-icons/tb";
import {SiExpress} from "react-icons/si";
import {useCallback, useEffect, useRef, useState} from "react";
import FlagIcon from "./FlagIcon";
import './inputIcons.css';

const InputWithIcons = ({defaultValue, onChange, disabled}) => {
  // console.log(`Rendering <InputWithIcons>`);

  const [caps, setCaps] = useState(false);
  const [full, setFull] = useState(false);
  const [regex, setRegex] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current.value) {
      onChange({text: inputRef.current.value, flags:{caps, full, regex}});
    }
  }, [caps, full, regex]);

  const handleInputChange = useCallback((e) => {
    onChange({text: e.target.value, flags:{caps, full, regex}})
  }, [caps, full, regex]);

  return (
      <div
          style={{
            position:"relative",
            display: "flex",
            flexDirection:"row",
            gap:"4px",
            alignItems:"start"
          }}
      >
        <input
            ref={inputRef}
            disabled={disabled}
            className="form-control"
            defaultValue={defaultValue.text}
            onChange={handleInputChange}
            style={{width: "200px"}}
        />

        <div
            className="filter-flags"
            style={{
              display:"flex",
              flexDirection:"row",
              gap:"4px",
              position: "absolute",
              right: "5px"
            }}
        >
          <FlagIcon value={caps} onChange={e => setCaps(!caps)}>
            <RxLetterCaseCapitalize />
          </FlagIcon>
          <FlagIcon value={full} onChange={e => setFull(!full)}>
            <TbLetterF />
          </FlagIcon>
          <FlagIcon value={regex} onChange={e => setRegex(!regex)}>
            <SiExpress />
          </FlagIcon>
        </div>
      </div>
  );
}

export default InputWithIcons;
