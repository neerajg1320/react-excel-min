import Button from "react-bootstrap/Button";
import {setServer} from "../state/tallyActions";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

const TallyServerAddress = ({onChange}) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const serverAddr = useSelector((state) => state.tally.serverAddr);
  const dispatch = useDispatch();

  const fillServerAddr = () => {
    setHost(serverAddr.host);
    setPort(serverAddr.port);
  }

  useEffect(() => {
    fillServerAddr();
  }, [serverAddr]);

  const handleCancelClick = (e) => {
    fillServerAddr();
    if (onChange) {
      onChange(false);
    }
  }

  const handleSaveClick = (e) => {
    dispatch(setServer({host, port}));
    if (onChange) {
      onChange(false);
    }
  }

  return (
      <div className={`settings-input-box`}>
        <div>
          <label>Server IP</label>
          <input
              className="form-control settings-input-field"
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
          />
        </div>
        <div>
          <label>Server Port</label>
          <input
              className="form-control settings-input-field"
              // className=""
              type="text"
              value={port}
              onChange={(e) => setPort(e.target.value)}
          />              </div>
        <div className="settings-buttons-container">
          <Button
              className="bg-transparent  btn-outline-danger"
              onClick={handleCancelClick}
              size="sm"
          >
            Cancel
          </Button>
          <Button
              className="btn-primary"
              onClick={handleSaveClick}
              size="sm"
          >
            Save
          </Button>
        </div>
      </div>
  );
}

export default TallyServerAddress;
