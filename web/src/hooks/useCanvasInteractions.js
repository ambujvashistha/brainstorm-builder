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
  const [guides, setGuides] = useState({ vertical: [], horizontal: [] });
  const activePage = pages.find(p => p.id === activePageId);
  const elements = activePage?.elements || [];

  const SNAP_THRESHOLD = 5;

  const getGridStep = () => ({
    x: canvasSize.width / (gridConfig?.cols || 12),
    y: canvasSize.height / (gridConfig?.rows || 20)
  });

  const snapToValue = (val, step) => snapToGrid ? Math.round(val / step) * step : val;

  function calculateSmartSnapping(x, y, width, height, draggingId) {
    const verticalGuides = [];
    const horizontalGuides = [];
    let snappedX = x;
    let snappedY = y;

    if (isPreviewMode) return { snappedX, snappedY, verticalGuides, horizontalGuides };

    const otherElements = elements.filter(el => el.id !== draggingId && !el.parentId);
    
    // Potential snap points for the dragging element
    const dragPoints = {
      x: [x, x + width / 2, x + width],
      y: [y, y + height / 2, y + height]
    };

    otherElements.forEach(el => {
      const elPoints = {
        x: [el.x, el.x + el.width / 2, el.x + el.width],
        y: [el.y, el.y + el.height / 2, el.y + el.height]
      };

      // Check vertical snapping
      dragPoints.x.forEach((dx, di) => {
        elPoints.x.forEach((ex, ei) => {
          if (Math.abs(dx - ex) < SNAP_THRESHOLD) {
            const diff = ex - dx;
            snappedX += diff;
            verticalGuides.push(ex);
          }
        });
      });

      // Check horizontal snapping
      dragPoints.y.forEach((dy, di) => {
        elPoints.y.forEach((ey, ei) => {
          if (Math.abs(dy - ey) < SNAP_THRESHOLD) {
            const diff = ey - dy;
            snappedY += diff;
            horizontalGuides.push(ey);
          }
        });
      });
    });

    return { 
      snappedX, 
      snappedY, 
      verticalGuides: [...new Set(verticalGuides)], 
      horizontalGuides: [...new Set(horizontalGuides)] 
    };
  }

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
        const element = elements.find(el => el.id === interaction.id);
        
        // Find potential container under pointer
        const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
        const containerNode = elementsAtPoint.find(node => {
          const type = node.getAttribute("data-type");
          const id = node.getAttribute("data-id");
          return ["container", "scroll-view", "card", "row", "column", "flat-list"].includes(type) && id !== interaction.id;
        });
        
        const newHoveredId = containerNode ? containerNode.getAttribute("data-id") : null;
        setHoveredContainerId(newHoveredId);

        let nextX = event.clientX - canvasRect.left - interaction.pointerOffset.x;
        let nextY = event.clientY - canvasRect.top - interaction.pointerOffset.y;

        // Apply Smart Snapping first, then Grid if enabled and no smart guides found
        const { snappedX, snappedY, verticalGuides, horizontalGuides } = calculateSmartSnapping(
          nextX, nextY, element.width, element.height, element.id
        );

        setGuides({ vertical: verticalGuides, horizontal: horizontalGuides });

        const finalX = verticalGuides.length > 0 ? snappedX : snapToValue(nextX, step.x);
        const finalY = horizontalGuides.length > 0 ? snappedY : snapToValue(nextY, step.y);

        updateActivePageElements((prev) =>
          prev.map((el) => {
            if (el.id !== interaction.id) return el;
            return { ...el, x: finalX, y: finalY };
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
              width: snapToValue(Math.max(20, nextWidth), step.x),
              height: snapToValue(Math.max(20, nextHeight), step.y),
            };
          }),
        );
      }
    };

    const handlePointerUp = (event) => {
      setGuides({ vertical: [], horizontal: [] });
      if (interaction?.type === "drag-element") {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const step = getGridStep();
        const element = elements.find(el => el.id === interaction.id);
        
        updateActivePageElements(prev => prev.map(el => {
          if (el.id === interaction.id) {
            const targetParentId = hoveredContainerId !== undefined ? hoveredContainerId : el.parentId;
            
            let rawX = event.clientX - canvasRect.left - interaction.pointerOffset.x;
            let rawY = event.clientY - canvasRect.top - interaction.pointerOffset.y;

            // Use the same snap logic for final drop
            const { snappedX, snappedY, verticalGuides, horizontalGuides } = calculateSmartSnapping(
              rawX, rawY, element.width, element.height, element.id
            );

            let finalX = verticalGuides.length > 0 ? snappedX : snapToValue(rawX, step.x);
            let finalY = horizontalGuides.length > 0 ? snappedY : snapToValue(rawY, step.y);

            if (targetParentId) {
              const parentNode = document.querySelector(`[data-id="${targetParentId}"]`);
              if (parentNode) {
                const parentRect = parentNode.getBoundingClientRect();
                // When dropping into a parent, we need to convert global canvas coords to local
                finalX = (event.clientX - parentRect.left - interaction.pointerOffset.x);
                finalY = (event.clientY - parentRect.top - interaction.pointerOffset.y);
                // Also apply grid snapping to local coords
                finalX = snapToValue(finalX, step.x);
                finalY = snapToValue(finalY, step.y);
              }
            }

            return { 
              ...el, 
              parentId: targetParentId,
              x: finalX,
              y: finalY
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
  }, [interaction, isPreviewMode, canvasRef, setPages, activePageId, hoveredContainerId, setInteraction, gridConfig, canvasSize, snapToGrid]);

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
    guides,
  };
}
