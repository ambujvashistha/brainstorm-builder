import { useState } from "react";
import Canvas from "../builder/Canvas";

export default function BuilderScreen() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState([
    { x: 50, y: 50, text: "A" },
    { x: 120, y: 120, text: "B" },
  ]);

  function newElement() {
    setElements((prev) => [
      ...prev,
      { x: 50, y: 50, text: "new text" },
    ]);
  }

  function handleMouseMove(e) {
    if (!isDragging || activeIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setElements((prev) =>
      prev.map((ele, index) => {
        if (index === activeIndex) {
          console.log("x",e.clientX,"y",e.clientY)
          const newX = e.clientX - rect.left - offset.x;
          const newY = e.clientY - rect.top - offset.y;

          const maxX = rect.width - 50;
          const maxY = rect.height - 20;

          const boundedX = Math.max(0, Math.min(newX, maxX));
          const boundedY = Math.max(0, Math.min(newY, maxY));

          return {
            ...ele,
            x: boundedX,
            y: boundedY,
          };
        }
        return ele;
      })
    );
  }

  function handleMouseUp() {
    setIsDragging(false);
    setActiveIndex(null);
  }

  return (
    <>
      <button onClick={newElement}>Add text</button>

      <Canvas
        elements={elements}
        setActiveIndex={setActiveIndex}
        setIsDragging={setIsDragging}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        setOffset={setOffset}
      />
    </>
  );
}
