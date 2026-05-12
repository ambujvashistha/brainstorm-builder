export default function ButtonElement({ 
  element, 
  isEditing, 
  draftText, 
  onDraftTextChange, 
  onDraftTextCommit, 
  onDraftTextKeyDown 
}) {
  const style = {
    backgroundColor: element.backgroundColor || "#007AFF",
    color: element.color || "#FFFFFF",
    borderRadius: element.borderRadius || 12,
    fontSize: element.fontSize || 16,
    fontWeight: element.fontWeight || "600",
    padding: element.padding || 12,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    boxShadow: element.shadow || "none",
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        className="canvas-input"
        style={{ ...style, background: element.backgroundColor, outline: "none" }}
        value={draftText}
        onChange={(e) => onDraftTextChange(e.target.value)}
        onBlur={onDraftTextCommit}
        onKeyDown={onDraftTextKeyDown}
      />
    );
  }

  return (
    <div style={style}>
      {element.text}
    </div>
  );
}
