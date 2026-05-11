import { useEffect } from "react";
import { normalizeElementToCanvas } from "../utils/normalize";

export function useKeyboardShortcuts({
  activeId,
  setActiveId,
  setEditingId,
  elements,
  setElements,
  canvasSize,
  isPreviewMode,
}) {
  useEffect(() => {
    if (isPreviewMode) return;

    const handleKeyDown = (e) => {
      if (activeId === null) return;

      // Avoid shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        setElements((prev) => prev.filter((el) => el.id !== activeId));
        setActiveId(null);
        setEditingId(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();

        const activeElement = elements.find((el) => el.id === activeId);
        if (!activeElement) return;

        const newId = crypto.randomUUID();
        setElements((prev) => [
          ...prev,
          normalizeElementToCanvas(
            {
              ...activeElement,
              id: newId,
              x: activeElement.x + 20,
              y: activeElement.y + 20,
            },
            canvasSize,
          ),
        ]);
        setActiveId(newId);
      }

      if (activeId !== null) {
        const move = e.shiftKey ? 10 : 1;

        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();

          setElements((prev) =>
            prev.map((el) => {
              if (el.id !== activeId) return el;

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
  }, [activeId, canvasSize, elements, isPreviewMode, setElements, setActiveId, setEditingId]);
}
