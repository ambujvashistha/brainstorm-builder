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
  onDraftTextCancel,
  onDraftTextKeyDown,
}) {
  return (
    <section className="builder">
      <div className="builder__meta">
        <span>
          Canvas: {Math.round(canvasSize.width)} x{" "}
          {Math.round(canvasSize.height)}
        </span>
        <span>Drag cards and use the corners to resize</span>
      </div>

      <div
        ref={canvasRef}
        className={`canvas ${interaction ? "canvas--active" : ""}`}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        onPointerDown={onCanvasPointerDown}
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
                isActive ? "canvas__item--selected" : "",
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
              onPointerDown={(event) => onElementPointerDown(event, index)}
              onDoubleClick={() => onElementDoubleClick(index)}
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
                  />
                ) : (
                  <span className="canvas__label">{element.text}</span>
                ))}

              {element.type === "image" && (
                <img
                  src={element.src}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                  }}
                  draggable={false}
                />
              )}

              {element.type === "container" && (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "2px dashed #aaa",
                    background: "rgba(0,0,0,0.03)",
                  }}
                />
              )}

              <button
                type="button"
                className="canvas__resize-handle"
                onPointerDown={(event) =>
                  onElementResizePointerDown(event, index)
                }
              />
            </div>
          );
        })}

        <button
          type="button"
          className="canvas__corner-resize"
          onPointerDown={onCanvasResizePointerDown}
        />
      </div>
    </section>
  );
}
