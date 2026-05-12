import { ELEMENT_TYPES } from "../registry/elementRegistry";

export function exportToReactNative(activeElements, pages, navigationConfig) {
  const allStyles = {};

  const mapTypeToComponent = (type, el) => {
    if (el?.interactionType === "navigate") return "TouchableOpacity";
    switch (type) {
      case ELEMENT_TYPES.TEXT: return "Text";
      case ELEMENT_TYPES.IMAGE: return "Image";
      case ELEMENT_TYPES.BUTTON: return "TouchableOpacity";
      case ELEMENT_TYPES.ICON: return "Ionicons";
      case ELEMENT_TYPES.SAFE_AREA: return "SafeAreaView";
      case ELEMENT_TYPES.SCROLL_VIEW:
      case ELEMENT_TYPES.FLAT_LIST:
      case ELEMENT_TYPES.FLAT_LIST_HORIZONTAL:
        return "ScrollView";
      case ELEMENT_TYPES.TEXT_INPUT: return "TextInput";
      default: return "View";
    }
  };

  const getStyleForElement = (el, pageElements) => {
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

    if (el.flexDirection) s.flexDirection = el.flexDirection;
    if (el.justifyContent) s.justifyContent = el.justifyContent;
    if (el.alignItems) s.alignItems = el.alignItems;
    if (el.gap) s.gap = el.gap;
    if (el.padding) s.padding = el.padding;
    if (el.flex) s.flex = el.flex;

    if (el.backgroundColor) s.backgroundColor = el.backgroundColor;
    if (el.borderRadius) s.borderRadius = el.borderRadius;

    if (el.shadow) {
      s.shadowColor = "#000";
      s.shadowOffset = { width: 0, height: 2 };
      s.shadowOpacity = 0.1;
      s.shadowRadius = 4;
      s.elevation = 3;
    }

    if (el.type === ELEMENT_TYPES.BUTTON) {
      s.justifyContent = 'center';
      s.alignItems = 'center';
    }

    if (el.fontSize) s.fontSize = el.fontSize;
    if (el.fontWeight) s.fontWeight = el.fontWeight.toString();
    if (el.color) s.color = el.color;
    if (el.textAlign) s.textAlign = el.textAlign;

    return s;
  };

  const renderRecursive = (parentId, pageElements, depth = 1) => {
    const indent = "  ".repeat(depth);
    const children = pageElements.filter(el => el.parentId === parentId);
    
    return children.map(el => {
      const componentName = mapTypeToComponent(el.type, el);
      const styleKey = `el_${el.id.replace(/-/g, "_")}`;
      allStyles[styleKey] = getStyleForElement(el, pageElements);

      const hasChildren = pageElements.some(child => child.parentId === el.id);
      const props = [`style={styles.${styleKey}}`];

      if (el.horizontal) props.push(`horizontal={true}`);
      if (el.interactionType === "navigate" && el.targetPageId) {
        const targetPage = pages.find(p => p.id === el.targetPageId);
        props.push(`onPress={() => navigation.navigate('${targetPage?.name || 'Home'}')}`);
      }

      if (el.type === ELEMENT_TYPES.IMAGE) {
        props.push(`source={{ uri: '${el.src}' }}`);
        return `${indent}<${componentName} ${props.join(" ")} />`;
      }

      if (el.type === ELEMENT_TYPES.TEXT_INPUT) {
        props.push(`placeholder="${el.placeholder || ''}"`);
        return `${indent}<${componentName} ${props.join(" ")} />`;
      }

      if (el.type === ELEMENT_TYPES.ICON) {
        const iconName = (el.iconName || "circle").toLowerCase();
        props.push(`name="${iconName}"`);
        props.push(`size={${el.size || 24}}`);
        props.push(`color="${el.color || '#000'}"`);
        return `${indent}<${componentName} ${props.join(" ")} />`;
      }

      const content = el.text || "";
      if (el.type === ELEMENT_TYPES.BUTTON) {
        const textStyleKey = `${styleKey}_text`;
        allStyles[textStyleKey] = {
          color: el.color || '#FFFFFF',
          fontSize: el.fontSize || 16,
          fontWeight: (el.fontWeight || '600').toString(),
        };
        return `${indent}<${componentName} ${props.join(" ")}>\n${indent}  <Text style={styles.${textStyleKey}}>${content}</Text>\n${indent}</${componentName}>`;
      }

      if (hasChildren) {
        return `${indent}<${componentName} ${props.join(" ")}>\n${renderRecursive(el.id, pageElements, depth + 1).join("\n")}\n${indent}</${componentName}>`;
      } else if (content) {
        return `${indent}<${componentName} ${props.join(" ")}>${content}</${componentName}>`;
      } else {
        return `${indent}<${componentName} ${props.join(" ")} />`;
      }
    });
  };

  const screenComponents = pages.map(page => {
    const name = page.name.replace(/\s/g, '');
    const content = renderRecursive(null, page.elements, 3).join("\n");
    return `function ${name}Screen({ navigation }) {\n  return (\n    <SafeAreaView style={styles.screen}>\n      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>\n${content}\n      </ScrollView>\n    </SafeAreaView>\n  );\n}`;
  }).join("\n\n");

  const navigationJSX = navigationConfig?.enabled ? `
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      ${navigationConfig.tabs.map(tab => {
        const targetPage = pages.find(p => p.id === tab.targetPageId);
        return `<Tab.Screen name="${targetPage?.name || 'Home'}" component={${targetPage?.name.replace(/\s/g, '') || 'Home'}Screen} />`;
      }).join("\n      ")}
    </Tab.Navigator>
  );
}
` : '';

  const mainAppJSX = navigationConfig?.enabled ? `
export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
` : `
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        ${pages.map(p => `<Stack.Screen name="${p.name}" component={${p.name.replace(/\s/g, '')}Screen} />`).join("\n        ")}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`;

  return `
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${navigationConfig?.enabled ? "import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';" : ""}

const Stack = createNativeStackNavigator();

${screenComponents}

${navigationJSX}

${mainAppJSX}

const styles = StyleSheet.create(${JSON.stringify({
    screen: { 
      flex: 1, 
      backgroundColor: '#F5F5F7',
    },
    ...allStyles
  }, null, 2)});
`;
}
