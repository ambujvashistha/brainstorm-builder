import { useEffect, useState } from "react";

export default function JsonPanel({ elements, canvasSize, onImport }) {
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    const payload = {
      canvas: canvasSize,
      elements,
    };

    setJsonText(JSON.stringify(payload, null, 2));
  }, [elements, canvasSize]);

  function handleCopy() {
    navigator.clipboard.writeText(jsonText);
  }

  function handleDownload() {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(jsonText);
      onImport(parsed);
    } catch {
      alert("Invalid JSON");
    }
  }

  return (
    <aside className="json-panel">
      <div className="json-panel__header">Layout JSON</div>

      <textarea
        className="json-panel__textarea"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />

      <div className="json-panel__actions">
        <button className="builder-screen__button" onClick={handleCopy}>
          Copy
        </button>
        <button className="builder-screen__button" onClick={handleDownload}>
          Download
        </button>
        <button className="builder-screen__button" onClick={handleImport}>
          Load
        </button>
      </div>
    </aside>
  );
}
