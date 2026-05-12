export default function TextInputElement({ element }) {
  const style = {
    fontSize: element.fontSize || 14,
    color: element.color || "#191c1d",
    backgroundColor: element.backgroundColor || "#f0f0f0",
    borderRadius: element.borderRadius || 8,
    padding: element.padding || 12,
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    border: "none",
    outline: "none",
    pointerEvents: "none", // Prevent interaction in builder unless specified
  };

  return (
    <input
      type="text"
      placeholder={element.placeholder || "Enter text..."}
      style={style}
      readOnly
    />
  );
}
