import Button from "react-bootstrap/Button";
import {useRef} from "react";

export const LoadFileButton = ({children, onChange, onClick:parentClick, ...props}) => {
  const fileRef = useRef();
  const debug = false;

  const handleClick = (e) => {
    console.log(`LoadFileButton:handleClick()`);
    if (parentClick) {
      parentClick(e);
    }
    fileRef.current.click();
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (debug) {
      console.log(`selectedFile:`, selectedFile);
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      const text = (e.target.result)

      if (debug) {
        console.log(text);
      }

      if (onChange) {
        onChange(text);
      }
    };
    reader.readAsText(selectedFile);

    e.target.value = null;
  }

  return (
      <>
        <Button onClick={handleClick} {...props}>
          <input ref={fileRef} type="file" onChange={handleFileChange} style={{display: "none"}} />
          {children}
        </Button>
      </>
  );
}