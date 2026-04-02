import { useEffect, useRef, useState } from "react";
import Canvas from "../builder/Canvas";

const MIN_CARD_WIDTH = 90;
const MIN_CARD_HEIGHT = 44;
const MIN_CANVAS_WIDTH = 420;
const MIN_CANVAS_HEIGHT = 320;

export default function BuilderScreen() {
  const canvasRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 760, height: 480 });
  const [interaction, setInteraction] = useState(null);
  const [elements, setElements] = useState([
    { x: 48, y: 48, width: 130, height: 52, text: "Pikachu" },
    { x: 210, y: 130, width: 140, height: 52, text: "Bulbasaur" },
  ]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!interaction || !canvasRef.current) {
        return;
      }

      const canvasRect = canvasRef.current.getBoundingClientRect();

      if (interaction.type === "drag-element") {
        setElements((prev) =>
          prev.map((element, index) => {
            if (index !== interaction.index) {
              return element;
            }

            const nextX =
              event.clientX - canvasRect.left - interaction.pointerOffset.x;
            const nextY =
              event.clientY - canvasRect.top - interaction.pointerOffset.y;

            return {
              ...element,
              x: Math.max(0, Math.min(nextX, canvasRect.width - element.width)),
              y: Math.max(
                0,
                Math.min(nextY, canvasRect.height - element.height),
              ),
            };
          }),
        );
      }

      if (interaction.type === "resize-element") {
        setElements((prev) =>
          prev.map((element, index) => {
            if (index !== interaction.index) {
              return element;
            }

            const nextWidth =
              interaction.startSize.width + (event.clientX - interaction.startPointer.x);
            const nextHeight =
              interaction.startSize.height + (event.clientY - interaction.startPointer.y);

            return {
              ...element,
              width: Math.max(
                MIN_CARD_WIDTH,
                Math.min(nextWidth, canvasRect.width - element.x),
              ),
              height: Math.max(
                MIN_CARD_HEIGHT,
                Math.min(nextHeight, canvasRect.height - element.y),
              ),
            };
          }),
        );
      }

      if (interaction.type === "resize-canvas") {
        const nextWidth =
          interaction.startSize.width + (event.clientX - interaction.startPointer.x);
        const nextHeight =
          interaction.startSize.height + (event.clientY - interaction.startPointer.y);

        setCanvasSize({
          width: Math.max(MIN_CANVAS_WIDTH, nextWidth),
          height: Math.max(MIN_CANVAS_HEIGHT, nextHeight),
        });
      }
    };

    const handlePointerUp = () => {
      setInteraction(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [interaction]);

  useEffect(() => {
    setElements((prev) =>
      prev.map((element) => {
        const width = Math.min(element.width, canvasSize.width - element.x);
        const height = Math.min(element.height, canvasSize.height - element.y);

        return {
          ...element,
          width: Math.max(MIN_CARD_WIDTH, width),
          height: Math.max(MIN_CARD_HEIGHT, height),
          x: Math.min(element.x, Math.max(0, canvasSize.width - width)),
          y: Math.min(element.y, Math.max(0, canvasSize.height - height)),
        };
      }),
    );
  }, [canvasSize]);

  function addElement() {
    const nextIndex = elements.length;

    setElements((prev) => [
      ...prev,
      {
        x: 56 + nextIndex * 18,
        y: 56 + nextIndex * 18,
        width: 150,
        height: 52,
        text: `Text ${nextIndex + 1}`,
      },
    ]);
    setActiveIndex(nextIndex);
  }

  function handleCanvasPointerDown(event) {
    if (event.target === event.currentTarget) {
      setActiveIndex(null);
    }
  }

  function handleElementPointerDown(event, index) {
    if (!canvasRef.current) {
      return;
    }

    event.preventDefault();

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const element = elements[index];

    setActiveIndex(index);
    setInteraction({
      type: "drag-element",
      index,
      pointerOffset: {
        x: event.clientX - canvasRect.left - element.x,
        y: event.clientY - canvasRect.top - element.y,
      },
    });
  }

  function handleElementResizePointerDown(event, index) {
    event.preventDefault();
    event.stopPropagation();

    const element = elements[index];

    setActiveIndex(index);
    setInteraction({
      type: "resize-element",
      index,
      startPointer: { x: event.clientX, y: event.clientY },
      startSize: { width: element.width, height: element.height },
    });
  }

  function handleCanvasResizePointerDown(event) {
    event.preventDefault();
    event.stopPropagation();

    setInteraction({
      type: "resize-canvas",
      startPointer: { x: event.clientX, y: event.clientY },
      startSize: canvasSize,
    });
  }

  return (
    <main className="builder-screen">
      <div className="builder-screen__header">
        <div>
          <h1>Brainstorm Builder</h1>
          <p>A small editor for arranging and resizing idea blocks.</p>
        </div>
        <button className="builder-screen__button" onClick={addElement}>
          Add text
        </button>
      </div>

      <Canvas
        canvasRef={canvasRef}
        canvasSize={canvasSize}
        elements={elements}
        activeIndex={activeIndex}
        interaction={interaction}
        onCanvasPointerDown={handleCanvasPointerDown}
        onElementPointerDown={handleElementPointerDown}
        onElementResizePointerDown={handleElementResizePointerDown}
        onCanvasResizePointerDown={handleCanvasResizePointerDown}
      />
    </main>
  );
}
