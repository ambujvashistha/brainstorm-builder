import { useEffect, useRef, useState } from "react";
import Canvas from "../builder/Canvas";
import EditPanel from "../builder/EditPanel";
import PhoneFrame from "../builder/PhoneFrame";
import { exportToReactNative } from "../utils/exportToReactNative";
import { generateProjectZip } from "../utils/generateZip";
import { persistence } from "../utils/persistence";
import { useElementActions } from "../hooks/useElementActions";
import { useCanvasInteractions } from "../hooks/useCanvasInteractions";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { ELEMENT_TYPES, elementRegistry } from "../registry/elementRegistry";

const INITIAL_NAVIGATION = {
  enabled: true,
  tabs: [
    { id: "tab-1", label: "Home", icon: "home", targetPageId: "home-page" },
    { id: "tab-2", label: "Profile", icon: "user", targetPageId: "profile-page" },
  ],
};

const INITIAL_PAGES = [
  {
    id: "home-page",
    name: "Home",
    elements: [
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
    ],
  },
  {
    id: "profile-page",
    name: "Profile",
    elements: [
      {
        id: "profile-header",
        type: ELEMENT_TYPES.TEXT,
        x: 24,
        y: 60,
        width: 200,
        height: 40,
        text: "My Profile",
        fontSize: 28,
        fontWeight: "700",
        color: "#1D1D1F",
        parentId: null,
      },
    ],
  }
];

