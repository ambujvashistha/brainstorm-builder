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
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    textAlign: "center",
    overflow: "hidden",
  };

  if (isEditing) {
    return (
      <textarea
        autoFocus
        className="canvas-input"
        style={{ 
          ...style, 
          background: element.backgroundColor, 
          outline: "none",
          resize: "none",
          fontFamily: "inherit",
          border: "none",
          padding: element.padding || 12,
        }}
        value={draftText}
        onChange={(e) => onDraftTextChange(e.target.value)}
        onBlur={onDraftTextCommit}
        onKeyDown={onDraftTextKeyDown}
      />
    );
  }

  return (
    <div style={style}>
      <span style={{ width: "100%" }}>
        {element.text}
      </span>
    </div>
  );
}
