# Brainstorm Builder

A browser-based visual editor for arranging and structuring ideas on a fixed canvas.  
It allows users to place, move, resize, and edit elements while generating a clean layout representation as JSON.

---

## Overview

Brainstorm Builder is a lightweight layout editor inspired by tools like Figma and Canva, focused on simplicity and structured output.

It enables users to visually organize content and export the layout in a format that can be reused in other applications.

---

## Current Features

- Drag and position elements within a bounded canvas
- Resize elements using corner handles
- Edit text directly on the canvas
- Supports multiple element types
  - Text
  - Image (with placeholder support)
  - Container
- Element selection and highlighting
- Live mobile preview with fixed dimensions
- Export layout as JSON
- Load layout from JSON

---

## Tech Stack

- React (Vite)
- JavaScript
- CSS

---

## Project Structure

    src/
      builder/
        Canvas.jsx
        EditPanel.jsx
        JsonPanel.jsx
      screens/
        BuilderScreen.jsx
      components/
      hooks/
      utils/


---

## How to Use

- Add elements using the available controls
- Click on an element to select it
- Drag elements to reposition them within the canvas
- Use the corner handle to resize
- Double click text to edit
- Use the preview option to view the layout in a mobile format
- Export JSON to save the layout
- Load JSON to restore a previous layout

---

## Current Scope

This project focuses on layout creation and structured output.

It is not intended to be a full design tool, but a simplified editor for generating reusable layout definitions.

---

## Future Improvements

- Alignment guides and snapping
- Layer management
- Undo and redo support
- Image upload support
- Export as image
- Improved mobile preview behavior

---

## Purpose

This project demonstrates:

- Handling complex UI interactions (drag, resize, selection)
- State management for dynamic layouts
- Mapping visual layout to structured data
- Building a simplified design editor from scratch
