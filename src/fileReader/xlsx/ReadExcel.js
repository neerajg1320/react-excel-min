import {useCallback, useRef, useState} from "react";
import Button from "react-bootstrap/Button";
import {excelToJson} from "./excel";
import {AiOutlineClose} from "react-icons/ai";
import './readExcel.css';
import {debug} from "../../components/config/debug";


const ReadExcel = ({onComplete}) => {
  if (debug.lifecycle) {
    console.log(`Rendering <ReadExcel>`);
  }

  const inputRef = useRef();
  const [files, setFiles] = useState([]);

  const onChange = useCallback((e) => {
    const files = [...e.target.files].map(file => file);
    setFiles(files);
  }, []);

  const clearState = useCallback(() => {
    setFiles([]);
    inputRef.current.value = null;
  }, []);

  const handleSubmitClick = async (e) => {
    if (files.length > 0) {
      clearState();

      const sheetJsons = await excelToJson(files[0], {headerRow:-1});
      sheetJsons.forEach(sheetJson => {
        if (onComplete) {
          onComplete({
            data:sheetJson.data
          });
        }
      })
    }
  };

  return (
    <div
        style={{
          height:"60vh", width:"100%",
          display:"flex", justifyContent:"center", alignItems:"center",
          border:"1px dashed transparent"
        }}
    >
      <div style={{
            height:"80%", width:"60%", border: "4px dashed gray",
            display: "flex", flexDirection:"column", justifyContent:"center", alignItems:"center"
          }}
      >
        <div style={{borderRadius:"4px", padding:"5px",
          display:"flex", flexDirection:"column", gap: "30px", justifyContent:"center", alignItems:"center"}}>

          <div
              className="file-input-control"
              style={{display:"flex", flexDirection:"row", alignItems:"center", position:"relative"}}
          >
            <form >
              <input
                  ref={inputRef}
                  className="form-control"
                  type="file"
                  name="upload"
                  id="upload"
                  // multiple
                  onChange={onChange}
              />
            </form>
            <div
                className={`icon ${files.length ? "active" : ""}`}
                style={{position:"absolute", right:"10px"}}
            >
              <AiOutlineClose
                  style={{backgroundColor: "white"}}
                  onClick={e => clearState()}
              />
            </div>
          </div>

          <div>
            <Button
                className="btn-primary"
                onClick={handleSubmitClick}
                disabled={!files.length}
            >
              Submit
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ReadExcel;
