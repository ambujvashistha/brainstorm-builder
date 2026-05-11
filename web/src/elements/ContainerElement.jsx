export default function ContainerElement({ element, children }) {
  const isScrollView = element.type === "scroll-view";
  
  const style = {
    backgroundColor: element.backgroundColor || "transparent",
    borderRadius: element.borderRadius || 0,
    display: "flex",
    flexDirection: element.flexDirection || "column",
    justifyContent: element.justifyContent || "flex-start",
    alignItems: element.alignItems || "stretch",
    gap: element.gap || 0,
    padding: element.padding || 0,
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    overflow: isScrollView ? "auto" : "visible",
    boxShadow: element.shadow || "none",
  };

  return (
    <div className={`element-${element.type}`} style={style}>
      {children}
    </div>
  );
}
