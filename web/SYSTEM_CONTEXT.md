# Brainstorm Builder - Full System Context (Premium Platform)

This document provides a comprehensive technical overview of the project as of May 12, 2026. Use this to provide context to LLMs or for your technical walkthrough.

---

## 1. Project Vision
A production-grade, low-code layout editor for React Native. It allows developers to build complex, nested mobile UIs in a premium "Linear/Figma" style environment and export modular, production-ready Expo code.

## 2. Core Architecture
The system is built on five architectural pillars:

### A. The Registry Pattern (`src/registry/elementRegistry.js`)
*   **Concept:** Every UI component is defined as a JSON schema.
*   **Benefit:** Decouples the editor's UI from component logic.
*   **Scalability:** Supports rapid addition of new "Presets" (Product Cards, Avatars).

### B. Recursive Rendering Engine (`src/canvas/Canvas.jsx`)
*   **Concept:** Recursive `renderElement` function handling a normalized element tree.
*   **Performance:** Uses high-efficiency CSS transitions and scoped state updates to maintain 60 FPS.

### C. Advanced Interaction System (`src/hooks/useCanvasInteractions.js`)
*   **Smart Snapping:** Custom alignment engine snapping to canvas edges, centers, and sibling elements.
*   **Dynamic Grid:** User-definable grid constraints for architectural precision.

### D. Modular Project Export (`src/export/generateZip.js`)
*   **Architecture:** Generates a professional folder structure:
    *   `/src/screens`: Modular page components.
    *   `/src/navigation`: Centralized AppNavigator.
    *   `App.js` & `package.json`: Fully configured boilerplate.

### E. AI-Driven Scaffolding (`src/panels/AIModal.jsx`)
*   **Concept:** Uses descriptive prompts to instantiate complex multi-element templates (Fintech, Ecommerce).

## 3. Directory Structure (Production-Grade)
- **`src/app/`**: High-level screen containers.
- **`src/canvas/`**: Rendering and frame simulation.
- **`src/editor/`**: Inspector panel and property controls.
- **`src/layers/`**: Nested hierarchy management.
- **`src/templates/`**: Predefined layout schemas.
- **`src/export/`**: Mapping logic for code generation.
- **`src/components/`**: Atomic UI elements for the builder.

## 4. Tech Stack
- **Frontend:** React 19, Vite.
- **Styling:** Premium Dark Theme, Glassmorphism, CSS Variables.
- **Utilities:** JSZip, FileSaver, Pointer Events API.

---

**Walking through the code:** To show off your skills, highlight `src/canvas/Canvas.jsx` (Recursion) and `src/hooks/useCanvasInteractions.js` (Custom Snapping Logic).
