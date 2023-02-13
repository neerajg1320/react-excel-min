import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";

function ConditionalTooltipButton({children, condition, message}) {
  return (
    <OverlayTrigger
        delay={{hide: 450, show: 300}}
        overlay={condition ? function (props) {
          return (
            <Tooltip {...props}>
              {message}
            </Tooltip>
          )
        } : function () {
          return (<span></span>)
        }
        }
        placement="top"
    >
      {children}
    </OverlayTrigger>
  );
}

export default ConditionalTooltipButton;