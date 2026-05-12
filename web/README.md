# Brainstorm Builder

Brainstorm Builder is a high-performance, low-code visual editor for React Native. Designed for rapid prototyping, it allows developers and designers to build complex mobile UIs in a "WYSIWYG" environment and export production-ready Expo code.

![Hero Image](src/assets/hero.png)

## 🚀 Key Features

- **Recursive Rendering Engine:** Supports infinite nesting of UI components (Containers, Rows, Columns, Cards).
- **Smart Snapping Engine:** High-precision alignment guides relative to canvas boundaries and other elements.
- **AI-Powered Layout Generation:** Describe your screen and watch Brainstorm AI build the initial structure for you.
- **Modular Expo Export:** Generates a structured React Native project with separate screens, navigation, and optimized styles.
- **Dynamic Registry:** Easily extend the component library via a centralized JSON-driven registry.
- **Live JSON Schema:** Bi-directional editing between the visual canvas and the raw project schema.

## 🏗️ Architecture

Brainstorm is built with a modular, scalable architecture:

- **`src/canvas`**: Core rendering logic and phone frame simulation.
- **`src/editor`**: The Inspector panel and property controls.
- **`src/layers`**: Nested hierarchy management.
- **`src/export`**: Advanced logic for mapping JSON schemas to production React Native code.
- **`src/hooks`**: Custom state management for complex pointer interactions and element lifecycle.

## 🛠️ Tech Stack

- **Framework:** React 19 (Vite)
- **Styling:** Modern CSS (Dark Theme, Glassmorphism)
- **Interactions:** Native Pointer Events API
- **Exports:** JSZip, FileSaver
- **Code Gen:** Dynamic Component Mapping

## 📦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build your UI and click **Export App** to get your React Native project.

## 🗺️ Future Roadmap

- [ ] Real-time collaboration via WebSockets
- [ ] Component Marketplace integration
- [ ] Direct export to GitHub/Vercel
- [ ] Native support for Animation (Reanimated) logic

---

Built with ❤️ for the mobile development community.
