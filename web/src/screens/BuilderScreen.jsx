import { useEffect, useRef, useState } from "react";
import Canvas from "../builder/Canvas";
import JsonPanel from "../builder/JsonPanel";

const MIN_CARD_WIDTH = 90;
const MIN_CARD_HEIGHT = 44;
const MIN_CANVAS_WIDTH = 420;
const MIN_CANVAS_HEIGHT = 320;

export default function BuilderScreen() {
  const canvasRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [canvasSize, setCanvasSize] = useState({ width: 760, height: 480 });
  const [interaction, setInteraction] = useState(null);

  const [elements, setElements] = useState([
    { type: "text", x: 48, y: 48, width: 130, height: 52, text: "Pikachu" },
    { type: "text", x: 210, y: 130, width: 140, height: 52, text: "Bulbasaur" },
  ]);

  function exportJSON() {
    const payload = {
      canvas: canvasSize,
      elements,
    };

    const json = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(json);
    alert("Layout JSON copied to clipboard");
  }

  function importJSON() {
    const input = prompt("Paste layout JSON");
    if (!input) return;

    try {
      const parsed = JSON.parse(input);

      if (parsed.canvas) {
        setCanvasSize(parsed.canvas);
      }

      if (parsed.elements) {
        setElements(parsed.elements);
      }

      setActiveIndex(null);
    } catch {
      alert("Invalid JSON");
    }
  }

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!interaction || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();

      if (interaction.type === "drag-element") {
        setElements((prev) =>
          prev.map((element, index) => {
            if (index !== interaction.index) return element;

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
            if (index !== interaction.index) return element;

            const nextWidth =
              interaction.startSize.width +
              (event.clientX - interaction.startPointer.x);

            const nextHeight =
              interaction.startSize.height +
              (event.clientY - interaction.startPointer.y);

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
          interaction.startSize.width +
          (event.clientX - interaction.startPointer.x);

        const nextHeight =
          interaction.startSize.height +
          (event.clientY - interaction.startPointer.y);

        setCanvasSize({
          width: Math.max(MIN_CANVAS_WIDTH, nextWidth),
          height: Math.max(MIN_CANVAS_HEIGHT, nextHeight),
        });
      }
    };

    const handlePointerUp = () => setInteraction(null);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeIndex === null) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        setElements((prev) => prev.filter((_, i) => i !== activeIndex));
        setActiveIndex(null);
        setEditingIndex(null);
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();

        if (activeIndex === null) return;

        const element = elements[activeIndex];

        setElements((prev) => [
          ...prev,
          {
            ...element,
            x: element.x + 20,
            y: element.y + 20,
          },
        ]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  function addText() {
    const nextIndex = elements.length;
    const nextText = `Text ${nextIndex + 1}`;

    setElements((prev) => [
      ...prev,
      {
        type: "text",
        x: 56 + nextIndex * 18,
        y: 56 + nextIndex * 18,
        width: 150,
        height: 52,
        text: nextText,
      },
    ]);

    setActiveIndex(nextIndex);
    setEditingIndex(nextIndex);
    setDraftText(nextText);
  }

  function addImage() {
    const nextIndex = elements.length;

    setElements((prev) => [
      ...prev,
      {
        type: "image",
        x: 100,
        y: 100,
        width: 200,
        height: 140,
        src: "https://via.placeholder.com/300x200",
      },
    ]);

    setActiveIndex(nextIndex);
  }

  function addContainer() {
    const nextIndex = elements.length;

    setElements((prev) => [
      ...prev,
      {
        type: "container",
        x: 120,
        y: 120,
        width: 240,
        height: 160,
      },
    ]);

    setActiveIndex(nextIndex);
  }

  function handleCanvasPointerDown(event) {
    if (event.target === event.currentTarget) {
      commitDraftText();
      setActiveIndex(null);
    }
  }

  function handleElementPointerDown(event, index) {
    if (!canvasRef.current) return;

    event.preventDefault();

    if (editingIndex !== null && editingIndex !== index) {
      commitDraftText();
    }

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

  function startEditing(index) {
    const element = elements[index];

    if (element.type === "text") {
      setActiveIndex(index);
      setEditingIndex(index);
      setDraftText(element.text);
      setInteraction(null);
    }

    if (element.type === "image") {
      const url = prompt("Enter image URL", element.src || "");
      if (!url) return;

      setElements((prev) =>
        prev.map((el, i) => (i === index ? { ...el, src: url } : el)),
      );
    }
  }

  function commitDraftText() {
    if (editingIndex === null) return;

    const nextText = draftText.trim() || "Untitled";

    setElements((prev) =>
      prev.map((element, index) =>
        index === editingIndex ? { ...element, text: nextText } : element,
      ),
    );

    setEditingIndex(null);
  }

  function cancelEditing() {
    setEditingIndex(null);
    setDraftText("");
  }

  function handleDraftKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraftText();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  return (
    <main className="builder-screen">
      <div className="builder-left">
        <div className="builder-screen__header">
          <div>
            <h1>Brainstorm Builder</h1>
            <p>A small editor for arranging and resizing idea blocks.</p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="builder-screen__button" onClick={addText}>
              Add Text
            </button>

            <button className="builder-screen__button" onClick={addImage}>
              Add Image
            </button>

            <button className="builder-screen__button" onClick={addContainer}>
              Add Container
            </button>

            <button className="builder-screen__button" onClick={exportJSON}>
              Export JSON
            </button>

            <button className="builder-screen__button" onClick={importJSON}>
              Load JSON
            </button>
          </div>
        </div>

        <Canvas
          canvasRef={canvasRef}
          canvasSize={canvasSize}
          elements={elements}
          activeIndex={activeIndex}
          editingIndex={editingIndex}
          draftText={draftText}
          interaction={interaction}
          onCanvasPointerDown={handleCanvasPointerDown}
          onElementPointerDown={handleElementPointerDown}
          onElementResizePointerDown={handleElementResizePointerDown}
          onCanvasResizePointerDown={handleCanvasResizePointerDown}
          onElementDoubleClick={startEditing}
          onDraftTextChange={setDraftText}
          onDraftTextCommit={commitDraftText}
          onDraftTextCancel={cancelEditing}
          onDraftTextKeyDown={handleDraftKeyDown}
        />
      </div>

      <div className="builder-right">
        <JsonPanel
          elements={elements}
          canvasSize={canvasSize}
          onImport={(data) => {
            if (data.canvas) setCanvasSize(data.canvas);
            if (data.elements) setElements(data.elements);
            setActiveIndex(null);
          }}
        />
      </div>
    </main>
  );
}
