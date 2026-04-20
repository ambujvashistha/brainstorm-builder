import { useMemo } from "react";

export default function JsonPanel({ elements, canvasSize, onImport }) {
  const jsonText = useMemo(() => {
    return JSON.stringify(
      {
        canvas: canvasSize,
        elements,
      },
      null,
      2,
    );
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

  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        onImport(parsed);
      } catch {
        alert("Invalid JSON file");
      }
    };

    reader.readAsText(file);
  }

  return (
    <aside className="json-panel">
      <div className="json-panel__header">
        <p className="json-panel__eyebrow">Data</p>
        <h2>Layout JSON</h2>
      </div>

      <textarea
        className="json-panel__textarea"
        value={jsonText}
        readOnly
      />

      <div className="json-panel__actions">
        <button className="builder-screen__button builder-screen__button--secondary" onClick={handleCopy}>
          Copy
        </button>
        <button className="builder-screen__button builder-screen__button--secondary" onClick={handleDownload}>
          Download
        </button>
        <label className="builder-screen__button builder-screen__button--secondary json-panel__upload">
          Load File
          <input
            type="file"
            accept="application/json"
            hidden
            onChange={handleFileImport}
          />
        </label>
      </div>
    </aside>
  );
}
