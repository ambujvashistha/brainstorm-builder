import TextElement from "../elements/TextElement";
import ImageElement from "../elements/ImageElement";
import ContainerElement from "../elements/ContainerElement";
import ButtonElement from "../elements/ButtonElement";
import TextInputElement from "../elements/TextInputElement";
import CardElement from "../elements/CardElement";
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

    const isClickableInPreview = isPreviewMode && (element.interactionType === "navigate" || element.interactionType === "toggle-drawer");

    const style = {
      ...(isAbsolute ? { position: "absolute", left: element.x, top: element.y } : { position: "relative" }),
      width: element.width,
      height: element.height,
      zIndex: isActive || forceRoot || element.isFixed ? 100 : 1,
      opacity: isDraggingActual ? 0.6 : 1,
      pointerEvents: isPreviewMode && !isClickableInPreview && element.type !== ELEMENT_TYPES.BUTTON ? "none" : (isDraggingActual && !forceRoot ? "none" : "auto"),
      cursor: isClickableInPreview ? "pointer" : (isAbsolute ? "grab" : "default"),
    };

    if (element.isFixed && !element.parentId && !forceRoot) {
      style.bottom = 0;
      style.top = "auto";
      style.left = 0;
      style.right = 0;
      style.width = "100%";
    }

    return (
      <div
        key={element.id}
        data-id={element.id}
        data-type={element.type}
        className={`canvas-item ${isActive ? "canvas-item--selected" : ""} ${isDraggingActual ? "is-dragging" : ""} ${isResizing ? "is-resizing" : ""} ${isHovered ? "element-container--hovered" : ""}`}
        style={style}
        onPointerDown={(event) => {
          if (isPreviewMode) {
            if (element.interactionType === "navigate" && element.targetPageId && onNavigate) {
              onNavigate(element.targetPageId);
            }
            if (element.interactionType === "toggle-drawer" && onToggleDrawer) {
              onToggleDrawer();
            }
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
  
  const gridStyle = isGridEnabled ? {
    backgroundSize: `${100 / (gridConfig?.cols || 12)}% ${100 / (gridConfig?.rows || 20)}%`,
    backgroundImage: `
      linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
    `,
  } : {};

  return (
    <div
      ref={canvasRef}
      className={`canvas-root ${isGridEnabled ? "show-grid" : ""}`}
      style={{
        flex: 1,
        width: "100%",
        position: "relative",
        background: "#fff",
        overflow: "hidden",
        ...gridStyle,
      }}
      onPointerDown={onCanvasPointerDown}
    >
      {rootElements.map((el) => renderElement(el))}
      {draggingElement && renderElement(draggingElement, true)}

      {/* Smart Snapping Guides */}
      {!isPreviewMode && interaction && (
        <div className="snapping-guides" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
          {interaction.guides?.vertical.map((x, i) => (
            <div key={`v-${i}`} style={{ position: "absolute", left: x, top: 0, bottom: 0, width: "1px", backgroundColor: "#ff00ff", boxShadow: "0 0 4px rgba(255,0,255,0.5)" }} />
          ))}
          {interaction.guides?.horizontal.map((y, i) => (
            <div key={`h-${i}`} style={{ position: "absolute", top: y, left: 0, right: 0, height: "1px", backgroundColor: "#ff00ff", boxShadow: "0 0 4px rgba(255,0,255,0.5)" }} />
          ))}
        </div>
      )}
    </div>
  );
}
