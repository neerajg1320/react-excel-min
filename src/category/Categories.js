import {useCallback, useMemo, useState} from "react";
import Button from "react-bootstrap/Button";
import ExpandableButton from "../components/expandableButton/ExpandableButton";
import Select from "react-select";
import {listToOptions} from "../utils/options";
import {useContext} from "react";
import AppContext from "../AppContext";


export const Categories = () => {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const {
    categories,
    onCategoriesChange: updateCategories,
    groups
  } = useContext(AppContext);

  const groupOptions = useMemo(() => {
    return listToOptions(groups.map(item => item.name), "Group")
  }, [groups]);

  const handleCancelClick = useCallback(() => {
    setExpanded(false);
  }, []);

  const handleSaveClick = useCallback((categories, name, group) => {
    console.log(`handleSaveClick: name=${name} group=${group}`);
    // updateCategories((prevState) => {
    //   return [...prevState, {name, group}];
    // });
    updateCategories([...categories, {name, group}]);
    setExpanded(false);
  }, []);

  return (
    <div>
      <h3>Categories</h3>
      <div style={{
        display: "flex", justifyContent: "flex-end"
      }}>
        <ExpandableButton
          title="Add"
          expanded={expanded}
          onChange={setExpanded}
          popupPosition={{top:"100%"}}
        >
          <div style={{
            display: "flex", flexDirection: "column", gap: "20px"
          }}>
            <h6>New Category</h6>
            <div style={{
              display:"flex", flexDirection:"row", justifyContent: "space-between", gap: "10px", alignItems: "flex-end"
            }}>
              <span>Name</span>
              <input type="text" value={name} onChange={(e) => {setName(e.target.value)}} />
            </div>
            <div style={{
              display:"flex", flexDirection:"row", justifyContent: "space-between", gap: "10px", alignItems: "flex-end"
            }}>
              <span>Parent</span>
              <Select
                options={groupOptions}
                value={groupOptions.filter(opt => opt.value === group)}
                onChange={opt => setGroup(opt.value)}
              />
            </div>
            <div style={{
              display: "flex", flexDirection: "row", justifyContent: "center", gap: "30px"
            }}>
              <Button
                  className="btn-outline-danger bg-transparent text-danger" size="sm"
                  onClick={handleCancelClick}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => { handleSaveClick(categories, name, group) }} >
                Save
              </Button>
            </div>
          </div>

        </ExpandableButton>
      </div>

      {categories && categories.map((item, index) => {
        return (
            <div key={index}>
              <h5>{item.name}</h5>
            </div>
        );
      })}
    </div>
  );
};