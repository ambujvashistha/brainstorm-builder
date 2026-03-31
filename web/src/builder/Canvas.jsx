export default function Canvas({ elements, setActiveIndex }) {
  console.log(elements);
  return (
    <div>
      <h1>Brainstorm Builder</h1>

      <div
        style={{
          width: "100%",
          height: "80vh",
          border: "2px solid #ccc",
          position: "relative",
        }}
      >
        {elements.map((ele,index) => {
          return (
            <div
              style={{
                position: "absolute",
                left: ele.x,
                top: ele.y,
              }}
              onMouseDown={() => setActiveIndex(index)}
            >
              {ele.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}