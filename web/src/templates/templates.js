import { ELEMENT_TYPES } from "../registry/elementRegistry";

export const TEMPLATES = {
  FINTECH: {
    name: "Fintech Dashboard",
    elements: [
      {
        id: "balance-card",
        type: ELEMENT_TYPES.CARD,
        x: 20,
        y: 80,
        width: 335,
        height: 180,
        backgroundColor: "#3b82f6",
        borderRadius: 24,
        padding: 24,
        parentId: null
      },
      {
        id: "balance-label",
        type: ELEMENT_TYPES.TEXT,
        text: "Total Balance",
        fontSize: 14,
        color: "#ffffff",
        opacity: 0.8,
        parentId: "balance-card"
      },
      {
        id: "balance-amount",
        type: ELEMENT_TYPES.TEXT,
        text: "$24,500.00",
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
        y: 24,
        parentId: "balance-card"
      }
    ]
  },
  ECOMMERCE: {
    name: "Product Details",
    elements: [
      {
        id: "product-image",
        type: ELEMENT_TYPES.IMAGE,
        x: 0,
        y: 0,
        width: "100%",
        height: 400,
        src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        parentId: null
      },
      {
        id: "product-info",
        type: ELEMENT_TYPES.CONTAINER,
        x: 0,
        y: 380,
        width: "100%",
        height: 432,
        backgroundColor: "#ffffff",
        borderRadius: 32,
        padding: 24,
        parentId: null
      }
    ]
  }
};
