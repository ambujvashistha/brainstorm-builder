export default function Canvas({
  canvasRef,
  canvasSize,
  elements,
  activeIndex,
  editingIndex,
  draftText,
  interaction,
  onCanvasPointerDown,
  onElementPointerDown,
  onElementResizePointerDown,
  onCanvasResizePointerDown,
  onElementDoubleClick,
  onDraftTextChange,
  onDraftTextCommit,
  onDraftTextKeyDown,
  isPreviewMode,
  toolbar,
}) {
  return (
    <section className="builder">
      {!isPreviewMode && (
        <div className="builder__meta">
          <span>
            Canvas: {Math.round(canvasSize.width)} x{" "}
            {Math.round(canvasSize.height)}
          </span>
          <span>Drag cards and use the corners to resize</span>
        </div>
      )}

      <div
        ref={canvasRef}
        className={`canvas ${interaction ? "canvas--active" : ""} ${
          isPreviewMode ? "canvas--preview" : ""
        }`}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        onPointerDown={isPreviewMode ? undefined : onCanvasPointerDown}
      >
        {elements.map((element, index) => {
          const isActive = index === activeIndex;
          const isEditing = index === editingIndex;
          const isDragging =
            interaction?.type === "drag-element" && interaction.index === index;

          const isResizing =
            interaction?.type === "resize-element" &&
            interaction.index === index;

          return (
            <div
              key={index}
              className={[
                "canvas__item",
                !isPreviewMode && isActive ? "canvas__item--selected" : "",
                isDragging ? "canvas__item--dragging" : "",
                isResizing ? "canvas__item--resizing" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
              }}
              onPointerDown={
                isPreviewMode ? undefined : (event) => onElementPointerDown(event, index)
              }
              onDoubleClick={isPreviewMode ? undefined : () => onElementDoubleClick(index)}
            >
              {element.type === "text" &&
                (isEditing ? (
                  <input
                    className="canvas__input"
                    value={draftText}
                    autoFocus
                    onChange={(event) => onDraftTextChange(event.target.value)}
                    onBlur={onDraftTextCommit}
                    onKeyDown={onDraftTextKeyDown}
                    onPointerDown={(event) => event.stopPropagation()}
                    style={{
                      fontSize: element.fontSize || 16,
                      color: element.color || "#191c1d",
                    }}
                  />
                ) : (
                  <span
                    className="canvas__label"
                    style={{
                      fontSize: element.fontSize || 16,
                      color: element.color || "#191c1d",
                    }}
                  >
                    {element.text}
                  </span>
                ))}

              {element.type === "image" && (
                <img src={element.src} className="canvas__image" draggable={false} />
              )}

              {element.type === "container" && (
                <div
                  className="canvas__container"
                  style={{
                    backgroundColor: element.backgroundColor || "#e7e8e9",
                    borderRadius: element.borderRadius || 12,
                  }}
                />
              )}

              {!isPreviewMode && (
                <button
                  type="button"
                  className="canvas__resize-handle"
                  onPointerDown={(event) =>
                    onElementResizePointerDown(event, index)
                  }
                />
              )}
            </div>
          );
        })}

        {!isPreviewMode && (
          <button
            type="button"
            className="canvas__corner-resize"
            onPointerDown={onCanvasResizePointerDown}
          />
        )}

        {!isPreviewMode && <div className="canvas-toolbar">{toolbar}</div>}
      </div>
    </section>
  );
}
