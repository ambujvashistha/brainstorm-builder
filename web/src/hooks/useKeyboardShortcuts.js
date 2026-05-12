import { useEffect } from "react";
import { normalizeElementToCanvas } from "../utils/normalize";

export function useKeyboardShortcuts({
  activeId,
  setActiveId,
  setEditingId,
  pages,
  setPages,
  activePageId,
  canvasSize,
  isPreviewMode,
}) {
  const activePage = pages.find(p => p.id === activePageId);
  const elements = activePage?.elements || [];

  function updateActivePageElements(updater) {
    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page;
      return { ...page, elements: updater(page.elements) };
    }));
  }

  useEffect(() => {
    if (isPreviewMode) return;

    const handleKeyDown = (e) => {
      if (activeId === null) return;

      // Avoid shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        updateActivePageElements((prev) => prev.filter((el) => el.id !== activeId));
        setActiveId(null);
        setEditingId(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();

        const activeElement = elements.find((el) => el.id === activeId);
        if (!activeElement) return;

        const newId = crypto.randomUUID();
        updateActivePageElements((prev) => [
          ...prev,
          normalizeElementToCanvas(
            {
              ...activeElement,
              id: newId,
              x: (activeElement.x || 0) + 20,
              y: (activeElement.y || 0) + 20,
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

          updateActivePageElements((prev) =>
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
  }, [activeId, canvasSize, elements, isPreviewMode, setPages, activePageId, setActiveId, setEditingId]);
}
