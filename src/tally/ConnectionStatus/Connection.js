import './connection.css';
import React, {useState, useEffect} from "react";
import TallyServerAddress from "./TallyServerAddress";
import ExpandableButton from "../../components/expandableButton/ExpandableButton";
import {AiFillSetting} from "react-icons/ai";

function Connection({title, status}) {
  const [active, setActive] = useState(false);


  const handleSettingsClick = (e) => {
    setActive(!active);
  };


  return (
    <div className="connection-status-wrapper" style={{display:"flex", flexDirection:"column"}}>
      {/* Settings icon and container box */}
      <div style={{display: "flex", gap: "20px"}}>
        <div className="settings-container">
            <div className="settings-input-trigger">
              <span>Tally Server</span>

              <ExpandableButton
                  clickComponent={<AiFillSetting size={24} onClick={handleSettingsClick}/>}
                  expanded={active}
                  onChange={exp => setActive(exp)}
                  popupPosition={{right: "0px", bottom: "35px"}}
              >
                <TallyServerAddress onChange={exp => setActive(exp)}/>
              </ExpandableButton>
            </div>
          </div>
      </div>

      <div className="connection-status-box">
        <span>{title} connection is {status ? "On" : "Off"}</span>
        {status ?
            <span className="connection-indicator connection-active"></span> :
            <span className="connection-indicator connection-inactive"></span>
        }
      </div>
    </div>
  );
}

export default Connection;
