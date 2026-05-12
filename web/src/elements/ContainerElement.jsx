export default function ContainerElement({ element, children, onAddChild, isPreviewMode }) {
  const isFlatList = element.type === "flat-list" || element.type === "flat-list-horizontal";
  const isScrollable = element.type === "scroll-view" || isFlatList;
  const isHorizontal = isScrollable && element.horizontal;
  const isView = element.type === "container";
  const isRow = element.type === "row";
  const isColumn = element.type === "column";
  
  const isStackHeader = element.type === "stack-header";
  const isDrawer = element.type === "drawer";

  const style = {
    backgroundColor: element.backgroundColor || "transparent",
    borderRadius: element.borderRadius || 0,
    display: "flex",
    flexDirection: isHorizontal || isStackHeader ? "row" : (element.flexDirection || (isRow ? "row" : "column")),
    justifyContent: element.justifyContent || (isRow || isColumn ? "flex-start" : "flex-start"),
    alignItems: isStackHeader ? "center" : (element.alignItems || (isRow || isHorizontal ? "center" : (isColumn ? "stretch" : "stretch"))),
    gap: element.gap || 0,
    padding: element.padding || 0,
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    overflow: isScrollable ? (isHorizontal ? "visible" : "auto") : "visible",
    boxShadow: element.shadow || (isStackHeader ? "0 1px 4px rgba(0,0,0,0.05)" : "none"),
    borderBottom: isStackHeader ? "1px solid #D2D2D7" : "none",
    position: "relative",
  };

  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  // Templating logic for FlatList
  const renderChildren = () => {
    if (isFlatList && !isEmpty && !isPreviewMode) {
      return (
        <>
          {children}
          {[1, 2, 3, 4].map(i => (
            <div key={`template-${i}`} style={{ opacity: 0.4, pointerEvents: "none" }}>
              {children}
            </div>
          ))}
        </>
      );
    }
    return children;
  };

  return (
    <div 
      className={`element-${element.type} ${isHorizontal ? "element-horizontal" : ""}`} 
      style={style}
    >
      {isStackHeader && (
        <div style={{ display: "flex", alignItems: "center", width: "100%", height: "100%", padding: "0 16px" }}>
          <div style={{ fontSize: "20px", width: "24px", cursor: "pointer" }}>←</div>
          <div style={{ flex: 1, textAlign: "center", fontWeight: "600", fontSize: "17px" }}>{element.title || "Title"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "24px", justifyContent: "flex-end" }}>
            {children}
          </div>
        </div>
      )}

      {isDrawer && isEmpty && (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "40px 20px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "30px", backgroundColor: "#F5F5F7", marginBottom: "20px" }}></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: "44px", display: "flex", alignItems: "center", borderBottom: "1px solid #F5F5F7", color: "#1D1D1F", fontSize: "14px" }}>
              Menu Item {i}
            </div>
          ))}
        </div>
      )}

      {!isStackHeader && renderChildren()}
      
      {isEmpty && isScrollable && !isPreviewMode && (
        <div style={{ padding: "12px", display: "flex", flexDirection: isHorizontal ? "row" : "column", width: isHorizontal ? "auto" : "100%" }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              height: "60px",
              width: isHorizontal ? "120px" : "100%",
              flexShrink: 0,
              backgroundColor: i % 2 === 0 ? "#F5F5F7" : "#EBEBEB",
              borderRadius: "8px",
              marginBottom: isHorizontal ? 0 : "12px",
              marginRight: isHorizontal ? "12px" : 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#86868B",
              fontSize: "12px",
              border: "1px dashed #D2D2D7"
            }}>
              Item {i}
            </div>
          ))}
        </div>
      )}

      {!isPreviewMode && (
        <button
          className="add-child-button"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild && onAddChild(element.id);
          }}
          title="Add Element"
        >
          +
        </button>
      )}

      {isEmpty && (isRow || isColumn || isView) && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          color: "rgba(0,0,0,0.2)",
          border: "1px dashed rgba(0,0,0,0.1)",
          pointerEvents: "none",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}>
          Empty {isView ? "View" : element.type}
        </div>
      )}
    </div>
  );
}
