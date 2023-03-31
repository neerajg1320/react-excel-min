import Button from "react-bootstrap/Button";

export const SaveFileButton = ({children, data, onClick:parentClick, ...props}) => {
  const handleClick = (e) => {
    console.log(`LoadFileButton:handleClick()`);
    if (parentClick) {
      parentClick(e);
    }

    // const fileData = JSON.stringify(signatureMap, null, 2);
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = "signatures.json";
    link.href = url;
    link.click();
  }

  return (
    <>
      <Button onClick={handleClick} {...props}>
        {children}
      </Button>
    </>
  );
}