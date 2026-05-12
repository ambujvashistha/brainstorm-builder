export default function TextElement({ 
  element, 
  isEditing, 
  draftText, 
  onDraftTextChange, 
  onDraftTextCommit, 
  onDraftTextKeyDown 
}) {
  const style = {
    fontSize: element.fontSize || 16,
    color: element.color || "#1D1D1F",
    fontWeight: element.fontWeight || "400",
    textAlign: element.textAlign || "left",
    lineHeight: element.lineHeight || 1.5,
    letterSpacing: element.letterSpacing || 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: element.verticalAlign === "bottom" ? "flex-end" : element.verticalAlign === "top" ? "flex-start" : "center",
    justifyContent: element.textAlign === "center" ? "center" : element.textAlign === "right" ? "flex-end" : "flex-start",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  };

  if (isEditing) {
    return (
      <textarea
        autoFocus
        className="canvas-input"
        style={{ 
          ...style, 
          background: "transparent", 
          border: "none", 
          outline: "none", 
          padding: 0,
          resize: "none",
          fontFamily: "inherit",
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
