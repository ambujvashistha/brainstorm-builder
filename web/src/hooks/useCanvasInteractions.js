import { useEffect, useState } from "react";

export function useCanvasInteractions({
  canvasRef,
  elements,
  setElements,
  interaction,
  setInteraction,
  isPreviewMode,
  setActiveId,
  editingId,
  commitDraftText,
}) {
  const [hoveredContainerId, setHoveredContainerId] = useState(null);

  useEffect(() => {
    if (isPreviewMode) return;

    const handlePointerMove = (event) => {
      if (!interaction || !canvasRef.current) return;

      if (interaction.type === "drag-element") {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        // Find potential container under pointer
        const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);
        const containerNode = elementsAtPoint.find(node => {
          const type = node.getAttribute("data-type");
          const id = node.getAttribute("data-id");
          // Remove safe-area from auto-reparenting to keep elements at root by default
          return ["container", "scroll-view", "card", "row", "column"].includes(type) && id !== interaction.id;
        });
        
        const newHoveredId = containerNode ? containerNode.getAttribute("data-id") : null;
        setHoveredContainerId(newHoveredId);

        setElements((prev) =>
          prev.map((element) => {
            if (element.id !== interaction.id) return element;

            const nextX = event.clientX - canvasRect.left - interaction.pointerOffset.x;
            const nextY = event.clientY - canvasRect.top - interaction.pointerOffset.y;

            return {
              ...element,
              x: nextX,
              y: nextY,
            };
          }),
        );
      }

      if (interaction.type === "resize-element") {
        setElements((prev) =>
          prev.map((element) => {
            if (element.id !== interaction.id) return element;

            const nextWidth = interaction.startSize.width + (event.clientX - interaction.startPointer.x);
            const nextHeight = interaction.startSize.height + (event.clientY - interaction.startPointer.y);

            return {
              ...element,
              width: Math.max(20, nextWidth),
              height: Math.max(20, nextHeight),
            };
          }),
        );
      }
    };

    const handlePointerUp = (event) => {
      if (interaction?.type === "drag-element") {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
        setElements(prev => prev.map(el => {
          if (el.id === interaction.id) {
            // Use the hovered container detected during move
            const targetParentId = hoveredContainerId !== undefined ? hoveredContainerId : el.parentId;
            
            // Calculate final x, y
            let finalX = event.clientX - canvasRect.left - interaction.pointerOffset.x;
            let finalY = event.clientY - canvasRect.top - interaction.pointerOffset.y;

            // If dropping into a container, we might want to convert to relative coordinates.
            // But for now, let's keep it simple: if it's the root or Safe Area (via null), it stays absolute.
            // If it's a specific container, we might need more logic.
            // For now, let's just ensure it's absolute if dropped at root.
            
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
  }, [interaction, isPreviewMode, canvasRef, setElements, hoveredContainerId, setInteraction]);

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

    // Get current position on screen to calculate correct offset
    const elementRect = event.currentTarget.getBoundingClientRect();
    const currentX = elementRect.left - canvasRect.left;
    const currentY = elementRect.top - canvasRect.top;

    setInteraction({
      type: "drag-element",
      id,
      pointerOffset: {
        x: event.clientX - elementRect.left,
        y: event.clientY - elementRect.top,
      },
    });

    // Set initial hovered container
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
