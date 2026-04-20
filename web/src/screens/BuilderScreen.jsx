import { useEffect, useRef, useState } from "react";
import Canvas from "../builder/Canvas";
import EditPanel from "../builder/EditPanel";
import JsonPanel from "../builder/JsonPanel";

const MIN_CARD_WIDTH = 90;
const MIN_CARD_HEIGHT = 44;
const MIN_CANVAS_WIDTH = 420;
const MIN_CANVAS_HEIGHT = 320;

function normalizeElementToCanvas(element, canvas) {
  const maxWidth = Math.max(MIN_CARD_WIDTH, canvas.width - element.x);
  const maxHeight = Math.max(MIN_CARD_HEIGHT, canvas.height - element.y);
  const width = Math.max(MIN_CARD_WIDTH, Math.min(element.width, maxWidth));
  const height = Math.max(MIN_CARD_HEIGHT, Math.min(element.height, maxHeight));

  return {
    ...element,
    width,
    height,
    x: Math.max(0, Math.min(element.x, canvas.width - width)),
    y: Math.max(0, Math.min(element.y, canvas.height - height)),
  };
}

function normalizeElements(elements, canvas) {
  return elements.map((element) => normalizeElementToCanvas(element, canvas));
}

export default function BuilderScreen() {
  const canvasRef = useRef(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [canvasSize, setCanvasSize] = useState({ width: 760, height: 480 });
  const [interaction, setInteraction] = useState(null);

  const [elements, setElements] = useState([
    {
      type: "text",
      x: 48,
      y: 48,
      width: 130,
      height: 52,
      text: "Pikachu",
      fontSize: 16,
      color: "#191c1d",
    },
    {
      type: "text",
      x: 210,
      y: 130,
      width: 140,
      height: 52,
      text: "Bulbasaur",
      fontSize: 16,
      color: "#191c1d",
    },
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
    if (isPreviewMode) return;

    const handlePointerMove = (event) => {
      if (!interaction || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const bounds = { width: canvasRect.width, height: canvasRect.height };

      if (interaction.type === "drag-element") {
        setElements((prev) =>
          prev.map((element, index) => {
            if (index !== interaction.index) return element;

            const activeNode = canvasRef.current?.querySelector(
              `[data-id="${interaction.index}"]`,
            );
            const activeRect = activeNode?.getBoundingClientRect();
            const measuredWidth = activeRect?.width ?? element.width;
            const measuredHeight = activeRect?.height ?? element.height;

            const nextX =
              event.clientX - canvasRect.left - interaction.pointerOffset.x;

            const nextY =
              event.clientY - canvasRect.top - interaction.pointerOffset.y;

            return {
              ...element,
              x: Math.max(
                0,
                Math.min(
                  nextX,
                  bounds.width - measuredWidth,
                ),
              ),
              y: Math.max(
                0,
                Math.min(
                  nextY,
                  bounds.height - measuredHeight,
                ),
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
                Math.min(nextWidth, bounds.width - element.x),
              ),
              height: Math.max(
                MIN_CARD_HEIGHT,
                Math.min(nextHeight, bounds.height - element.y),
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

        const nextCanvas = {
          width: Math.max(MIN_CANVAS_WIDTH, nextWidth),
          height: Math.max(MIN_CANVAS_HEIGHT, nextHeight),
        };

        setCanvasSize(nextCanvas);
        setElements((prev) => normalizeElements(prev, nextCanvas));
      }
    };

    const handlePointerUp = () => setInteraction(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [interaction, isPreviewMode]);

  useEffect(() => {
    if (isPreviewMode) return;

    const handleKeyDown = (e) => {
      if (activeIndex === null) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        setElements((prev) => prev.filter((_, i) => i !== activeIndex));
        setActiveIndex(null);
        setEditingIndex(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();

        setElements((prev) => [
          ...prev,
          normalizeElementToCanvas(
            {
              ...prev[activeIndex],
              x: prev[activeIndex].x + 20,
              y: prev[activeIndex].y + 20,
            },
            canvasSize,
          ),
        ]);
      }

      if (activeIndex !== null) {
        const move = e.shiftKey ? 10 : 1;

        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();

          setElements((prev) =>
            prev.map((el, i) => {
              if (i !== activeIndex) return el;

              if (e.key === "ArrowUp") {
                return normalizeElementToCanvas({ ...el, y: el.y - move }, canvasSize);
              }
              if (e.key === "ArrowDown") {
                return normalizeElementToCanvas({ ...el, y: el.y + move }, canvasSize);
              }
              if (e.key === "ArrowLeft") {
                return normalizeElementToCanvas({ ...el, x: el.x - move }, canvasSize);
              }
              if (e.key === "ArrowRight") {
                return normalizeElementToCanvas({ ...el, x: el.x + move }, canvasSize);
              }

              return el;
            }),
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, canvasSize, isPreviewMode]);

  useEffect(() => {
    if (isPreviewMode) return;

    const handleOutsidePointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (
        target.closest(".canvas__item") ||
        target.closest(".edit-panel") ||
        target.closest(".canvas-toolbar")
      ) {
        return;
      }

      setActiveIndex(null);
      setEditingIndex(null);
    };

    window.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => window.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [isPreviewMode]);

  useEffect(() => {
    if (!isPreviewMode) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsPreviewMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewMode]);

  function addText() {
    const nextIndex = elements.length;
    const nextText = `Text ${nextIndex + 1}`;

    const nextElement = normalizeElementToCanvas(
      {
        type: "text",
        x: 56 + nextIndex * 18,
        y: 56 + nextIndex * 18,
        width: 150,
        height: 52,
        text: nextText,
        fontSize: 16,
        color: "#191c1d",
      },
      canvasSize,
    );

    setElements((prev) => [
      ...prev,
      nextElement,
    ]);

    setActiveIndex(nextIndex);
    setEditingIndex(nextIndex);
    setDraftText(nextText);
  }

  function addImage() {
    const nextIndex = elements.length;

    const nextElement = normalizeElementToCanvas(
      {
        type: "image",
        x: 100,
        y: 100,
        width: 200,
        height: 140,
        src: "https://via.placeholder.com/300x200",
      },
      canvasSize,
    );

    setElements((prev) => [
      ...prev,
      nextElement,
    ]);

    setActiveIndex(nextIndex);
  }

  function addContainer() {
    const nextIndex = elements.length;

    const nextElement = normalizeElementToCanvas(
      {
        type: "container",
        x: 120,
        y: 120,
        width: 240,
        height: 160,
        backgroundColor: "#e7e8e9",
        borderRadius: 12,
      },
      canvasSize,
    );

    setElements((prev) => [
      ...prev,
      nextElement,
    ]);

    setActiveIndex(nextIndex);
  }

  function handleCanvasPointerDown(event) {
    if (isPreviewMode) return;

    if (event.target === event.currentTarget) {
      commitDraftText();
      setActiveIndex(null);
    }
  }

  function handleElementPointerDown(event, index) {
    if (isPreviewMode) return;
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
    if (isPreviewMode) return;
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
    if (isPreviewMode) return;
    event.preventDefault();
    event.stopPropagation();

    setInteraction({
      type: "resize-canvas",
      startPointer: { x: event.clientX, y: event.clientY },
      startSize: canvasSize,
    });
  }

  function startEditing(index) {
    if (isPreviewMode) return;
    const element = elements[index];

    if (element.type === "text") {
      setActiveIndex(index);
      setEditingIndex(index);
      setDraftText(element.text);
      setInteraction(null);
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

  function updateElementAt(index, patch) {
    setElements((prev) =>
      prev.map((element, i) => {
        if (i !== index) return element;
        return normalizeElementToCanvas({ ...element, ...patch }, canvasSize);
      }),
    );
  }

  function updateSelectedElement(patch) {
    if (activeIndex === null) return;
    updateElementAt(activeIndex, patch);
  }

  function updateSelectedNumeric(field, value) {
    if (activeIndex === null) return;

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;

    updateSelectedElement({ [field]: parsed });
  }

  function deleteSelectedElement() {
    if (activeIndex === null) return;
    setElements((prev) => prev.filter((_, index) => index !== activeIndex));
    setActiveIndex(null);
    setEditingIndex(null);
  }

  function togglePreviewMode() {
    setInteraction(null);
    setEditingIndex(null);
    setActiveIndex(null);
    setIsPreviewMode((prev) => !prev);
  }

  const selectedElement = activeIndex !== null ? elements[activeIndex] : null;

  const canvasProps = {
    canvasRef,
    canvasSize,
    elements,
    activeIndex,
    editingIndex,
    draftText,
    interaction,
    onCanvasPointerDown: handleCanvasPointerDown,
    onElementPointerDown: handleElementPointerDown,
    onElementResizePointerDown: handleElementResizePointerDown,
    onCanvasResizePointerDown: handleCanvasResizePointerDown,
    onElementDoubleClick: startEditing,
    onDraftTextChange: setDraftText,
    onDraftTextCommit: commitDraftText,
    onDraftTextKeyDown: handleDraftKeyDown,
    isPreviewMode,
    toolbar: (
      <>
        <button className="canvas-toolbar__button canvas-toolbar__button--primary" onClick={addText}>
          Add Text
        </button>
        <button className="canvas-toolbar__button canvas-toolbar__button--secondary" onClick={addImage}>
          Add Image
        </button>
        <button className="canvas-toolbar__button canvas-toolbar__button--secondary" onClick={addContainer}>
          Add Container
        </button>
      </>
    ),
  };

  return (
    <main className={`builder-screen ${isPreviewMode ? "builder-screen--preview" : ""}`}>
      {!isPreviewMode && selectedElement && (
        <EditPanel
          element={selectedElement}
          onTextChange={(text) => {
            updateSelectedElement({ text });
            if (editingIndex === activeIndex) {
              setDraftText(text);
            }
          }}
          onFontSizeChange={(fontSize) => updateSelectedNumeric("fontSize", fontSize)}
          onTextColorChange={(color) => updateSelectedElement({ color })}
          onImageUrlChange={(src) => updateSelectedElement({ src })}
          onContainerBgChange={(backgroundColor) =>
            updateSelectedElement({ backgroundColor })
          }
          onContainerRadiusChange={(borderRadius) =>
            updateSelectedNumeric("borderRadius", borderRadius)
          }
          onWidthChange={(width) => updateSelectedNumeric("width", width)}
          onHeightChange={(height) => updateSelectedNumeric("height", height)}
          onXChange={(x) => updateSelectedNumeric("x", x)}
          onYChange={(y) => updateSelectedNumeric("y", y)}
          onDelete={deleteSelectedElement}
        />
      )}

      <section className={`builder-left ${isPreviewMode ? "builder-left--preview" : ""}`}>
        {!isPreviewMode && (
          <div className="builder-screen__header">
            <div>
              <h1>Brainstorm Builder</h1>
              <p>A small editor for arranging and resizing idea blocks.</p>
            </div>

            <div className="builder-screen__actions">
              <button
                className="builder-screen__button builder-screen__button--secondary"
                onClick={exportJSON}
              >
                Export JSON
              </button>
              <button
                className="builder-screen__button builder-screen__button--secondary"
                onClick={importJSON}
              >
                Load JSON
              </button>
              <button
                className={`builder-screen__button builder-screen__button--toggle ${
                  isPreviewMode ? "is-active" : ""
                }`}
                onClick={togglePreviewMode}
              >
                {isPreviewMode ? "Edit" : "Preview"}
              </button>
            </div>
          </div>
        )}

        {isPreviewMode ? (
          <div className="preview-wrapper">
            <div className="preview-header">
              <button
                className="preview-back-button"
                onClick={togglePreviewMode}
              >
                Back
              </button>
              <h2>Mobile Preview</h2>
            </div>
            <div className="phone-frame">
              <Canvas {...canvasProps} />
            </div>
          </div>
        ) : (
          <Canvas {...canvasProps} />
        )}
      </section>

      {!isPreviewMode && (
        <aside className="builder-right">
          <JsonPanel
            elements={elements}
            canvasSize={canvasSize}
            onImport={(data) => {
              const nextCanvas = data.canvas
                ? {
                    width: Math.max(MIN_CANVAS_WIDTH, Number(data.canvas.width) || MIN_CANVAS_WIDTH),
                    height: Math.max(MIN_CANVAS_HEIGHT, Number(data.canvas.height) || MIN_CANVAS_HEIGHT),
                  }
                : canvasSize;

              if (data.canvas) setCanvasSize(nextCanvas);
              if (data.elements) setElements(normalizeElements(data.elements, nextCanvas));
              setActiveIndex(null);
            }}
          />
        </aside>
      )}
    </main>
  );
}
