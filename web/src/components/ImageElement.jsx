export default function ImageElement({ element }) {
  return (
    <img
      src={element.src || "https://via.placeholder.com/300x200"}
      alt=""
      style={{
        width: "100%",
        height: "100%",
        objectFit: element.objectFit || "cover",
        borderRadius: element.borderRadius || 0,
        display: "block",
      }}
      draggable={false}
    />
  );
}
