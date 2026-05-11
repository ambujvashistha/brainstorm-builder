import TextElement from "../elements/TextElement";
import ImageElement from "../elements/ImageElement";
import ContainerElement from "../elements/ContainerElement";
import ButtonElement from "../elements/ButtonElement";
import { ELEMENT_TYPES } from "../registry/elementRegistry";

const ELEMENT_COMPONENTS = {
  [ELEMENT_TYPES.TEXT]: TextElement,
  [ELEMENT_TYPES.IMAGE]: ImageElement,
  [ELEMENT_TYPES.CONTAINER]: ContainerElement,
  [ELEMENT_TYPES.SAFE_AREA]: ContainerElement,
  [ELEMENT_TYPES.SCROLL_VIEW]: ContainerElement,
  [ELEMENT_TYPES.TEXT_INPUT]: TextElement,
  [ELEMENT_TYPES.BUTTON]: ButtonElement,
  [ELEMENT_TYPES.CARD]: ContainerElement,
  [ELEMENT_TYPES.ROW]: ContainerElement,
  [ELEMENT_TYPES.COLUMN]: ContainerElement,
};

export default function Canvas({
  canvasRef,
  elements,
  activeId,
  editingId,
  draftText,
  interaction,
  hoveredContainerId,
  onCanvasPointerDown,
  onElementPointerDown,
  onElementResizePointerDown,
  onElementDoubleClick,
  onDraftTextChange,
  onDraftTextCommit,
  onDraftTextKeyDown,
  isPreviewMode,
}) {
  const draggingElement = interaction?.type === "drag-element" ? elements.find(el => el.id === interaction.id) : null;

  const renderElement = (element, forceRoot = false) => {
    const isDraggingActual = interaction?.type === "drag-element" && interaction.id === element.id;
    
    // If it's the element being dragged, don't render it in its original place
    if (isDraggingActual && !forceRoot) return null;

    const isActive = element.id === activeId;
    const isEditing = element.id === editingId;
    const isResizing = interaction?.type === "resize-element" && interaction.id === element.id;
    const isHovered = hoveredContainerId === element.id;

    const ElementComponent = ELEMENT_COMPONENTS[element.type];
    const children = elements.filter((el) => el.parentId === element.id);

    const parent = elements.find(el => el.id === element.parentId);
    const isFlowParent = parent && (parent.type === "row" || parent.type === "column");
    const isAbsolute = !element.parentId || forceRoot || !isFlowParent;

    const style = {
      ...(isAbsolute ? { position: "absolute", left: element.x, top: element.y } : { position: "relative" }),
      width: element.width,
      height: element.height,
      zIndex: isActive || forceRoot ? 100 : 1,
      opacity: isDraggingActual ? 0.6 : 1,
      pointerEvents: isPreviewMode && element.type !== ELEMENT_TYPES.BUTTON ? "none" : (isDraggingActual && !forceRoot ? "none" : "auto"),
    };

    return (
      <div
        key={element.id}
        data-id={element.id}
        data-type={element.type}
        className={`canvas-item ${isActive ? "canvas-item--selected" : ""} ${isDraggingActual ? "is-dragging" : ""} ${isResizing ? "is-resizing" : ""} ${isHovered ? "element-container--hovered" : ""}`}
        style={style}
        onPointerDown={(event) => {
          if (isPreviewMode) return;
          event.stopPropagation();
          onElementPointerDown(event, element.id);
        }}
        onDoubleClick={(event) => {
          if (isPreviewMode) return;
          event.stopPropagation();
          onElementDoubleClick(element.id);
        }}
      >
        {ElementComponent && (
          <ElementComponent
            element={element}
            isEditing={isEditing}
            draftText={draftText}
            onDraftTextChange={onDraftTextChange}
            onDraftTextCommit={onDraftTextCommit}
            onDraftTextKeyDown={onDraftTextKeyDown}
          >
            {children.map(child => renderElement(child))}
          </ElementComponent>
        )}

        {!isPreviewMode && isActive && (
          <div
            className="resize-handle"
            onPointerDown={(event) => {
              event.stopPropagation();
              onElementResizePointerDown(event, element.id);
            }}
          />
        )}
      </div>
    );
  };

  const rootElements = elements.filter((el) => !el.parentId);

  return (
    <div
      ref={canvasRef}
      className="canvas-root"
      style={{
        flex: 1,
        width: "100%",
        position: "relative",
        background: "#fff",
        overflow: "hidden",
      }}
      onPointerDown={onCanvasPointerDown}
    >
      {rootElements.map((el) => renderElement(el))}
      {draggingElement && renderElement(draggingElement, true)}
    </div>
  );
}
