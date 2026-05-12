import JSZip from "jszip";
import { saveAs } from "file-saver";
import { exportToReactNative } from "./exportToReactNative";

export async function generateProjectZip(elements, pages, navigationConfig) {
  const zip = new JSZip();
  
  // App.js / App.tsx
  const appCode = exportToReactNative(elements, pages, navigationConfig);
  zip.file("App.js", appCode);

  // package.json for the exported project
  const packageJson = {
    name: "brainstorm-project",
    version: "1.0.0",
    main: "node_modules/expo/AppEntry.js",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web"
    },
    dependencies: {
      "expo": "~51.0.0",
      "expo-status-bar": "~1.12.1",
      "react": "18.2.0",
      "react-native": "0.74.1",
      "@react-navigation/native": "^6.1.17",
      "@react-navigation/native-stack": "^6.9.26",
      "@react-navigation/bottom-tabs": "^6.5.20",
      "react-native-safe-area-context": "4.10.1",
      "react-native-screens": "3.31.1"
    },
    devDependencies: {
      "@babel/core": "^7.20.0"
    },
    private: true
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  // Basic README
  zip.file("README.md", "# Brainstorm Generated Project\n\nThis project was generated using Brainstorm Builder.\n\n## Getting Started\n\n1. Install dependencies: `npm install` or `yarn install`\n2. Run the project: `npx expo start`\n");

  // Generate the zip file
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "brainstorm-project.zip");
}
