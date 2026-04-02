import { useState, useEffect } from "react";
import Canvas from "../builder/Canvas";

export default function BuilderScreen() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [elementSize, setElementSize] = useState({ width: 0, height: 0 });

  const [elements, setElements] = useState([
    { x: 50, y: 50, text: "A" },
    { x: 120, y: 120, text: "B" },
  ]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setMouseDown(false);
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  function newElement() {
    setElements((prev) => [...prev, { x: 50, y: 50, text: "new text" }]);
  }

  function handleMouseMove(e) {
    if (!mouseDown || activeIndex === null) return;

    if (!isDragging) {
      setIsDragging(true);
    }

    const rect = e.currentTarget.getBoundingClientRect();

    setElements((prev) => {
      const updated = [...prev];
      const ele = updated[activeIndex];

      const newX = e.clientX - rect.left - offset.x;
      const newY = e.clientY - rect.top - offset.y;

      const maxX = rect.width - elementSize.width;
      const maxY = rect.height - elementSize.height;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      updated[activeIndex] = {
        ...ele,
        x: boundedX,
        y: boundedY,
      };

      return updated;
    });
  }

  return (
    <>
      <button onClick={newElement}>Add text</button>

      <Canvas
        elements={elements}
        setActiveIndex={setActiveIndex}
        setMouseDown={setMouseDown}
        setOffset={setOffset}
        setElementSize={setElementSize}
        onMouseMove={handleMouseMove}
        isDragging={isDragging}
        activeIndex={activeIndex}
      />
    </>
  );
}
