import { ELEMENT_TYPES } from "../registry/elementRegistry";

export default function CardElement({ element, children }) {
  const { backgroundColor, borderRadius, padding, shadow, gap } = element;
  
  return (
    <div 
      className="element-card"
      style={{
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
        boxShadow: shadow,
        display: "flex",
        flexDirection: "column",
        gap: `${gap}px`,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {children}
    </div>
  );
}
