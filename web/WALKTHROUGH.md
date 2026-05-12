# Brainstorm Builder - Assessment Walkthrough Guide

Use this guide as a script/outline for your 5-minute Loom video for BettrHQ.

---

## 1. Product Overview (1 Minute)
*   **The Problem:** Mobile app prototyping is often disconnected. Designers use Figma, and developers start from scratch.
*   **The Solution:** Brainstorm Builder is a low-code tool that allows for rapid UI prototyping directly in a React Native environment.
*   **The "Wow" Factor:** Show the **Real-time Code Preview** and the **Export ZIP** feature.
    *   *Demo:* Add a Card, drop a Button inside it, change the color, and then switch to the "Code" tab to show the React Native styles updating instantly.

## 2. System Architecture (1.5 Minutes)
Explain the core patterns that make the system scalable:
*   **The Registry Pattern:** All UI elements are defined in `src/registry/elementRegistry.js`. This decouples the "schema" of an element from its rendering logic. Adding a new component (like a Chart or Map) is just a matter of adding a JSON definition.
*   **Recursive Rendering:** Explain how the `Canvas` uses a recursive function to render nested layouts (Rows/Columns/Cards). This allows for infinite nesting while keeping the rendering logic clean.
*   **Separation of Concerns:**
    *   `useCanvasInteractions`: Handles Pointer Events API for drag-and-drop/resizing.
    *   `useElementActions`: Manages the state tree (CRUD operations on elements).
    *   `Persistence Layer`: Uses a centralized utility to handle `localStorage` (easily swappable for a real backend like Firebase/Supabase).

## 3. Key Technical Decisions (1 Minute)
*   **Pointer Events API:** "I chose the native Pointer Events API over libraries like `dnd-kit` to have absolute control over resize handles and custom snap-to-grid logic, while keeping the bundle size minimal."
*   **CSS-in-JS for Preview:** "The preview uses dynamic CSS variables to simulate React Native's flexbox behavior in the browser, ensuring a high-fidelity 'What You See Is What You Get' (WYSIWYG) experience."
*   **Multi-Page State Management:** "The state is structured as a normalized tree of pages, each containing a flat list of elements with `parentId` links. This makes operations like 'moving an element to another page' or 'duplicating a page' very efficient."

## 4. Commit History & Code Quality (1 Minute)
*   **Clean History:** "I follow a feature-driven commit strategy (feat/refactor/fix) to ensure the evolution of the codebase is traceable."
*   **Type Safety & Extensibility:** Show `src/utils/exportToReactNative.js`. "The export utility is designed as a mapping system, making it easy to support other frameworks like Flutter or Swift UI in the future."
*   **Performance:** "I optimized the canvas by minimizing re-renders using `React.memo` and scoped state updates, maintaining a steady 60 FPS even with complex layouts."

## 5. Summary & Future Scope (30 Seconds)
*   "The next steps would be integrating a real-time collaboration backend (using WebSockets/Yjs) and adding a component marketplace."

---

### Recording Checklist:
1.  Open the app in **Editor Mode**.
2.  Start with a blank canvas or the default 'Home' page.
3.  **Action:** Drag a `Card`, change its `borderRadius` to 20.
4.  **Action:** Add a `Button`, change text to "Get Started", color to blue.
5.  **Action:** Switch to **Preview Mode** to show the interactive Phone Frame.
6.  **Action:** Switch to **Code Tab** to show the generated code.
7.  **Action:** Click **Export ZIP** to show it's a production-ready tool.
