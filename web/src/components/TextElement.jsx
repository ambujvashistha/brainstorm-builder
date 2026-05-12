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
    alignItems: "center",
    justifyContent: element.textAlign === "center" ? "center" : element.textAlign === "right" ? "flex-end" : "flex-start",
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        className="canvas-input"
        style={{ ...style, background: "transparent", border: "none", outline: "none", padding: 0 }}
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
