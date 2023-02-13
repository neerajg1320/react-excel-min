import Form from 'react-bootstrap/Form';
import './style.css';
import {useEffect} from "react";

function SingleSelect({options, onChange, value}) {
  const handleChange = (e) => {
    // console.log('SingleSelect:handleChange', e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  }

  return (
      <div className="select-wrapper">
        <Form.Select aria-label="Default select example" onChange={handleChange} value={value} >
          {/*<option>Open this select menu</option>*/}
          {
            options && (
                options.map((opt, index) =>
                    <option
                        key={index}
                        value={opt.value}
                        // selected={defaultValue ? (opt.value == defaultValue ? true : false) : false}
                    >
                      {opt.label}
                    </option>
                )
              )
          }
        </Form.Select>
      </div>
  );
}

export default SingleSelect;