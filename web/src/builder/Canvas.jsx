export default function Canvas({ elements }) {
    console.log(elements)
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
        {elements.map((ele)=>{
            return <div
              style={{
                position: "absolute",
                left: ele.x,
                top: ele.y,
              }}
            >
              {ele.text}
            </div>;
        })}
      </div>
    </div>
  );
}