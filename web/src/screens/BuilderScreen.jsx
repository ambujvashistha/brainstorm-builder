import { useEffect, useRef, useState } from "react";
import Canvas from "../builder/Canvas";
import EditPanel from "../builder/EditPanel";
import PhoneFrame from "../builder/PhoneFrame";
import { exportToReactNative } from "../utils/exportToReactNative";
import { useElementActions } from "../hooks/useElementActions";
import { useCanvasInteractions } from "../hooks/useCanvasInteractions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { ELEMENT_TYPES, elementRegistry } from "../registry/elementRegistry";

const MIN_CANVAS_WIDTH = 420;
const MIN_CANVAS_HEIGHT = 320;

export default function BuilderScreen() {
  const canvasRef = useRef(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [canvasSize, setCanvasSize] = useState({ width: 375, height: 812 });
  const [interaction, setInteraction] = useState(null);
  const [rightSidebarTab, setRightSidebarTab] = useState("properties");
  const [deviceType, setDeviceType] = useState("ios");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);

  const [elements, setElements] = useState([
    {
      id: "root-safe-area",
      type: ELEMENT_TYPES.SAFE_AREA,
      x: 0,
      y: 0,
      width: "100%",
      height: "100%",
      parentId: null,
      backgroundColor: "transparent",
    },
    {
      id: "header-text",
      type: ELEMENT_TYPES.TEXT,
      x: 24,
      y: 60,
      width: 200,
      height: 40,
      text: "Welcome Back",
      fontSize: 28,
      fontWeight: "700",
      color: "#1D1D1F",
      parentId: null,
    },
  ]);

  const { addElement, updateElement, deleteElement } = useElementActions(
    elements,
    setElements,
    canvasSize,
    setActiveId,
    setEditingId,
    setDraftText
  );

  function commitDraftText() {
    if (editingId === null) return;
    const nextText = draftText.trim() || "Untitled";
    updateElement(editingId, { text: nextText });
    setEditingId(null);
  }

  const {
    handleCanvasPointerDown,
    handleElementPointerDown,
    handleElementResizePointerDown,
    hoveredContainerId,
  } = useCanvasInteractions({
    canvasRef,
    elements,
    setElements,
    interaction,
    setInteraction,
    isPreviewMode,
    setActiveId,
    editingId,
    commitDraftText,
  });

  useKeyboardShortcuts({
    activeId,
    setActiveId,
    setEditingId,
    elements,
    setElements,
    canvasSize,
    isPreviewMode,
  });

  function exportRN() {
    const code = exportToReactNative(elements);
    navigator.clipboard.writeText(code);
    alert("React Native code copied to clipboard!");
  }

  useEffect(() => {
    if (isPreviewMode) return;
    const handleOutsidePointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest(".canvas-item") || target.closest(".builder-sidebar") || target.closest(".builder-main__topbar")) {
        return;
      }
      setActiveId(null);
      setEditingId(null);
    };
    window.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => window.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [isPreviewMode]);

  function startEditing(id) {
    if (isPreviewMode) return;
    const element = elements.find(el => el.id === id);
    if (element?.type === ELEMENT_TYPES.TEXT || element?.type === ELEMENT_TYPES.BUTTON) {
      setActiveId(id);
      setEditingId(id);
      setDraftText(element.text || "");
      setInteraction(null);
    }
  }

  function togglePreviewMode() {
    setInteraction(null);
    setEditingId(null);
    setActiveId(null);
    setIsPreviewMode((prev) => !prev);
  }

  const selectedElement = activeId !== null ? elements.find(el => el.id === activeId) : null;

  const canvasProps = {
    canvasRef,
    canvasSize,
    elements,
    activeId,
    editingId,
    draftText,
    interaction,
    hoveredContainerId,
    onCanvasPointerDown: handleCanvasPointerDown,
    onElementPointerDown: handleElementPointerDown,
    onElementResizePointerDown: handleElementResizePointerDown,
    onElementDoubleClick: startEditing,
    onDraftTextChange: setDraftText,
    onDraftTextCommit: commitDraftText,
    onDraftTextKeyDown: (e) => {
      if (e.key === "Enter") commitDraftText();
      if (e.key === "Escape") setEditingId(null);
    },
    isPreviewMode,
  };

  return (
    <main className={`builder-screen ${isPreviewMode ? "is-preview" : ""}`}>
      {/* Left Sidebar: Components */}
      {!isPreviewMode && (
        <aside className={`builder-sidebar ${leftSidebarCollapsed ? "is-collapsed" : ""}`}>
          <div className="sidebar-header">
            <h2>Components</h2>
          </div>
          <div className="sidebar-content">
            <div className="component-grid">
              {Object.entries(elementRegistry).map(([type, config]) => (
                <button 
                  key={type} 
                  className="component-item" 
                  onClick={() => addElement(type, { parentId: null })}
                >
                  <span>{config.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Main Area */}
      <section className="builder-main">
        {!isPreviewMode && (
          <header className="builder-main__topbar">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button 
                className="btn btn--secondary" 
                onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                style={{ padding: "0 8px" }}
              >
                {leftSidebarCollapsed ? "→" : "←"}
              </button>
              <h1>Brainstorm</h1>
            </div>

            <div className="device-switcher">
              <button 
                className={`btn ${deviceType === "ios" ? "btn--primary" : "btn--secondary"}`}
                onClick={() => {
                  setDeviceType("ios");
                  setCanvasSize({ width: 375, height: 812 });
                }}
              >
                iOS
              </button>
              <button 
                className={`btn ${deviceType === "android" ? "btn--primary" : "btn--secondary"}`}
                onClick={() => {
                  setDeviceType("android");
                  setCanvasSize({ width: 360, height: 740 });
                }}
              >
                Android
              </button>
            </div>

            <div className="topbar-actions">
              <button className="btn btn--secondary" onClick={exportRN}>
                Export Code
              </button>
              <button className="btn btn--primary" onClick={togglePreviewMode}>
                Preview
              </button>
            </div>
          </header>
        )}

        <div className="builder-main__content" style={{ background: isPreviewMode ? "#000" : undefined }}>
          <div className={isPreviewMode ? "preview-container" : ""}>
            {isPreviewMode && (
              <button 
                className="btn btn--secondary" 
                onClick={togglePreviewMode}
                style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1000 }}
              >
                Back to Editor
              </button>
            )}
            <PhoneFrame deviceType={deviceType}>
              <Canvas {...canvasProps} />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* Right Sidebar: Controls */}
      {!isPreviewMode && (
        <aside className="builder-sidebar builder-sidebar--right">
          <div className="sidebar-tabs">
            <button
              className={`tab-button ${rightSidebarTab === "properties" ? "is-active" : ""}`}
              onClick={() => setRightSidebarTab("properties")}
            >
              Styles
            </button>
            <button
              className={`tab-button ${rightSidebarTab === "code" ? "is-active" : ""}`}
              onClick={() => setRightSidebarTab("code")}
            >
              Code
            </button>
            <button
              className={`tab-button ${rightSidebarTab === "layers" ? "is-active" : ""}`}
              onClick={() => setRightSidebarTab("layers")}
            >
              Layers
            </button>
          </div>

          <div className="sidebar-content">
            {rightSidebarTab === "properties" && (
              <EditPanel
                element={selectedElement}
                onUpdate={(patch) => updateElement(activeId, patch)}
                onDelete={() => deleteElement(activeId)}
              />
            )}
            {rightSidebarTab === "code" && (
              <div className="code-preview">
                {exportToReactNative(elements)}
              </div>
            )}
            {rightSidebarTab === "layers" && (
              <div className="layers-list">
                {elements.map(el => (
                  <div 
                    key={el.id} 
                    className={`layer-item ${activeId === el.id ? "is-active" : ""}`}
                    onClick={() => setActiveId(el.id)}
                  >
                    <span>{elementRegistry[el.type]?.label || el.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}
    </main>
  );
}
