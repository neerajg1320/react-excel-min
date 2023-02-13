const FlagIcon = ({ children, value, onChange }) => {
  return (
      <span
          className={`${value ? "active" : ""}`}
          onClick={e => onChange(!value)}
          style={{cursor:"pointer", border:"1px dashed lightblue", fontSize: "0.9em"}}
      >
        {children}
      </span>
  );
}

export default FlagIcon;
