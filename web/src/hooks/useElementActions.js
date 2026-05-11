import { normalizeElementToCanvas } from "../utils/normalize";
import { elementRegistry } from "../registry/elementRegistry";

export function useElementActions(elements, setElements, canvasSize, setActiveId, setEditingId, setDraftText) {
  function addElement(type, customProps = {}) {
    const nextId = crypto.randomUUID();
    const config = elementRegistry[type];
    if (!config) return;

    const nextElement = normalizeElementToCanvas(
      {
        id: nextId,
        type,
        x: 56 + elements.length * 18,
        y: 56 + elements.length * 18,
        ...config.defaultSize,
        ...config.defaultProps,
        ...customProps,
      },
      canvasSize,
    );

    setElements((prev) => [...prev, nextElement]);
    setActiveId(nextId);
    
    if (type === "text" || type === "button") {
      setEditingId(nextId);
      setDraftText(nextElement.text || "");
    }
  }

  function updateElement(id, patch) {
    setElements((prev) =>
      prev.map((element) => {
        if (element.id !== id) return element;
        return normalizeElementToCanvas({ ...element, ...patch }, canvasSize);
      }),
    );
  }

  function deleteElement(id) {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setActiveId(null);
    setEditingId(null);
  }

  function duplicateElement(id) {
    const element = elements.find((el) => el.id === id);
    if (!element) return;

    const newId = crypto.randomUUID();
    const duplicated = normalizeElementToCanvas(
      {
        ...element,
        id: newId,
        x: element.x + 20,
        y: element.y + 20,
      },
      canvasSize,
    );

    setElements((prev) => [...prev, duplicated]);
    setActiveId(newId);
  }

  return {
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
  };
}
