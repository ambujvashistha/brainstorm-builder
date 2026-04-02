export default function Canvas({
  canvasRef,
  canvasSize,
  elements,
  activeIndex,
  interaction,
  onCanvasPointerDown,
  onElementPointerDown,
  onElementResizePointerDown,
  onCanvasResizePointerDown,
}) {
  return (
    <section className="builder">
      <div className="builder__meta">
        <span>Canvas: {Math.round(canvasSize.width)} x {Math.round(canvasSize.height)}</span>
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
          const isDragging =
            interaction?.type === "drag-element" && interaction.index === index;
          const isResizing =
            interaction?.type === "resize-element" && interaction.index === index;

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
            >
              <span className="canvas__label">{element.text}</span>
              <button
                type="button"
                className="canvas__resize-handle"
                aria-label={`Resize ${element.text}`}
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
          aria-label="Resize canvas"
          onPointerDown={onCanvasResizePointerDown}
        />
      </div>
    </section>
  );
}
