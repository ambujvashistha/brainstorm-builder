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

const commonIcons = [
  "Home", "User", "Settings", "Search", "Heart", "Bell", "Share", "Mail", 
  "Camera", "ChevronRight", "ChevronLeft", "Plus", "Trash", "Check", "X"
];

export default function EditPanel({ element, pages, navigationConfig, onUpdate, updateNavigation, onDelete }) {
  const [activeTab, setActiveTab] = useState("styles");

  if (!element) {
    return (
      <div className="edit-panel">
        <PropertyGroup title="App Navigation">
          <ControlField label="Bottom Tabs">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input 
                type="checkbox" 
                checked={navigationConfig?.enabled} 
                onChange={(e) => updateNavigation({ enabled: e.target.checked })}
              />
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Enable Navigation</span>
            </div>
          </ControlField>
          
          <div style={{ marginTop: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div className="property-group__title" style={{ margin: 0 }}>Tabs</div>
              <button 
                className="btn" 
                style={{ height: "24px", padding: "0 8px", fontSize: "11px" }}
                onClick={() => {
                  const newTab = { id: `tab-${Date.now()}`, label: "New Tab", icon: "circle", targetPageId: pages[0]?.id };
                  updateNavigation({ tabs: [...(navigationConfig.tabs || []), newTab] });
                }}
              >
                + Add
              </button>
            </div>

            {navigationConfig?.tabs.map((tab, index) => (
              <div key={tab.id} style={{ border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "8px", background: "var(--bg-app)" }}>
                <ControlField label="Label">
                  <input className="input-control" value={tab.label} onChange={(e) => {
                    const nextTabs = [...navigationConfig.tabs];
                    nextTabs[index] = { ...tab, label: e.target.value };
                    updateNavigation({ tabs: nextTabs });
                  }} />
                </ControlField>
                <ControlField label="Icon">
                  <div className="icon-grid">
                    {commonIcons.map(icon => (
                      <button 
                        key={icon}
                        className={`icon-grid-btn ${tab.icon === icon ? "is-active" : ""}`}
                        onClick={() => {
                          const nextTabs = [...navigationConfig.tabs];
                          nextTabs[index] = { ...tab, icon };
                          updateNavigation({ tabs: nextTabs });
                        }}
                        title={icon}
                      >
                        {icon.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </ControlField>
                <ControlField label="Link">
                  <select className="input-control" value={tab.targetPageId} onChange={(e) => {
                    const nextTabs = [...navigationConfig.tabs];
                    nextTabs[index] = { ...tab, targetPageId: e.target.value };
                    updateNavigation({ tabs: nextTabs });
                  }}>
                    {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
  const isImage = element.type === ELEMENT_TYPES.IMAGE;
  const isIcon = element.type === ELEMENT_TYPES.ICON;
  const isContainer = [ELEMENT_TYPES.CONTAINER, ELEMENT_TYPES.CARD, ELEMENT_TYPES.ROW, ELEMENT_TYPES.COLUMN].includes(element.type);

  return (
    <div className="edit-panel">
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        marginBottom: "20px", 
        padding: "0 4px" 
      }}>
        <div style={{ 
          backgroundColor: "var(--accent)", 
          color: "white", 
          fontSize: "10px", 
          fontWeight: "700", 
          padding: "2px 6px", 
          borderRadius: "4px",
          textTransform: "uppercase"
        }}>
          {element.type}
        </div>
        <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500" }}>
          Active Element
        </span>
      </div>

      <div className="sidebar-tabs" style={{ padding: 0, marginBottom: "20px" }}>
        <button className={`tab-button ${activeTab === "styles" ? "is-active" : ""}`} onClick={() => setActiveTab("styles")}>Styles</button>
        <button className={`tab-button ${activeTab === "config" ? "is-active" : ""}`} onClick={() => setActiveTab("config")}>Config</button>
      </div>

      {activeTab === "styles" && (
        <>
          {isImage && (
            <PropertyGroup title="Image Source">
              <ControlField label="Image URL">
                <input 
                  className="input-control" 
                  value={element.src || ""} 
                  onChange={(e) => onUpdate({ src: e.target.value })} 
                  placeholder="https://via.placeholder.com/..."
                />
              </ControlField>
            </PropertyGroup>
          )}

          {isIcon && (
            <PropertyGroup title="Icon Settings">
              <ControlField label="Icon Name">
                <input 
                  className="input-control" 
                  value={element.iconName || ""} 
                  onChange={(e) => onUpdate({ iconName: e.target.value })} 
                  placeholder="Search icons..."
                />
              </ControlField>
              <div className="icon-grid">
                {commonIcons.map(icon => (
                  <button 
                    key={icon}
                    className={`icon-grid-btn ${element.iconName === icon ? "is-active" : ""}`}
                    onClick={() => onUpdate({ iconName: icon })}
                    title={icon}
                  >
                    {icon.slice(0, 3)}
                  </button>
                ))}
              </div>
              <ControlField label="Size">
                <input className="input-control" type="number" value={element.size || 24} onChange={(e) => onUpdate({ size: Number(e.target.value) })} />
              </ControlField>
              <ControlField label="Color">
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="color" className="input-control" style={{ width: "40px", padding: "2px" }} value={element.color || "#000000"} onChange={(e) => onUpdate({ color: e.target.value })} />
                  <input className="input-control" value={element.color || "#000000"} onChange={(e) => onUpdate({ color: e.target.value })} />
                </div>
              </ControlField>
            </PropertyGroup>
          )}

          <PropertyGroup title="Dimensions">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <ControlField label="W">
                <input className="input-control" value={element.width} onChange={(e) => onUpdate({ width: e.target.value })} />
              </ControlField>
              <ControlField label="H">
                <input className="input-control" value={element.height} onChange={(e) => onUpdate({ height: e.target.value })} />
              </ControlField>
            </div>
            {!element.parentId && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
                <ControlField label="X">
                  <input className="input-control" type="number" value={Math.round(element.x)} onChange={(e) => onUpdate({ x: Number(e.target.value) })} />
                </ControlField>
                <ControlField label="Y">
                  <input className="input-control" type="number" value={Math.round(element.y)} onChange={(e) => onUpdate({ y: Number(e.target.value) })} />
                </ControlField>
              </div>
            )}
          </PropertyGroup>

          {isText && (
            <PropertyGroup title="Typography">
              <ControlField label="Text">
                <input className="input-control" value={element.text || ""} onChange={(e) => onUpdate({ text: e.target.value })} />
              </ControlField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <ControlField label="Size">
                  <input className="input-control" type="number" value={element.fontSize || 16} onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })} />
                </ControlField>
                <ControlField label="Weight">
                  <select className="input-control" value={element.fontWeight || "400"} onChange={(e) => onUpdate({ fontWeight: e.target.value })}>
                    <option value="400">Regular</option>
                    <option value="600">Medium</option>
                    <option value="700">Bold</option>
                  </select>
                </ControlField>
              </div>
              <ControlField label="Color">
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="color" className="input-control" style={{ width: "40px", padding: "2px" }} value={element.color || "#000000"} onChange={(e) => onUpdate({ color: e.target.value })} />
                  <input className="input-control" value={element.color || "#000000"} onChange={(e) => onUpdate({ color: e.target.value })} />
                </div>
              </ControlField>
            </PropertyGroup>
          )}

          <PropertyGroup title="Appearance">
            <ControlField label="Fill">
              <div style={{ display: "flex", gap: "8px" }}>
                <input type="color" className="input-control" style={{ width: "40px", padding: "2px" }} value={element.backgroundColor || "#ffffff"} onChange={(e) => onUpdate({ backgroundColor: e.target.value })} />
                <input className="input-control" value={element.backgroundColor || "#ffffff"} onChange={(e) => onUpdate({ backgroundColor: e.target.value })} />
              </div>
            </ControlField>
            <ControlField label="Radius">
              <input className="input-control" type="number" value={element.borderRadius || 0} onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })} />
            </ControlField>
          </PropertyGroup>

          {isContainer && (
            <PropertyGroup title="Layout (Flex)">
              <ControlField label="Direction">
                <select className="input-control" value={element.flexDirection || "column"} onChange={(e) => onUpdate({ flexDirection: e.target.value })}>
                  <option value="column">Column (Vertical)</option>
                  <option value="row">Row (Horizontal)</option>
                </select>
              </ControlField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <ControlField label="Gap">
                  <input className="input-control" type="number" value={element.gap || 0} onChange={(e) => onUpdate({ gap: Number(e.target.value) })} />
                </ControlField>
                <ControlField label="Padding">
                  <input className="input-control" type="number" value={element.padding || 0} onChange={(e) => onUpdate({ padding: Number(e.target.value) })} />
                </ControlField>
              </div>
            </PropertyGroup>
          )}
        </>
      )}

      {activeTab === "config" && (
        <PropertyGroup title="Actions">
          <ControlField label="On Click">
            <select className="input-control" value={element.interactionType || "none"} onChange={(e) => onUpdate({ interactionType: e.target.value })}>
              <option value="none">None</option>
              <option value="navigate">Navigate to Page</option>
            </select>
          </ControlField>
          {element.interactionType === "navigate" && (
            <ControlField label="Target">
              <select className="input-control" value={element.targetPageId || ""} onChange={(e) => onUpdate({ targetPageId: e.target.value })}>
                {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </ControlField>
          )}
        </PropertyGroup>
      )}

      <div style={{ padding: "16px 0", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
        <button className="btn" style={{ width: "100%", color: "#f87171", borderColor: "#f87171" }} onClick={onDelete}>
          Delete Element
        </button>
      </div>
    </div>
  );
}

