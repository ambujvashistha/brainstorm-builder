import { ELEMENT_TYPES } from "../registry/elementRegistry";

export function exportToReactNative(elements) {
  const styles = {};

  const mapTypeToComponent = (type) => {
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

  const getStyleForElement = (el) => {
    const s = {};
    if (!el.parentId) {
      s.position = "absolute";
      s.left = el.x;
      s.top = el.y;
    }

    if (el.width && el.width !== "100%") s.width = el.width;
    if (el.height && el.height !== "100%") s.height = el.height;
    if (el.width === "100%") s.alignSelf = "stretch";

    // Flex
    if (el.flexDirection) s.flexDirection = el.flexDirection;
    if (el.justifyContent) s.justifyContent = el.justifyContent;
    if (el.alignItems) s.alignItems = el.alignItems;
    if (el.gap) s.gap = el.gap;
    if (el.padding) s.padding = el.padding;
    if (el.flex) s.flex = el.flex;

    // Decoration
    if (el.backgroundColor) s.backgroundColor = el.backgroundColor;
    if (el.borderRadius) s.borderRadius = el.borderRadius;
    if (el.shadow) s.shadowColor = "#000", s.shadowOffset = { width: 0, height: 2 }, s.shadowOpacity = 0.1, s.shadowRadius = 4;

    // Typography
    if (el.fontSize) s.fontSize = el.fontSize;
    if (el.fontWeight) s.fontWeight = el.fontWeight;
    if (el.color) s.color = el.color;
    if (el.textAlign) s.textAlign = el.textAlign;
    if (el.lineHeight) s.lineHeight = el.lineHeight * (el.fontSize || 16);

    return s;
  };

  const renderRecursive = (parentId, depth = 1) => {
    const indent = "  ".repeat(depth);
    const children = elements.filter(el => el.parentId === parentId);
    
    return children.map(el => {
      const componentName = mapTypeToComponent(el.type);
      const styleName = `el_${el.id.replace(/-/g, "_")}`;
      styles[styleName] = getStyleForElement(el);

      const hasChildren = elements.some(child => child.parentId === el.id);
      const props = [`style={styles.${styleName}}`];

      if (el.type === ELEMENT_TYPES.IMAGE) {
        props.push(`source={{ uri: '${el.src}' }}`);
        return `${indent}<${componentName} ${props.join(" ")} />`;
      }

      if (el.type === ELEMENT_TYPES.TEXT_INPUT) {
        props.push(`placeholder="${el.placeholder || ''}"`);
        return `${indent}<${componentName} ${props.join(" ")} />`;
      }

      const content = el.text || "";
      if (hasChildren) {
        return `${indent}<${componentName} ${props.join(" ")}>\n${renderRecursive(el.id, depth + 1).join("\n")}\n${indent}</${componentName}>`;
      } else if (content) {
        return `${indent}<${componentName} ${props.join(" ")}>${content}</${componentName}>`;
      } else {
        return `${indent}<${componentName} ${props.join(" ")} />`;
      }
    });
  };

  const componentsJSX = renderRecursive(null).join("\n");

  const code = `
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

export default function App() {
  return (
    <View style={styles.screen}>
${componentsJSX}
    </View>
  );
}

const styles = StyleSheet.create(${JSON.stringify({
    screen: { flex: 1, backgroundColor: '#F5F5F7' },
    ...styles
  }, null, 2)});
`;

  return code;
}
