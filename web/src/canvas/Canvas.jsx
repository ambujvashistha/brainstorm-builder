import TextElement from "../components/TextElement";
import ImageElement from "../components/ImageElement";
import ContainerElement from "../components/ContainerElement";
import ButtonElement from "../components/ButtonElement";
import TextInputElement from "../components/TextInputElement";
import CardElement from "../components/CardElement";
import { ELEMENT_TYPES } from "../registry/elementRegistry";

const ELEMENT_COMPONENTS = {
  [ELEMENT_TYPES.TEXT]: TextElement,
  [ELEMENT_TYPES.IMAGE]: ImageElement,
  [ELEMENT_TYPES.CONTAINER]: ContainerElement,
  [ELEMENT_TYPES.SAFE_AREA]: ContainerElement,
  [ELEMENT_TYPES.SCROLL_VIEW]: ContainerElement,
  [ELEMENT_TYPES.TEXT_INPUT]: TextInputElement,
  [ELEMENT_TYPES.BUTTON]: ButtonElement,
  [ELEMENT_TYPES.CARD]: CardElement,
  [ELEMENT_TYPES.ROW]: ContainerElement,
  [ELEMENT_TYPES.COLUMN]: ContainerElement,
  [ELEMENT_TYPES.FLAT_LIST]: ContainerElement,
  [ELEMENT_TYPES.FLAT_LIST_HORIZONTAL]: ContainerElement,
  [ELEMENT_TYPES.STACK_HEADER]: ContainerElement,
  [ELEMENT_TYPES.DRAWER]: ContainerElement,
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
  onAddChild,
  onDraftTextChange,
  onDraftTextCommit,
  onDraftTextKeyDown,
  isPreviewMode,
  isGridEnabled,
  gridConfig,
  onNavigate,
  onToggleDrawer,
}) {

  const draggingElement = interaction?.type === "drag-element" ? elements.find(el => el.id === interaction.id) : null;

  const renderElement = (element, forceRoot = false) => {
    const isDraggingActual = interaction?.type === "drag-element" && interaction.id === element.id;
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

    const isClickableInPreview = isPreviewMode && (element.interactionType === "navigate" || element.interactionType === "toggle-drawer");

    const style = {
      ...(isAbsolute ? { position: "absolute", left: element.x, top: element.y } : { position: "relative" }),
      width: element.width,
      height: element.height,
      zIndex: isActive || forceRoot || element.isFixed ? 100 : 1,
      opacity: isDraggingActual ? 0.4 : 1,
      pointerEvents: isPreviewMode && !isClickableInPreview && element.type !== ELEMENT_TYPES.BUTTON ? "none" : (isDraggingActual && !forceRoot ? "none" : "auto"),
      cursor: isClickableInPreview ? "pointer" : (isAbsolute ? "grab" : "default"),
    };

    return (
      <div
        key={element.id}
        data-id={element.id}
        data-type={element.type}
        className={`canvas-item ${isActive ? "canvas-item--selected" : ""} ${isHovered ? "is-hovered" : ""}`}
        style={style}
        onPointerDown={(event) => {
          if (isPreviewMode) {
            if (element.interactionType === "navigate" && element.targetPageId) onNavigate(element.targetPageId);
            return;
          }
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
            onAddChild={onAddChild}
            isPreviewMode={isPreviewMode}
          >
            {children.map(child => renderElement(child))}
          </ElementComponent>
        )}

        {!isPreviewMode && isActive && (
          <>
            <div
              className="resize-handle"
              onPointerDown={(event) => {
                event.stopPropagation();
                onElementResizePointerDown(event, element.id);
              }}
            />
          </>
        )}
      </div>
    );
  };

  const rootElements = elements.filter((el) => !el.parentId);

  return (
    <div
      ref={canvasRef}
      className="canvas-root"
      style={{ flex: 1, width: "100%", height: "100%", position: "relative", background: "#fff", overflow: "hidden" }}
      onPointerDown={onCanvasPointerDown}
    >
      {rootElements.map((el) => renderElement(el))}
      {draggingElement && renderElement(draggingElement, true)}

      {!isPreviewMode && interaction?.guides && (
        <div className="snapping-guides" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
          {interaction.guides.vertical.map((x, i) => (
            <div key={`v-${i}`} className="guide-line" style={{ position: "absolute", left: x, top: 0, bottom: 0, width: "1px", backgroundColor: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
          ))}
          {interaction.guides.horizontal.map((y, i) => (
            <div key={`h-${i}`} className="guide-line" style={{ position: "absolute", top: y, left: 0, right: 0, height: "1px", backgroundColor: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
          ))}
        </div>
      )}
    </div>
  );
}

