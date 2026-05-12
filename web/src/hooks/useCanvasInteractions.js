import { useEffect, useState } from "react";

export function useCanvasInteractions({
  canvasRef,
  pages,
  setPages,
  activePageId,
  interaction,
  setInteraction,
  isPreviewMode,
  setActiveId,
  editingId,
  commitDraftText,
  snapToGrid,
  gridConfig,
  canvasSize,
  onToggleDrawer,
}) {
  const [hoveredContainerId, setHoveredContainerId] = useState(null);
  const activePage = pages.find(p => p.id === activePageId);
  const elements = activePage?.elements || [];

  const getGridStep = () => ({
    x: canvasSize.width / (gridConfig?.cols || 12),
    y: canvasSize.height / (gridConfig?.rows || 20)
  });

  const snap = (val, step) => snapToGrid ? Math.round(val / step) * step : val;

  function updateActivePageElements(updater) {
    setPages(prev => prev.map(page => {
      if (page.id !== activePageId) return page;
      return { ...page, elements: updater(page.elements) };
    }));
  }

  useEffect(() => {
    if (isPreviewMode) return;

    const handlePointerMove = (event) => {
      if (!interaction || !canvasRef.current) return;
      const step = getGridStep();

      if (interaction.type === "drag-element") {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        // Find potential container under pointer
        const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
        const containerNode = elementsAtPoint.find(node => {
          const type = node.getAttribute("data-type");
          const id = node.getAttribute("data-id");
          return ["container", "scroll-view", "card", "row", "column", "flat-list"].includes(type) && id !== interaction.id;
        });
        
        const newHoveredId = containerNode ? containerNode.getAttribute("data-id") : null;
        setHoveredContainerId(newHoveredId);

        updateActivePageElements((prev) =>
          prev.map((element) => {
            if (element.id !== interaction.id) return element;

            let nextX = event.clientX - canvasRect.left - interaction.pointerOffset.x;
            let nextY = event.clientY - canvasRect.top - interaction.pointerOffset.y;

            return {
              ...element,
              x: snap(nextX, step.x),
              y: snap(nextY, step.y),
            };
          }),
        );
      }

      if (interaction.type === "resize-element") {
        updateActivePageElements((prev) =>
          prev.map((element) => {
            if (element.id !== interaction.id) return element;

            const nextWidth = interaction.startSize.width + (event.clientX - interaction.startPointer.x);
            const nextHeight = interaction.startSize.height + (event.clientY - interaction.startPointer.y);

            return {
              ...element,
              width: snap(Math.max(20, nextWidth), step.x),
              height: snap(Math.max(20, nextHeight), step.y),
            };
          }),
        );
      }
    };

    const handlePointerUp = (event) => {
      if (interaction?.type === "drag-element") {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const step = getGridStep();
        
        updateActivePageElements(prev => prev.map(el => {
          if (el.id === interaction.id) {
            const targetParentId = hoveredContainerId !== undefined ? hoveredContainerId : el.parentId;
            
            let finalX = event.clientX - canvasRect.left - interaction.pointerOffset.x;
            let finalY = event.clientY - canvasRect.top - interaction.pointerOffset.y;

            if (targetParentId) {
              const parentNode = document.querySelector(`[data-id="${targetParentId}"]`);
              if (parentNode) {
                const parentRect = parentNode.getBoundingClientRect();
                finalX = event.clientX - parentRect.left - interaction.pointerOffset.x;
                finalY = event.clientY - parentRect.top - interaction.pointerOffset.y;
              }
            }

            return { 
              ...el, 
              parentId: targetParentId,
              x: snap(finalX, step.x),
              y: snap(finalY, step.y)
            };
          }
          return el;
        }));
      }
      setInteraction(null);
      setHoveredContainerId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [interaction, isPreviewMode, canvasRef, setPages, activePageId, hoveredContainerId, setInteraction]);

  function handleCanvasPointerDown(event) {
    if (isPreviewMode) return;
    if (event.target === event.currentTarget) {
      commitDraftText();
      setActiveId(null);
    }
  }

  function handleElementPointerDown(event, id) {
    if (isPreviewMode) return;
    if (!canvasRef.current) return;

    event.preventDefault();
    if (editingId !== null && editingId !== id) commitDraftText();

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const element = elements.find((el) => el.id === id);
    if (!element) return;

    setActiveId(id);

    const elementRect = event.currentTarget.getBoundingClientRect();
    setInteraction({
      type: "drag-element",
      id,
      pointerOffset: {
        x: event.clientX - elementRect.left,
        y: event.clientY - elementRect.top,
      },
    });

    setHoveredContainerId(element.parentId);
  }

  function handleElementResizePointerDown(event, id) {
    if (isPreviewMode) return;
    event.preventDefault();
    event.stopPropagation();

    const element = elements.find((el) => el.id === id);
    if (!element) return;

    setActiveId(id);

    setInteraction({
      type: "resize-element",
      id,
      startPointer: { x: event.clientX, y: event.clientY },
      startSize: { width: element.width, height: element.height },
    });
  }

  return {
    handleCanvasPointerDown,
    handleElementPointerDown,
    handleElementResizePointerDown,
    hoveredContainerId,
  };
}
