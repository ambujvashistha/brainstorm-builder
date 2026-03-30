export default function BuilderScreen() {
  return (
    <div>
      <h1>Brainstorm Builder</h1>

      {/* Canvas */}
      <div
        style={{
          width: "100%",
          height: "80vh",
          border: "2px solid #ccc",
          position: "relative",
        }}
      >
        {/* One test element */}
        <div
          style={{
            position: "absolute",
            left: 50,
            top: 50,
          }}
        >
          Hello bro
        </div>
      </div>
    </div>
  );
}
