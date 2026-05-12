import { useState } from "react";

export default function AIModal({ isOpen, onClose, onGenerate }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate "thinking"
    setTimeout(() => {
      onGenerate(prompt);
      setIsGenerating(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ai-modal glass-panel" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Generate Screen with AI</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "8px" }}>
          Describe the screen you want to build and let Brainstorm AI handle the layout.
        </p>
        
        <textarea
          className="ai-input"
          placeholder="e.g. A fintech dashboard with a balance card and recent transactions list..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={isGenerating}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
          <button className="btn" onClick={onClose} disabled={isGenerating}>Cancel</button>
          <button className="btn btn--accent" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Thinking..." : "Generate Screen"}
          </button>
        </div>
      </div>
    </div>
  );
}
