import { normalizeElementToCanvas } from "../utils/normalize";
import { elementRegistry } from "../registry/elementRegistry";

export function useElementActions(
  pages, 
  setPages, 
  activePageId, 
  canvasSize, 
  setActiveId, 
  setEditingId, 
  setDraftText,
  navigationConfig,
  setNavigationConfig
) {
  const activePage = pages.find(p => p.id === activePageId);
  const elements = activePage?.elements || [];

  function updateActivePageElements(updater) {
    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page;
      return { ...page, elements: updater(page.elements) };
    }));
  }

  function updateNavigation(patch) {
    setNavigationConfig(prev => ({ ...prev, ...patch }));
  }

  function addElement(type, customProps = {}) {
    const nextId = crypto.randomUUID();
    const config = elementRegistry[type];
    if (!config) return;

    const nextElement = normalizeElementToCanvas(
      {
        id: nextId,
        type,
        x: 56 + (elements.length * 18),
        y: 56 + (elements.length * 18),
        ...config.defaultSize,
        ...config.defaultProps,
        ...customProps,
      },
      canvasSize,
    );

    updateActivePageElements(prev => [...prev, nextElement]);
    setActiveId(nextId);
    
    if (type === "text" || type === "button") {
      setEditingId(nextId);
      setDraftText(nextElement.text || "");
    }
  }

  function updateElement(id, patch) {
    updateActivePageElements(prev => prev.map((element) => {
      if (element.id !== id) return element;
      return normalizeElementToCanvas({ ...element, ...patch }, canvasSize);
    }));
  }

  function deleteElement(id) {
    updateActivePageElements(prev => prev.filter((el) => el.id !== id));
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
        x: (element.x || 0) + 20,
        y: (element.y || 0) + 20,
      },
      canvasSize,
    );

    updateActivePageElements(prev => [...prev, duplicated]);
    setActiveId(newId);
  }

  function addPage(name = "New Page") {
    const newPageId = crypto.randomUUID();
    setPages(prev => [...prev, {
      id: newPageId,
      name,
      elements: []
    }]);
    return newPageId;
  }

  function deletePage(id) {
    if (pages.length <= 1) return;
    setPages(prev => prev.filter(p => p.id !== id));
  }

  function renamePage(id, newName) {
    setPages(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  }

  return {
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    addPage,
    deletePage,
    renamePage,
    updateNavigation
  };
}
