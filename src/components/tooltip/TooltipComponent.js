import Tooltip from "react-bootstrap/Tooltip";
import {OverlayTrigger} from "react-bootstrap";
import React from "react";

const TooltipComponent = ({children, message, disabled}) => {
  const renderTooltip = (props) => {
    return (<Tooltip {...props}>{message}</Tooltip>);
  }

  if (disabled === true) {
    return <>{children}</>
  }

  return (
      <OverlayTrigger placement="top" overlay={renderTooltip}>
        {children}
      </OverlayTrigger>
  )
}

export default React.memo(TooltipComponent);
