export default function Canvas({
  elements,
  setActiveIndex,
  setIsDragging,
  onMouseMove,
  onMouseUp,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "80vh",
        border: "2px solid #ccc",
        position: "relative",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {elements.map((ele, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: ele.x,
            top: ele.y,
            cursor: "grab",
          }}
          onMouseDown={() => {
            setActiveIndex(index);
            setIsDragging(true);
          }}
        >
          {ele.text}
        </div>
      ))}
    </div>
  );
}
