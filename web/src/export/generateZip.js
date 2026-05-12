import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ELEMENT_TYPES } from "../registry/elementRegistry";

// Helper to determine used pages
const getUsedPageIds = (pages, navigationConfig) => {
  const usedIds = new Set();
  
  // 1. Initial pages from navigation
  if (navigationConfig?.enabled && Array.isArray(navigationConfig.tabs)) {
    navigationConfig.tabs.forEach(tab => {
      if (tab.targetPageId) usedIds.add(tab.targetPageId);
    });
  } else if (pages.length > 0) {
    usedIds.add(pages[0].id);
  }

  // 2. Recursively find pages linked via navigation actions
  const scanElements = (elements) => {
    if (!Array.isArray(elements)) return;
    elements.forEach(el => {
      if (el.interactionType === "navigate" && el.targetPageId) {
        if (!usedIds.has(el.targetPageId)) {
          usedIds.add(el.targetPageId);
          const targetPage = pages.find(p => p.id === el.targetPageId);
          if (targetPage) scanElements(targetPage.elements);
        }
      }
    });
  };

  Array.from(usedIds).forEach(id => {
    const page = pages.find(p => p.id === id);
    if (page) scanElements(page.elements);
  });

  return usedIds;
};

const mapTypeToComponent = (type, el) => {
  if (el?.interactionType === "navigate") return "AppButton";
  switch (type) {
    case ELEMENT_TYPES.TEXT: return "AppText";
    case ELEMENT_TYPES.IMAGE: return "Image";
    case ELEMENT_TYPES.BUTTON: return "AppButton";
    case ELEMENT_TYPES.CARD: return "AppCard";
    case ELEMENT_TYPES.CONTAINER: return "View";
    case ELEMENT_TYPES.SAFE_AREA: return "SafeAreaView";
    case ELEMENT_TYPES.SCROLL_VIEW: return "ScrollView";
    case ELEMENT_TYPES.TEXT_INPUT: return "AppInput";
    case ELEMENT_TYPES.ICON: return "Ionicons";
    case ELEMENT_TYPES.ROW: return "Row";
    case ELEMENT_TYPES.COLUMN: return "Column";
    default: return "View";
  }
};

const mapLucideToIonicons = (name) => {
  const mapping = {
    'user': 'person',
    'bell': 'notifications',
    'plus': 'add',
    'trash': 'trash-outline',
    'check': 'checkmark',
    'x': 'close',
    'mail': 'mail-outline',
    'camera': 'camera-outline',
    'share': 'share-social',
    'heart': 'heart-outline',
    'chevronright': 'chevron-forward',
    'chevronleft': 'chevron-back',
    'search': 'search-outline',
    'settings': 'settings-outline',
    'home': 'home-outline',
    'circle': 'ellipse-outline'
  };
  const normalized = (name || '').toLowerCase();
  return mapping[normalized] || normalized;
};

