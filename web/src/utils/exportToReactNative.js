import { ELEMENT_TYPES } from "../registry/elementRegistry";

export function exportToReactNative(elements, canvasSize) {
  const styles = {};
  
  const components = elements.map((el) => {
    const styleName = `el_${el.id.replace(/-/g, "_")}`;
    
    styles[styleName] = {
      position: "absolute",
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height,
    };

    if (el.type === ELEMENT_TYPES.TEXT) {
      styles[styleName].fontSize = el.fontSize || 16;
      styles[styleName].color = el.color || "#191c1d";
      return `      <Text style={styles.${styleName}}>${el.text}</Text>`;
    }

    if (el.type === ELEMENT_TYPES.IMAGE) {
      return `      <Image source={{ uri: '${el.src}' }} style={styles.${styleName}} />`;
    }

    if (el.type === ELEMENT_TYPES.CONTAINER) {
      styles[styleName].backgroundColor = el.backgroundColor || "#e7e8e9";
      styles[styleName].borderRadius = el.borderRadius || 12;
      return `      <View style={styles.${styleName}} />`;
    }

    if (el.type === ELEMENT_TYPES.BUTTON) {
      styles[styleName].backgroundColor = el.backgroundColor || "#3b82f6";
      styles[styleName].borderRadius = el.borderRadius || 8;
      styles[styleName].alignItems = "center";
      styles[styleName].justifyContent = "center";
      
      const textStyleName = `${styleName}_text`;
      styles[textStyleName] = {
        color: el.color || "#ffffff",
        fontSize: el.fontSize || 14,
        fontWeight: "600",
      };

      return `      <TouchableOpacity style={styles.${styleName}}>
        <Text style={styles.${textStyleName}}>${el.text}</Text>
      </TouchableOpacity>`;
    }

    return "";
  }).filter(Boolean).join("\n");

  const code = `
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';

export default function GeneratedApp() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.canvas}>
${components}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(${JSON.stringify({
    container: { flex: 1, backgroundColor: '#fff' },
    canvas: { width: canvasSize.width, height: canvasSize.height, position: 'relative' },
    ...styles
  }, null, 2)});
`;

  return code;
}
