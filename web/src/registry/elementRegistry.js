export const ELEMENT_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  CONTAINER: "container",
  SAFE_AREA: "safe-area",
  SCROLL_VIEW: "scroll-view",
  TEXT_INPUT: "text-input",
  BUTTON: "button",
  CARD: "card",
  ROW: "row",
  COLUMN: "column",
  FLAT_LIST: "flat-list",
  FLAT_LIST_HORIZONTAL: "flat-list-horizontal",
  STACK_HEADER: "stack-header",
  DRAWER: "drawer",
};

export const elementRegistry = {
  [ELEMENT_TYPES.TEXT]: {
    label: "Text",
    defaultProps: {
      text: "New Text",
      fontSize: 16,
      color: "#191c1d",
      fontWeight: "400",
      lineHeight: 1.5,
      textAlign: "left",
      letterSpacing: 0,
    },
    defaultSize: { width: 150, height: 40 },
  },
  [ELEMENT_TYPES.IMAGE]: {
    label: "Image",
    defaultProps: {
      src: "https://via.placeholder.com/300x200",
      objectFit: "cover",
      borderRadius: 0,
    },
    defaultSize: { width: 200, height: 140 },
  },
  [ELEMENT_TYPES.CONTAINER]: {
    label: "View",
    defaultProps: {
      backgroundColor: "#ffffff",
      borderRadius: 0,
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: 0,
      padding: 0,
    },
    defaultSize: { width: 240, height: 160 },
  },
  [ELEMENT_TYPES.SAFE_AREA]: {
    label: "Safe Area",
    defaultProps: {
      flex: 1,
      backgroundColor: "transparent",
    },
    defaultSize: { width: "100%", height: "100%" },
  },
  [ELEMENT_TYPES.SCROLL_VIEW]: {
    label: "Scroll View",
    defaultProps: {
      horizontal: false,
      showsIndicator: true,
      gap: 0,
      padding: 0,
    },
    defaultSize: { width: 300, height: 200 },
  },
  [ELEMENT_TYPES.TEXT_INPUT]: {
    label: "Input",
    defaultProps: {
      placeholder: "Enter text...",
      fontSize: 14,
      color: "#191c1d",
      backgroundColor: "#f0f0f0",
      borderRadius: 8,
      padding: 12,
    },
    defaultSize: { width: 200, height: 48 },
  },
  [ELEMENT_TYPES.BUTTON]: {
    label: "Button",
    defaultProps: {
      text: "Click Me",
      backgroundColor: "#007AFF",
      color: "#ffffff",
      borderRadius: 12,
      fontSize: 16,
      fontWeight: "600",
      padding: 12,
    },
    defaultSize: { width: 140, height: 50 },
  },
  [ELEMENT_TYPES.CARD]: {
    label: "Card",
    defaultProps: {
      backgroundColor: "#ffffff",
      borderRadius: 16,
      padding: 16,
      shadow: "0 4px 12px rgba(0,0,0,0.1)",
      gap: 12,
    },
    defaultSize: { width: 280, height: 180 },
  },
  [ELEMENT_TYPES.ROW]: {
    label: "Row",
    defaultProps: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: 8,
      padding: 8,
    },
    defaultSize: { width: 300, height: 80 },
  },
  [ELEMENT_TYPES.COLUMN]: {
    label: "Column",
    defaultProps: {
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: 8,
      padding: 8,
    },
    defaultSize: { width: 300, height: 200 },
  },
  [ELEMENT_TYPES.FLAT_LIST]: {
    label: "FlatList",
    defaultProps: {
      backgroundColor: "transparent",
      padding: 8,
      gap: 12,
    },
    defaultSize: { width: 320, height: 240 },
  },
  [ELEMENT_TYPES.FLAT_LIST_HORIZONTAL]: {
    label: "H-FlatList",
    defaultProps: {
      backgroundColor: "transparent",
      padding: 8,
      gap: 12,
      horizontal: true,
    },
    defaultSize: { width: 320, height: 120 },
  },
  [ELEMENT_TYPES.STACK_HEADER]: {
    label: "Stack Header",
    defaultProps: {
      title: "Header Title",
      backgroundColor: "#ffffff",
      showBackButton: true,
    },
    defaultSize: { width: "100%", height: 56 },
  },
  [ELEMENT_TYPES.DRAWER]: {
    label: "Drawer",
    defaultProps: {
      backgroundColor: "#ffffff",
    },
    defaultSize: { width: 280, height: "100%" },
  },
};
