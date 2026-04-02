export default function Canvas({
  elements,
  setActiveIndex,
  setIsDragging,
  onMouseMove,
  onMouseUp,
  setOffset
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
          onMouseDown={(e) => {
            const rect = e.currentTarget.parentElement.getBoundingClientRect();

            setActiveIndex(index);
            setIsDragging(true);

            setOffset({
              x: e.clientX - rect.left - ele.x,
              y: e.clientY - rect.top - ele.y,
            });
          }}
        >
          {ele.text}
        </div>
      ))}
    </div>
  );
}
