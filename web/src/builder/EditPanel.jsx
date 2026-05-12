import { useState } from "react";
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

export default function EditPanel({ element, pages, navigationConfig, onUpdate, updateNavigation, onDelete }) {
  const [activeTab, setActiveTab] = useState("styles");

  if (!element) {
    return (
      <div className="edit-panel">
        <PropertyGroup title="App Navigation">
          <ControlField label="Bottom Tabs Enabled">
            <input 
              type="checkbox" 
              checked={navigationConfig?.enabled} 
              onChange={(e) => updateNavigation({ enabled: e.target.checked })}
            />
          </ControlField>
          
          <div style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div className="property-group__title" style={{ margin: 0 }}>Tabs</div>
              <button 
                className="btn btn--secondary" 
                style={{ height: "24px", padding: "0 8px", fontSize: "10px" }}
                onClick={() => {
                  const newTab = { 
                    id: `tab-${Date.now()}`, 
                    label: "New Tab", 
                    icon: "circle", 
                    targetPageId: pages[0]?.id 
                  };
                  updateNavigation({ tabs: [...(navigationConfig.tabs || []), newTab] });
                }}
              >
                + Add Tab
              </button>
            </div>

            {navigationConfig?.tabs.map((tab, index) => (
              <div key={tab.id} className="control-field" style={{ border: "1px solid var(--border-color)", padding: "12px", borderRadius: "8px", marginBottom: "8px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button 
                      disabled={index === 0}
                      onClick={() => {
                        const nextTabs = [...navigationConfig.tabs];
                        [nextTabs[index-1], nextTabs[index]] = [nextTabs[index], nextTabs[index-1]];
                        updateNavigation({ tabs: nextTabs });
                      }}
                      style={{ border: "none", background: "none", cursor: index === 0 ? "default" : "pointer", opacity: index === 0 ? 0.3 : 1 }}
                    >
                      ↑
                    </button>
                    <button 
                      disabled={index === navigationConfig.tabs.length - 1}
                      onClick={() => {
                        const nextTabs = [...navigationConfig.tabs];
                        [nextTabs[index+1], nextTabs[index]] = [nextTabs[index], nextTabs[index+1]];
                        updateNavigation({ tabs: nextTabs });
                      }}
                      style={{ border: "none", background: "none", cursor: index === navigationConfig.tabs.length - 1 ? "default" : "pointer", opacity: index === navigationConfig.tabs.length - 1 ? 0.3 : 1 }}
                    >
                      ↓
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      const nextTabs = navigationConfig.tabs.filter((_, i) => i !== index);
                      updateNavigation({ tabs: nextTabs });
                    }}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#FF3B30", fontSize: "14px" }}
                  >
                    ×
                  </button>
                </div>

                <ControlField label="Label">
                  <input 
                    className="input-control" 
                    value={tab.label} 
                    onChange={(e) => {
                      const nextTabs = [...navigationConfig.tabs];
                      nextTabs[index] = { ...tab, label: e.target.value };
                      updateNavigation({ tabs: nextTabs });
                    }}
                  />
                </ControlField>
                <ControlField label="Target Page">
                  <select 
                    className="select-control"
                    value={tab.targetPageId}
                    onChange={(e) => {
                      const nextTabs = [...navigationConfig.tabs];
                      nextTabs[index] = { ...tab, targetPageId: e.target.value };
                      updateNavigation({ tabs: nextTabs });
                    }}
                  >
                    {pages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </ControlField>
              </div>
            ))}
          </div>
        </PropertyGroup>
      </div>
    );
  }

  const isText = [ELEMENT_TYPES.TEXT, ELEMENT_TYPES.BUTTON].includes(element.type);
  const isInput = element.type === ELEMENT_TYPES.TEXT_INPUT;
  const isImage = element.type === ELEMENT_TYPES.IMAGE;
  const isContainer = [
    ELEMENT_TYPES.CONTAINER, 
    ELEMENT_TYPES.SAFE_AREA, 
    ELEMENT_TYPES.SCROLL_VIEW, 
    ELEMENT_TYPES.CARD, 
    ELEMENT_TYPES.ROW, 
    ELEMENT_TYPES.COLUMN,
    ELEMENT_TYPES.FLAT_LIST,
    ELEMENT_TYPES.FLAT_LIST_HORIZONTAL,
    ELEMENT_TYPES.STACK_HEADER,
    ELEMENT_TYPES.DRAWER
  ].includes(element.type);

  const isScrollable = [
    ELEMENT_TYPES.SCROLL_VIEW, 
    ELEMENT_TYPES.FLAT_LIST, 
    ELEMENT_TYPES.FLAT_LIST_HORIZONTAL
  ].includes(element.type);

  const isStackHeader = element.type === ELEMENT_TYPES.STACK_HEADER;

  return (
    <div className="edit-panel">
      <div className="sidebar-tabs" style={{ margin: "0 0 20px 0" }}>
        <button className={`tab-button ${activeTab === "styles" ? "is-active" : ""}`} onClick={() => setActiveTab("styles")}>Styles</button>
        <button className={`tab-button ${activeTab === "interactions" ? "is-active" : ""}`} onClick={() => setActiveTab("interactions")}>Interactions</button>
      </div>

      {activeTab === "styles" && (
        <>
          {/* Content Group */}
          <PropertyGroup title="Content">
            {isStackHeader && (
              <ControlField label="Header Title">
                <input 
                  className="input-control" 
                  value={element.title || ""} 
                  onChange={(e) => onUpdate({ title: e.target.value })}
                />
              </ControlField>
            )}
            {isText && (
              <ControlField label="Text Content">
                <input 
                  className="input-control" 
                  value={element.text || ""} 
                  onChange={(e) => onUpdate({ text: e.target.value })}
                />
              </ControlField>
            )}
            {isInput && (
              <ControlField label="Placeholder">
                <input 
                  className="input-control" 
                  value={element.placeholder || ""} 
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
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
              {isScrollable && (
                <ControlField label="Scroll Direction">
                  <select 
                    className="select-control"
                    value={element.horizontal ? "horizontal" : "vertical"}
                    onChange={(e) => onUpdate({ horizontal: e.target.value === "horizontal" })}
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                </ControlField>
              )}
              <ControlField label="Direction">
                <select 
                  className="select-control"
                  value={element.flexDirection || (element.type === ELEMENT_TYPES.ROW ? "row" : "column")}
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
          {(isText || isInput) && (
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
        </>
      )}

      {activeTab === "interactions" && (
        <PropertyGroup title="Click Actions">
          <ControlField label="On Press">
            <select 
              className="select-control"
              value={element.interactionType || "none"}
              onChange={(e) => onUpdate({ interactionType: e.target.value })}
            >
              <option value="none">None</option>
              <option value="navigate">Navigate to Page</option>
            </select>
          </ControlField>
          
          {element.interactionType === "navigate" && (
            <ControlField label="Target Page">
              <select 
                className="select-control"
                value={element.targetPageId || ""}
                onChange={(e) => onUpdate({ targetPageId: e.target.value })}
              >
                <option value="">Select a page...</option>
                {pages.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </ControlField>
          )}
        </PropertyGroup>
      )}

      <button className="btn btn--secondary" style={{ width: "100%", color: "#FF3B30", borderColor: "#FF3B30", marginTop: "20px" }} onClick={onDelete}>
        Delete Element
      </button>
    </div>
  );
}
