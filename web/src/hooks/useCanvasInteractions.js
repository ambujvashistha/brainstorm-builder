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

  const SNAP_THRESHOLD = 8;

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
    let foundV = false;
    let foundH = false;

    if (isPreviewMode) return { snappedX, snappedY, verticalGuides, horizontalGuides };

    const step = getGridStep();

    // Snap points for the dragging element: [left, center, right]
    const dragPointsX = [
      { val: x, type: 'start' },
      { val: x + width / 2, type: 'center' },
      { val: x + width, type: 'end' }
    ];
    // [top, center, bottom]
    const dragPointsY = [
      { val: y, type: 'start' },
      { val: y + height / 2, type: 'center' },
      { val: y + height, type: 'end' }
    ];

    // 1. Snapping to Canvas Boundaries & Center
    const canvasPointsX = [0, canvasSize.width / 2, canvasSize.width];
    const canvasPointsY = [0, canvasSize.height / 2, canvasSize.height];

    dragPointsX.forEach(dx => {
      canvasPointsX.forEach(cx => {
        if (Math.abs(dx.val - cx) < SNAP_THRESHOLD) {
          snappedX = dx.type === 'start' ? cx : (dx.type === 'center' ? cx - width / 2 : cx - width);
          verticalGuides.push(cx);
          foundV = true;
        }
      });
    });

    dragPointsY.forEach(dy => {
      canvasPointsY.forEach(cy => {
        if (Math.abs(dy.val - cy) < SNAP_THRESHOLD) {
          snappedY = dy.type === 'start' ? cy : (dy.type === 'center' ? cy - height / 2 : cy - height);
          horizontalGuides.push(cy);
          foundH = true;
        }
      });
    });

    // 2. Snapping to Other Elements
    const otherElements = elements.filter(el => el.id !== draggingId && !el.parentId);
    
    otherElements.forEach(el => {
      const elPointsX = [el.x, el.x + el.width / 2, el.x + el.width];
      const elPointsY = [el.y, el.y + el.height / 2, el.y + el.height];

      dragPointsX.forEach(dx => {
        elPointsX.forEach(ex => {
          if (!foundV && Math.abs(dx.val - ex) < SNAP_THRESHOLD) {
            snappedX = dx.type === 'start' ? ex : (dx.type === 'center' ? ex - width / 2 : ex - width);
            verticalGuides.push(ex);
            foundV = true;
          }
        });
      });

      dragPointsY.forEach(dy => {
        elPointsY.forEach(ey => {
          if (!foundH && Math.abs(dy.val - ey) < SNAP_THRESHOLD) {
            snappedY = dy.type === 'start' ? ey : (dy.type === 'center' ? ey - height / 2 : ey - height);
            horizontalGuides.push(ey);
            foundH = true;
          }
        });
      });
    });

    // 3. Grid Snapping (only if no smart guide found for that axis)
    if (!foundV && snapToGrid) {
      snappedX = Math.round(snappedX / step.x) * step.x;
    }
    if (!foundH && snapToGrid) {
      snappedY = Math.round(snappedY / step.y) * step.y;
    }

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

        const { snappedX, snappedY, verticalGuides, horizontalGuides } = calculateSmartSnapping(
          nextX, nextY, element.width, element.height, element.id
        );

        setGuides({ vertical: verticalGuides, horizontal: horizontalGuides });

        updateActivePageElements((prev) =>
          prev.map((el) => {
            if (el.id !== interaction.id) return el;
            return { ...el, x: snappedX, y: snappedY };
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
        const element = elements.find(el => el.id === interaction.id);
        
        updateActivePageElements(prev => prev.map(el => {
          if (el.id === interaction.id) {
            const targetParentId = hoveredContainerId !== undefined ? hoveredContainerId : el.parentId;
            
            let rawX = event.clientX - canvasRect.left - interaction.pointerOffset.x;
            let rawY = event.clientY - canvasRect.top - interaction.pointerOffset.y;

            const { snappedX, snappedY } = calculateSmartSnapping(
              rawX, rawY, element.width, element.height, element.id
            );

            let finalX = snappedX;
            let finalY = snappedY;

            if (targetParentId) {
              const parentNode = document.querySelector(`[data-id="${targetParentId}"]`);
              if (parentNode) {
                const parentRect = parentNode.getBoundingClientRect();
                finalX = snapToValue(event.clientX - parentRect.left - interaction.pointerOffset.x, step.x);
                finalY = snapToValue(event.clientY - parentRect.top - interaction.pointerOffset.y, step.y);
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
