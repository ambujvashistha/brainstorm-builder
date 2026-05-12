import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ELEMENT_TYPES } from "../registry/elementRegistry";

const mapTypeToRN = (type) => {
  switch (type) {
    case ELEMENT_TYPES.TEXT: return "Text";
    case ELEMENT_TYPES.IMAGE: return "Image";
    case ELEMENT_TYPES.BUTTON: return "TouchableOpacity";
    case ELEMENT_TYPES.SAFE_AREA: return "SafeAreaView";
    case ELEMENT_TYPES.SCROLL_VIEW: return "ScrollView";
    case ELEMENT_TYPES.TEXT_INPUT: return "TextInput";
    default: return "View";
  }
};

const getStyle = (el) => {
  const s = {};
  if (!el.parentId) {
    s.position = "absolute";
    s.left = el.x;
    s.top = el.y;
  }
  if (el.width) s.width = el.width;
  if (el.height) s.height = el.height;
  if (el.backgroundColor) s.backgroundColor = el.backgroundColor;
  if (el.borderRadius) s.borderRadius = el.borderRadius;
  if (el.padding) s.padding = el.padding;
  if (el.gap) s.gap = el.gap;
  if (el.flexDirection) s.flexDirection = el.flexDirection;
  if (el.justifyContent) s.justifyContent = el.justifyContent;
  if (el.alignItems) s.alignItems = el.alignItems;
  if (el.fontSize) s.fontSize = el.fontSize;
  if (el.fontWeight) s.fontWeight = String(el.fontWeight);
  if (el.color) s.color = el.color;
  if (el.textAlign) s.textAlign = el.textAlign;
  return s;
};

const renderElements = (parentId, elements, allStyles) => {
  const children = elements.filter(el => el.parentId === parentId);
  return children.map(el => {
    const component = mapTypeToRN(el.type);
    const styleName = `el_${el.id.replace(/-/g, '_')}`;
    allStyles[styleName] = getStyle(el);
    
    const props = [`style={styles.${styleName}}`];
    if (el.type === ELEMENT_TYPES.IMAGE) props.push(`source={{ uri: "${el.src}" }}`);
    if (el.type === ELEMENT_TYPES.TEXT_INPUT) props.push(`placeholder="${el.placeholder}"`);
    if (el.interactionType === "navigate") props.push(`onPress={() => navigation.navigate("${el.targetPageId}")}`);

    const inner = el.text || renderElements(el.id, elements, allStyles).join("\n");
    
    return `<${component} ${props.join(" ")}>${inner ? `\n${inner}\n` : ""}</${component}>`;
  }).join("\n");
};

export async function generateProjectZip(elements, pages, navigationConfig) {
  const zip = new JSZip();
  const src = zip.folder("src");
  const screens = src.folder("screens");
  const navigation = src.folder("navigation");

  // 1. Generate Screens
  pages.forEach(page => {
    const allStyles = {};
    const content = renderElements(null, page.elements, allStyles);
    const screenCode = `
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, TextInput, StyleSheet } from 'react-native';

export default function ${page.name.replace(/\s/g, '')}Screen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        ${content}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  ${Object.entries(allStyles).map(([k, v]) => `${k}: ${JSON.stringify(v, null, 2)}`).join(",\n  ")}
});
`;
    screens.file(`${page.name.replace(/\s/g, '')}Screen.js`, screenCode);
  });

  // 2. Generate Navigation
  const navCode = `
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

${pages.map(p => `import ${p.name.replace(/\s/g, '')}Screen from '../screens/${p.name.replace(/\s/g, '')}Screen';`).join("\n")}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      ${navigationConfig.tabs.map(tab => {
        const page = pages.find(p => p.id === tab.targetPageId);
        return `<Tab.Screen name="${tab.label}" component={${page?.name.replace(/\s/g, '')}Screen} />`;
      }).join("\n      ")}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      ${navigationConfig.enabled ? "<TabNavigator />" : `
      <Stack.Navigator>
        ${pages.map(p => `<Stack.Screen name="${p.name}" component={${p.name.replace(/\s/g, '')}Screen} />`).join("\n        ")}
      </Stack.Navigator>
      `}
    </NavigationContainer>
  );
}
`;
  navigation.file("AppNavigator.js", navCode);

  // 3. Main App.js
  zip.file("App.js", `
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
`);

  // 4. package.json
  const packageJson = {
    name: "brainstorm-project",
    version: "1.0.0",
    scripts: { "start": "expo start" },
    dependencies: {
      "expo": "~51.0.0",
      "react": "18.2.0",
      "react-native": "0.74.1",
      "@react-navigation/native": "^6.1.17",
      "@react-navigation/native-stack": "^6.9.26",
      "@react-navigation/bottom-tabs": "^6.5.20",
      "react-native-safe-area-context": "4.10.1",
      "react-native-screens": "3.31.1"
    }
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "brainstorm-project.zip");
}
