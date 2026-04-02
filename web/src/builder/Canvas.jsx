export default function Canvas({
  elements,
  setActiveIndex,
  setMouseDown,
  setOffset,
  setElementSize,
  onMouseMove,
  isDragging,
  activeIndex,
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
    >
      {elements.map((ele, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: ele.x,
            top: ele.y,
            cursor: isDragging ? "grabbing" : "grab",
            border: index === activeIndex ? "1px solid rgb(255, 255, 255)" : "none",
            padding: "2px",
          }}
          onMouseDown={(e) => {
            const canvasRect =
              e.currentTarget.parentElement.getBoundingClientRect();
            const elRect = e.currentTarget.getBoundingClientRect();

            setActiveIndex(index);
            setMouseDown(true);

            setOffset({
              x: e.clientX - canvasRect.left - ele.x,
              y: e.clientY - canvasRect.top - ele.y,
            });

            setElementSize({
              width: elRect.width,
              height: elRect.height,
            });
          }}
        >
          {ele.text}
        </div>
      ))}
    </div>
  );
}
