import { useEffect, useRef, useState } from "react";
import Canvas from "../canvas/Canvas";
import EditPanel from "../editor/EditPanel";
import PhoneFrame from "../canvas/PhoneFrame";
import LayersPanel from "../layers/LayersPanel";
import AIModal from "../panels/AIModal";
import { TEMPLATES } from "../templates/templates";
import { exportToReactNative } from "../export/exportToReactNative";
import { generateProjectZip } from "../export/generateZip";
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
  const [isGridEnabled, setIsGridEnabled] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridConfig, setGridConfig] = useState({ size: 10 });
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "dark";
  });

  const [pages, setPages] = useState(() => {
    const saved = persistence.loadProject();
    return saved?.pages || INITIAL_PAGES;
  });
  const [activePageId, setActivePageId] = useState(pages[0]?.id || INITIAL_PAGES[0].id);
  const [navigationConfig, setNavigationConfig] = useState(() => {
    const saved = persistence.loadProject();
    return saved?.navigationConfig || INITIAL_NAVIGATION;
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    persistence.saveProject({ pages, navigationConfig });
  }, [pages, navigationConfig]);

  useEffect(() => {
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const elements = activePage?.elements || [];

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

  function commitDraftText() {
    if (editingId === null) return;
    const nextText = draftText.trim() || "Untitled";
    updateElement(editingId, { text: nextText });
    setEditingId(null);
  }

  async function exportRN() {
    try {
      await generateProjectZip(elements, pages, navigationConfig);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate project ZIP.");
    }
  }

  const handleAIGenerate = (prompt) => {
    // Pick a template based on prompt keywords or random
    const templateKey = prompt.toLowerCase().includes("fintech") ? "FINTECH" : "ECOMMERCE";
    const template = TEMPLATES[templateKey];
    
    setPages(prev => prev.map(page => {
      if (page.id === activePageId) {
        return { ...page, elements: template.elements };
      }
      return page;
    }));
  };

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
    onElementDoubleClick: (id) => {
      const el = elements.find(e => e.id === id);
      if (el?.type === ELEMENT_TYPES.TEXT || el?.type === ELEMENT_TYPES.BUTTON) {
        setEditingId(id);
        setDraftText(el.text || "");
      }
    },
    onAddChild: (parentId) => addElement(ELEMENT_TYPES.CONTAINER, { parentId }),
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
    <main className={`builder-screen theme-${theme} ${isPreviewMode ? "is-preview" : ""}`}>
      {/* Top Bar */}
      {!isPreviewMode && (
        <header className="builder-main__topbar glass-panel">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="logo" style={{ fontWeight: "700", letterSpacing: "-0.5px", fontSize: "16px" }}>BRAINSTORM</div>
            <div className="project-name" style={{ color: "var(--text-muted)", fontSize: "13px" }}>/ Mobile MVP</div>
          </div>

          <div className="device-switcher">
            <button className={`btn ${deviceType === "ios" ? "btn--primary" : ""}`} onClick={() => { setDeviceType("ios"); setCanvasSize({ width: 375, height: 812 }); }}>iOS</button>
            <button className={`btn ${deviceType === "android" ? "btn--primary" : ""}`} onClick={() => { setDeviceType("android"); setCanvasSize({ width: 360, height: 740 }); }}>Android</button>
          </div>

          <div className="topbar-actions">
            <button className="btn" onClick={toggleTheme} style={{ width: "40px", justifyContent: "center", padding: 0 }}>
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
            <button className="btn btn--accent" onClick={() => setIsAIModalOpen(true)}>AI Generate</button>
            <button className="btn" onClick={exportRN}>Export App</button>
            <button className="btn btn--primary" onClick={() => setIsPreviewMode(true)}>Preview</button>
          </div>
        </header>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar */}
        {!isPreviewMode && (
          <aside className="builder-sidebar">
            <div className="sidebar-tabs">
              <button className={`tab-button ${leftSidebarTab === "components" ? "is-active" : ""}`} onClick={() => setLeftSidebarTab("components")}>Assets</button>
              <button className={`tab-button ${leftSidebarTab === "layers" ? "is-active" : ""}`} onClick={() => setLeftSidebarTab("layers")}>Layers</button>
              <button className={`tab-button ${leftSidebarTab === "pages" ? "is-active" : ""}`} onClick={() => setLeftSidebarTab("pages")}>Pages</button>
            </div>
            
            <div className="sidebar-content">
              {leftSidebarTab === "components" && (
                <div className="component-grid">
                  {Object.entries(elementRegistry).map(([type, config]) => (
                    <button key={type} className="component-item" onClick={() => addElement(type)}>
                      <span>{config.label}</span>
                    </button>
                  ))}
                </div>
              )}
              {leftSidebarTab === "layers" && (
                <LayersPanel elements={elements} activeId={activeId} onSelect={setActiveId} />
              )}
              {leftSidebarTab === "pages" && (
                <div className="pages-list">
                  {pages.map(page => (
                    <div key={page.id} className={`page-item ${activePageId === page.id ? "is-active" : ""}`} onClick={() => setActivePageId(page.id)}>
                      <span>{page.name}</span>
                      {pages.length > 1 && (
                        <div className="page-item__actions">
                          <button 
                            className="btn" 
                            style={{ height: "20px", width: "20px", padding: 0, justifyContent: "center", border: "none", background: "transparent", color: "inherit" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete page "${page.name}"?`)) deletePage(page.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button className="btn btn--secondary" style={{ width: "100%", marginTop: "12px" }} onClick={() => addPage("New Page")}>+ Add Page</button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Center Canvas */}
        <section className="builder-main">
          <div className="builder-main__content">
            {isPreviewMode && (
              <button className="btn btn--primary glass-panel" onClick={() => setIsPreviewMode(false)} style={{ position: "absolute", top: "24px", left: "24px", zIndex: 1000 }}>
                Exit Preview
              </button>
            )}
            <PhoneFrame 
              deviceType={deviceType}
              navigationConfig={navigationConfig}
              activePageId={activePageId}
              isDrawerOpen={isDrawerOpen}
              onCloseDrawer={() => setIsDrawerOpen(false)}
              onNavigate={(pageId) => setActivePageId(pageId)}
            >
              <Canvas {...canvasProps} />
            </PhoneFrame>
          </div>
        </section>

        {/* Right Sidebar */}
        {!isPreviewMode && (
          <aside className="builder-sidebar builder-sidebar--right">
            <div className="sidebar-tabs">
              <button className={`tab-button ${rightSidebarTab === "properties" ? "is-active" : ""}`} onClick={() => setRightSidebarTab("properties")}>Inspector</button>
              <button className={`tab-button ${rightSidebarTab === "code" ? "is-active" : ""}`} onClick={() => setRightSidebarTab("code")}>Code</button>
            </div>

            <div className="sidebar-content">
              {rightSidebarTab === "properties" ? (
                <EditPanel
                  element={selectedElement}
                  pages={pages}
                  navigationConfig={navigationConfig}
                  onUpdate={(patch) => updateElement(activeId, patch)}
                  updateNavigation={updateNavigation}
                  onDelete={() => deleteElement(activeId)}
                />
              ) : (
                <div className="code-panel">
                  <div style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "flex-end" }}>
                    <button 
                      className="btn btn--primary" 
                      style={{ height: "24px", fontSize: "11px", padding: "0 8px" }}
                      onClick={() => {
                        const code = exportToReactNative(elements, pages, navigationConfig);
                        navigator.clipboard.writeText(code);
                        alert("Code copied to clipboard!");
                      }}
                    >
                      Copy Code
                    </button>
                  </div>
                  <div className="code-preview" style={{ padding: "16px", fontSize: "11px", whiteSpace: "pre-wrap", overflowY: "auto", flex: 1 }}>
                    {exportToReactNative(elements, pages, navigationConfig)}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onGenerate={handleAIGenerate} 
      />
    </main>
  );
}