export default function BuilderScreen() {
  const canvasRef = useRef(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [canvasSize, setCanvasSize] = useState({ width: 375, height: 812 });
  const [interaction, setInteraction] = useState(null);
  const [rightSidebarTab, setRightSidebarTab] = useState("properties");
  const [leftSidebarTab, setLeftSidebarTab] = useState("components");
  const [deviceType, setDeviceType] = useState("ios");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isGridEnabled, setIsGridEnabled] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridConfig, setGridConfig] = useState({ rows: 10, cols: 5 });

  const [pages, setPages] = useState(() => {
    const saved = persistence.loadProject();
    return saved?.pages || INITIAL_PAGES;
  });
  const [activePageId, setActivePageId] = useState(pages[0].id);
  const [navigationConfig, setNavigationConfig] = useState(() => {
    const saved = persistence.loadProject();
    return saved?.navigationConfig || INITIAL_NAVIGATION;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    persistence.saveProject({ pages, navigationConfig });
  }, [pages, navigationConfig]);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const elements = activePage.elements;

  const { 
    addElement, 
    updateElement, 
    deleteElement, 
    addPage, 
    deletePage, 
    renamePage,
    updateNavigation
  } = useElementActions(
    pages,
    setPages,
    activePageId,
    canvasSize,
    setActiveId,
    setEditingId,
    setDraftText,
    navigationConfig,
    setNavigationConfig
  );

  function handleAddChild(parentId) {
    addElement(ELEMENT_TYPES.CONTAINER, { parentId });
  }

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
    guides,
  } = useCanvasInteractions({
    canvasRef,
    pages,
    setPages,
    activePageId,
    interaction,
    setInteraction,
    isPreviewMode,
    setActiveId,
    editingId,
    commitDraftText,
    snapToGrid,
    gridConfig,
    canvasSize,
    onToggleDrawer: () => setIsDrawerOpen(prev => !prev),
  });

  useKeyboardShortcuts({
    activeId,
    setActiveId,
    setEditingId,
    pages,
    setPages,
    activePageId,
    canvasSize,
    isPreviewMode,
  });

  async function exportRN() {
    try {
      await generateProjectZip(elements, pages, navigationConfig);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate project ZIP. Check console for details.");
    }
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
    interaction: interaction ? { ...interaction, guides } : null,
    hoveredContainerId,
    onCanvasPointerDown: handleCanvasPointerDown,
    onElementPointerDown: handleElementPointerDown,
    onElementResizePointerDown: handleElementResizePointerDown,
    onElementDoubleClick: startEditing,
    onAddChild: handleAddChild,
    onDraftTextChange: setDraftText,
    onDraftTextCommit: commitDraftText,
    onDraftTextKeyDown: (e) => {
      if (e.key === "Enter") commitDraftText();
      if (e.key === "Escape") setEditingId(null);
    },
    isPreviewMode,
    isGridEnabled,
    gridConfig,
    onNavigate: (pageId) => {
      setActivePageId(pageId);
      setActiveId(null);
      setIsDrawerOpen(false);
    },
    onToggleDrawer: () => setIsDrawerOpen(prev => !prev),
    navigationConfig,
  };

  return (
    <main className={`builder-screen ${isPreviewMode ? "is-preview" : ""}`}>
      {/* Left Sidebar */}
      {!isPreviewMode && (
        <aside className={`builder-sidebar ${leftSidebarCollapsed ? "is-collapsed" : ""}`}>
          <div className="sidebar-tabs">
            <button
              className={`tab-button ${leftSidebarTab === "components" ? "is-active" : ""}`}
              onClick={() => setLeftSidebarTab("components")}
            >
              Components
            </button>
            <button
              className={`tab-button ${leftSidebarTab === "pages" ? "is-active" : ""}`}
              onClick={() => setLeftSidebarTab("pages")}
            >
              Pages
            </button>
          </div>
          
          <div className="sidebar-content">
            {leftSidebarTab === "components" && (
              <div className="component-grid">
                {Object.entries(elementRegistry).map(([type, config]) => (
                  <button 
                    key={type} 
                    className="component-item" 
                    onClick={() => {
                      const parent = activeId ? elements.find(el => el.id === activeId) : null;
                      const isContainer = parent && [
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
                      ].includes(parent.type);
                      
                      addElement(type, { parentId: isContainer ? activeId : null });
                    }}
                  >
                    <span>{config.label}</span>
                  </button>
                ))}
              </div>
            )}

            {leftSidebarTab === "pages" && (
              <div className="pages-list">
                {pages.map(page => (
                  <div 
                    key={page.id} 
                    className={`page-item ${activePageId === page.id ? "is-active" : ""}`}
                    onClick={() => {
                      setActivePageId(page.id);
                      setActiveId(null);
                    }}
                  >
                    <span>{page.name}</span>
                    {pages.length > 1 && (
                      <button className="delete-page-btn" onClick={(e) => {
                        e.stopPropagation();
                        deletePage(page.id);
                        if (activePageId === page.id) setActivePageId(pages[0].id);
                      }}>×</button>
                    )}
                  </div>
                ))}
                <button className="btn btn--secondary" style={{ width: "100%", marginTop: "12px" }} onClick={() => {
                  const newId = addPage(`Page ${pages.length + 1}`);
                  setActivePageId(newId);
                }}>
                  + Add Page
                </button>
              </div>
            )}
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

            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                className={`btn ${isGridEnabled ? "btn--primary" : "btn--secondary"}`}
                onClick={() => setIsGridEnabled(!isGridEnabled)}
                title="Toggle Grid"
              >
                Grid
              </button>
              <button 
                className={`btn ${snapToGrid ? "btn--primary" : "btn--secondary"}`}
                onClick={() => setSnapToGrid(!snapToGrid)}
                title="Toggle Snapping"
              >
                Snap
              </button>
            </div>

            <div className="grid-controls" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-secondary)" }}>GRID:</span>
              <div style={{ display: "flex", background: "#F5F5F7", padding: "2px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <input 
                  type="number" 
                  value={gridConfig.cols} 
                  onChange={(e) => setGridConfig(prev => ({ ...prev, cols: Math.max(1, parseInt(e.target.value) || 1) }))}
                  style={{ width: "36px", height: "24px", border: "none", background: "transparent", fontSize: "11px", textAlign: "center", outline: "none" }}
                  title="Columns"
                />
                <span style={{ fontSize: "11px", color: "var(--text-secondary)", alignSelf: "center" }}>×</span>
                <input 
                  type="number" 
                  value={gridConfig.rows} 
                  onChange={(e) => setGridConfig(prev => ({ ...prev, rows: Math.max(1, parseInt(e.target.value) || 1) }))}
                  style={{ width: "36px", height: "24px", border: "none", background: "transparent", fontSize: "11px", textAlign: "center", outline: "none" }}
                  title="Rows"
                />
              </div>
            </div>

            <div className="topbar-actions">
              <button className="btn btn--secondary" onClick={exportRN}>
                Export ZIP
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
            <PhoneFrame 
              deviceType={deviceType}
              navigationConfig={navigationConfig}
              activePageId={activePageId}
              isDrawerOpen={isDrawerOpen}
              onCloseDrawer={() => setIsDrawerOpen(false)}
              onNavigate={(pageId) => {
                setActivePageId(pageId);
                setActiveId(null);
                setIsDrawerOpen(false);
              }}
            >
              <Canvas {...canvasProps} />
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* Right Sidebar */}
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
              className={`tab-button ${rightSidebarTab === "json" ? "is-active" : ""}`}
              onClick={() => setRightSidebarTab("json")}
            >
              JSON
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
                pages={pages}
                navigationConfig={navigationConfig}
                onUpdate={(patch) => updateElement(activeId, patch)}
                updateNavigation={updateNavigation}
                onDelete={() => deleteElement(activeId)}
              />
            )}
            {rightSidebarTab === "json" && (
              <div className="code-panel">
                <div className="code-panel__header">
                  <span>Project JSON</span>
                  <button className="copy-button" onClick={() => {
                    const data = JSON.stringify({ pages, navigationConfig }, null, 2);
                    navigator.clipboard.writeText(data);
                    alert("JSON copied!");
                  }}>
                    Copy
                  </button>
                </div>
                <textarea 
                  className="code-preview" 
                  style={{ width: "100%", height: "100%", border: "none", resize: "none", outline: "none", backgroundColor: "#1E1E1E", color: "#D4D4D4" }}
                  value={JSON.stringify({ pages, navigationConfig }, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      if (parsed.pages && parsed.navigationConfig) {
                        setPages(parsed.pages);
                        setNavigationConfig(parsed.navigationConfig);
                      }
                    } catch (err) {
                      // Silently fail on invalid JSON while typing
                    }
                  }}
                />
              </div>
            )}
            {rightSidebarTab === "code" && (
              <div className="code-panel">
                <div className="code-panel__header">
                  <span>React Native (Expo)</span>
                  <button className="copy-button" onClick={() => {
                    const code = exportToReactNative(elements, pages, navigationConfig);
                    navigator.clipboard.writeText(code);
                    alert("Copied to clipboard!");
                  }}>
                    Copy
                  </button>
                </div>
                <div className="code-preview">
                  {exportToReactNative(elements, pages, navigationConfig)}
                </div>
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