const getStyle = (el, pageElements) => {
  const s = {};
  const parent = pageElements.find(p => p.id === el.parentId);
  const isFlowParent = parent && (parent.type === "row" || parent.type === "column");
  const isAbsolute = !el.parentId || !isFlowParent;

  if (isAbsolute) {
    s.position = "absolute";
    s.left = typeof el.x === 'number' ? el.x : 0;
    s.top = typeof el.y === 'number' ? el.y : 0;
  }

  if (el.width) s.width = el.width === "100%" ? "100%" : (Number(el.width) || el.width);
  if (el.height) s.height = el.height === "100%" ? "100%" : (Number(el.height) || el.height);

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

const renderElements = (parentId, elements, allStyles, pages, usedComponents) => {
  const children = elements.filter(el => el.parentId === parentId);
  return children.map(el => {
    const component = mapTypeToComponent(el.type, el);
    if (usedComponents) usedComponents.add(component);
    const styleName = `el_${el.id.replace(/-/g, '_')}`;
    allStyles[styleName] = getStyle(el, elements);
    
    const props = [`style={styles.${styleName}}`];
    if (el.type === ELEMENT_TYPES.IMAGE) props.push(`source={{ uri: "${el.src}" }}`);
    if (el.type === ELEMENT_TYPES.TEXT_INPUT) props.push(`placeholder="${el.placeholder || ""}"`);
    if (el.interactionType === "navigate" && el.targetPageId) {
      const targetPage = pages.find(p => p.id === el.targetPageId);
      props.push(`onPress={() => navigation.navigate("${targetPage?.name || "Home"}")}`);
    }

    if (el.type === ELEMENT_TYPES.ICON) {
      props.push(`name="${mapLucideToIonicons(el.iconName)}"`);
      props.push(`size={${el.size || 24}}`);
      props.push(`color="${el.color || "#000"}"`);
    }

    const hasChildren = elements.some(child => child.parentId === el.id);
    const inner = el.text || (hasChildren ? renderElements(el.id, elements, allStyles, pages, usedComponents) : "");
    
    if (el.type === ELEMENT_TYPES.TEXT) {
      return `<AppText ${props.join(" ")}>${el.text || ""}</AppText>`;
    }

    if (el.type === ELEMENT_TYPES.ICON) {
      return `<Ionicons ${props.join(" ")} />`;
    }
    
    return `<${component} ${props.join(" ")}>${inner ? `\n${inner}\n` : ""}</${component}>`;
  }).join("\n");
};

export async function generateProjectZip(elements, pages, navigationConfig) {
  const zip = new JSZip();
  const usedPageIds = getUsedPageIds(pages, navigationConfig);
  const usedPages = pages.filter(p => usedPageIds.has(p.id));
  const usedComponents = new Set();
// 1. Structure
const src = zip.folder("src");
const screens = src.folder("screens");
const componentsFolder = src.folder("components");
const navFolder = src.folder("navigation");
const theme = src.folder("theme");
const styles = src.folder("styles");
const generated = src.folder("generated");
const assets = zip.folder("assets");

generated.file("metadata.json", JSON.stringify({ version: "1.0.0", generatedAt: new Date().toISOString() }, null, 2));


  // 2. Process Screens First to track usage
  const screensData = usedPages.map(page => {
    const allStyles = {};
    const content = renderElements(null, page.elements || [], allStyles, pages, usedComponents);
    const screenName = (page.name || "Untitled").replace(/\s/g, '');
    
    // Track RN components used in this specific screen
    const screenRNComponents = new Set(["View", "StyleSheet", "SafeAreaView", "ScrollView"]);
    if (content.includes("<Image")) screenRNComponents.add("Image");
    
    return { screenName, content, allStyles, page, screenRNComponents };
  });

  // 3. UI & Layout Components (Conditional)
  if (usedComponents.has("AppButton")) {
    const ui = componentsFolder.folder("ui");
    ui.file("AppButton.jsx", `
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AppButton({ children, style, onPress, textStyle }) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderRadius: 8, backgroundColor: '#007AFF', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' }
});
`);
  }

  if (usedComponents.has("AppText")) {
    const ui = componentsFolder.folder("ui") || componentsFolder.folder("ui"); // Ensure it exists
    ui.file("AppText.jsx", `
import React from 'react';
import { Text } from 'react-native';

export default function AppText({ children, style }) {
  return <Text style={style}>{children}</Text>;
}
`);
  }

  if (usedComponents.has("AppCard")) {
    const ui = componentsFolder.folder("ui");
    ui.file("AppCard.jsx", `
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function AppCard({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }
});
`);
  }

  if (usedComponents.has("AppInput")) {
    const ui = componentsFolder.folder("ui");
    ui.file("AppInput.jsx", `
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function AppInput({ style, ...props }) {
  return <TextInput style={[styles.input, style]} {...props} />;
}

const styles = StyleSheet.create({
  input: { height: 48, padding: 12, borderRadius: 8, backgroundColor: '#f0f0f0' }
});
`);
  }

  if (usedComponents.has("Row")) {
    const layout = componentsFolder.folder("layout");
    layout.file("Row.jsx", `
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Row({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' }
});
`);
  }

  if (usedComponents.has("Column")) {
    const layout = componentsFolder.folder("layout");
    layout.file("Column.jsx", `
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Column({ children, style }) {
  return <View style={[styles.column, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  column: { flexDirection: 'column' }
});
`);
  }

  // 4. Theme & Styles
  theme.file("colors.js", "export default { primary: '#007AFF', background: '#F5F5F7', text: '#1D1D1F' };");
  styles.file("globalStyles.js", "import { StyleSheet } from 'react-native'; export const globalStyles = StyleSheet.create({ container: { flex: 1 } });");

  // 5. Generate Screens
  screensData.forEach(({ screenName, content, allStyles, screenRNComponents }) => {
    const screenCode = `
import React from 'react';
import { ${Array.from(screenRNComponents).join(", ")} } from 'react-native';
${content.includes("<Ionicons") ? "import { Ionicons } from '@expo/vector-icons';" : ""}
${usedComponents.has("AppText") ? "import AppText from '../components/ui/AppText';" : ""}
${usedComponents.has("AppButton") ? "import AppButton from '../components/ui/AppButton';" : ""}
${usedComponents.has("AppCard") ? "import AppCard from '../components/ui/AppCard';" : ""}
${usedComponents.has("AppInput") ? "import AppInput from '../components/ui/AppInput';" : ""}
${usedComponents.has("Row") ? "import Row from '../components/layout/Row';" : ""}
${usedComponents.has("Column") ? "import Column from '../components/layout/Column';" : ""}

export default function ${screenName}Screen({ navigation }) {
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
    screens.file(`${screenName}Screen.jsx`, screenCode);
  });

  // 5. Navigation
  const tabs = Array.isArray(navigationConfig?.tabs) ? navigationConfig.tabs : [];
  const navCode = `
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
${tabs.length > 0 ? "import { Ionicons } from '@expo/vector-icons';" : ""}

${usedPages.map(p => `import ${(p.name || "Untitled").replace(/\s/g, '')}Screen from '../screens/${(p.name || "Untitled").replace(/\s/g, '')}Screen';`).join("\n")}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      ${tabs.map(tab => {
        const page = usedPages.find(p => p.id === tab.targetPageId);
        if (!page) return null;
        const iconName = mapLucideToIonicons(tab.icon);
        return `<Tab.Screen 
        name="${tab.label}" 
        component={${(page.name || "Untitled").replace(/\s/g, '')}Screen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="${iconName}" size={size} color={color} />
          ),
        }}
      />`;
      }).filter(Boolean).join("\n      ")}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      ${navigationConfig?.enabled ? "<TabNavigator />" : `
      <Stack.Navigator>
        ${usedPages.map(p => `<Stack.Screen name="${p.name || "Untitled"}" component={${(p.name || "Untitled").replace(/\s/g, '')}Screen} />`).join("\n        ")}
      </Stack.Navigator>
      `}
    </NavigationContainer>
  );
}
`;
  navFolder.file("AppNavigator.jsx", navCode);

  // 6. Boilerplate
  zip.file("App.js", `
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
`);

  zip.file("app.json", JSON.stringify({
    expo: {
      name: "my-app",
      slug: "my-app",
      version: "1.0.0",
      orientation: "portrait",
      userInterfaceStyle: "light",
      assetBundlePatterns: ["**/*"],
      ios: { supportsTablet: true }
    }
  }, null, 2));

  zip.file("babel.config.js", "module.exports = function(api) { api.cache(true); return { presets: ['babel-preset-expo'] }; };");

  zip.file("metro.config.js", `const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
`);

  zip.file("index.js", `import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
`);

  const packageJson = {
    name: "my-app",
    version: "1.0.0",
    main: "index.js",
    scripts: { "start": "expo start", "android": "expo start --android", "ios": "expo start --ios", "web": "expo start --web" },
    dependencies: {
      "expo": "~52.0.0",
      "expo-status-bar": "~2.0.0",
      "expo-asset": "~11.0.0",
      "react": "18.3.1",
      "react-native": "0.76.0",
      "@react-navigation/native": "^7.0.0",
      "@react-navigation/native-stack": "^7.0.0",
      "@react-navigation/bottom-tabs": "^7.0.0",
      "react-native-safe-area-context": "4.12.0",
      "react-native-screens": "~4.0.0",
      "@expo/vector-icons": "^14.0.0"
    },
    devDependencies: { 
      "@babel/core": "^7.20.0",
      "babel-preset-expo": "~12.0.0"
    },
    private: true
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  zip.file("README.md", "# My Brainstorm App\n\nGenerated with Brainstorm Builder.\n\n## How to run\n\n1. Install dependencies: `npm install`\n2. Start the project: `npm start` ");

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "my-app.zip");
}
