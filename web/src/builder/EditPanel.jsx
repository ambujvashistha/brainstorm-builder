import { ELEMENT_TYPES } from "../registry/elementRegistry";

function ControlField({ label, children }) {
  return (
    <div className="control-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function PropertyGroup({ title, children }) {
  return (
    <div className="property-group">
      <div className="property-group__title">{title}</div>
      {children}
    </div>
  );
}

export default function EditPanel({ element, onUpdate, onDelete }) {
  if (!element) {
    return (
      <div className="edit-panel--empty">
        <p>Select an element to edit properties</p>
      </div>
    );
  }

  const isText = [ELEMENT_TYPES.TEXT, ELEMENT_TYPES.BUTTON, ELEMENT_TYPES.TEXT_INPUT].includes(element.type);
  const isImage = element.type === ELEMENT_TYPES.IMAGE;
  const isContainer = [
    ELEMENT_TYPES.CONTAINER, 
    ELEMENT_TYPES.SAFE_AREA, 
    ELEMENT_TYPES.SCROLL_VIEW, 
    ELEMENT_TYPES.CARD, 
    ELEMENT_TYPES.ROW, 
    ELEMENT_TYPES.COLUMN
  ].includes(element.type);

  return (
    <div className="edit-panel">
      {/* Content Group */}
      <PropertyGroup title="Content">
        {isText && (
          <ControlField label="Text / Value">
            <input 
              className="input-control" 
              value={element.text || element.placeholder || ""} 
              onChange={(e) => onUpdate({ text: e.target.value })}
            />
          </ControlField>
        )}
        {isImage && (
          <ControlField label="Image URL">
            <input 
              className="input-control" 
              value={element.src || ""} 
              onChange={(e) => onUpdate({ src: e.target.value })}
            />
          </ControlField>
        )}
      </PropertyGroup>

      {/* Layout Group */}
      <PropertyGroup title="Layout">
        <div className="grid-2">
          <ControlField label="Width">
            <input 
              className="input-control" 
              type="text"
              value={element.width} 
              onChange={(e) => onUpdate({ width: e.target.value })}
            />
          </ControlField>
          <ControlField label="Height">
            <input 
              className="input-control" 
              type="text"
              value={element.height} 
              onChange={(e) => onUpdate({ height: e.target.value })}
            />
          </ControlField>
        </div>
        {!element.parentId && (
          <div className="grid-2">
            <ControlField label="X Pos">
              <input 
                className="input-control" 
                type="number"
                value={Math.round(element.x)} 
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
              />
            </ControlField>
            <ControlField label="Y Pos">
              <input 
                className="input-control" 
                type="number"
                value={Math.round(element.y)} 
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
              />
            </ControlField>
          </div>
        )}
      </PropertyGroup>

      {/* Flex Group (for containers) */}
      {isContainer && (
        <PropertyGroup title="Flexbox">
          <ControlField label="Direction">
            <select 
              className="select-control"
              value={element.flexDirection || "column"}
              onChange={(e) => onUpdate({ flexDirection: e.target.value })}
            >
              <option value="column">Column</option>
              <option value="row">Row</option>
            </select>
          </ControlField>
          <div className="grid-2">
            <ControlField label="Justify">
              <select 
                className="select-control"
                value={element.justifyContent || "flex-start"}
                onChange={(e) => onUpdate({ justifyContent: e.target.value })}
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="space-between">Between</option>
                <option value="space-around">Around</option>
              </select>
            </ControlField>
            <ControlField label="Align">
              <select 
                className="select-control"
                value={element.alignItems || "stretch"}
                onChange={(e) => onUpdate({ alignItems: e.target.value })}
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="stretch">Stretch</option>
              </select>
            </ControlField>
          </div>
          <div className="grid-2">
            <ControlField label="Gap">
              <input 
                className="input-control" 
                type="number"
                value={element.gap || 0} 
                onChange={(e) => onUpdate({ gap: Number(e.target.value) })}
              />
            </ControlField>
            <ControlField label="Padding">
              <input 
                className="input-control" 
                type="number"
                value={element.padding || 0} 
                onChange={(e) => onUpdate({ padding: Number(e.target.value) })}
              />
            </ControlField>
          </div>
        </PropertyGroup>
      )}

      {/* Typography Group */}
      {isText && (
        <PropertyGroup title="Typography">
          <div className="grid-2">
            <ControlField label="Size">
              <input 
                className="input-control" 
                type="number"
                value={element.fontSize || 16} 
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
              />
            </ControlField>
            <ControlField label="Weight">
              <select 
                className="select-control"
                value={element.fontWeight || "400"}
                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
              </select>
            </ControlField>
          </div>
          <ControlField label="Color">
            <input 
              type="color" 
              className="input-control"
              style={{ padding: "2px", height: "32px" }}
              value={element.color || "#1D1D1F"} 
              onChange={(e) => onUpdate({ color: e.target.value })}
            />
          </ControlField>
          <ControlField label="Align">
            <select 
              className="select-control"
              value={element.textAlign || "left"}
              onChange={(e) => onUpdate({ textAlign: e.target.value })}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </ControlField>
        </PropertyGroup>
      )}

      {/* Styling Group */}
      <PropertyGroup title="Styling">
        <ControlField label="Background">
          <input 
            type="color" 
            className="input-control"
            style={{ padding: "2px", height: "32px" }}
            value={element.backgroundColor || "#FFFFFF"} 
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
        </ControlField>
        <ControlField label="Radius">
          <input 
            className="input-control" 
            type="number"
            value={element.borderRadius || 0} 
            onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          />
        </ControlField>
      </PropertyGroup>

      <button className="btn btn--secondary" style={{ width: "100%", color: "#FF3B30", borderColor: "#FF3B30", marginTop: "20px" }} onClick={onDelete}>
        Delete Element
      </button>
    </div>
  );
}
