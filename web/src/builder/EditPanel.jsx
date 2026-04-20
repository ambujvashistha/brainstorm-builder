function EditPanelField({ label, children }) {
  return (
    <label className="edit-panel__field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, min = 0, max, step = 1 }) {
  return (
    <input
      type="number"
      className="edit-panel__input"
      value={Math.round(value)}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export default function EditPanel({
  element,
  onTextChange,
  onFontSizeChange,
  onTextColorChange,
  onImageUrlChange,
  onContainerBgChange,
  onContainerRadiusChange,
  onWidthChange,
  onHeightChange,
  onXChange,
  onYChange,
  onDelete,
}) {
  const typeLabel =
    element.type === "text"
      ? "Text"
      : element.type === "image"
        ? "Image"
        : "Container";

  return (
    <aside className="edit-panel">
      <p className="edit-panel__eyebrow">Edit</p>
      <h2>Edit Element</h2>
      <p className="edit-panel__type">{typeLabel}</p>

      {element.type === "text" && (
        <>
          <EditPanelField label="Text">
            <input
              className="edit-panel__input"
              value={element.text || ""}
              onChange={(event) => onTextChange(event.target.value)}
            />
          </EditPanelField>

          <EditPanelField label="Font size">
            <div className="edit-panel__stack">
              <input
                type="range"
                min="10"
                max="72"
                value={Number(element.fontSize || 16)}
                onChange={(event) => onFontSizeChange(event.target.value)}
              />
              <NumberInput
                value={Number(element.fontSize || 16)}
                onChange={onFontSizeChange}
                min={10}
                max={72}
              />
            </div>
          </EditPanelField>

          <EditPanelField label="Text color">
            <input
              type="color"
              className="edit-panel__color"
              value={element.color || "#191c1d"}
              onChange={(event) => onTextColorChange(event.target.value)}
            />
          </EditPanelField>
        </>
      )}

      {element.type === "image" && (
        <>
          <EditPanelField label="Image URL">
            <input
              className="edit-panel__input"
              value={element.src || ""}
              onChange={(event) => onImageUrlChange(event.target.value)}
            />
          </EditPanelField>
          <div className="edit-panel__preview">
            {element.src ? <img src={element.src} alt="Preview" /> : <span>No image URL</span>}
          </div>
        </>
      )}

      {element.type === "container" && (
        <>
          <EditPanelField label="Background">
            <input
              type="color"
              className="edit-panel__color"
              value={element.backgroundColor || "#e7e8e9"}
              onChange={(event) => onContainerBgChange(event.target.value)}
            />
          </EditPanelField>
          <EditPanelField label="Border radius">
            <NumberInput
              value={Number(element.borderRadius || 12)}
              onChange={onContainerRadiusChange}
              min={0}
              max={80}
            />
          </EditPanelField>
        </>
      )}

      <div className="edit-panel__group">
        <p className="edit-panel__group-label">Size & Position</p>
        <div className="edit-panel__grid">
          <EditPanelField label="W">
            <NumberInput value={element.width} onChange={onWidthChange} min={90} />
          </EditPanelField>
          <EditPanelField label="H">
            <NumberInput value={element.height} onChange={onHeightChange} min={44} />
          </EditPanelField>
          <EditPanelField label="X">
            <NumberInput value={element.x} onChange={onXChange} min={0} />
          </EditPanelField>
          <EditPanelField label="Y">
            <NumberInput value={element.y} onChange={onYChange} min={0} />
          </EditPanelField>
        </div>
      </div>

      <button className="edit-panel__delete" onClick={onDelete}>
        Delete element
      </button>
    </aside>
  );
}
