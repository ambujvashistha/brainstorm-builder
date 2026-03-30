import { useState } from "react";
import Canvas from "../builder/Canvas";

export default function BuilderScreen() {
    const [elements, setElements] = useState([
      { x: 50, y: 50, text: "A" },
      { x: 120, y: 120, text: "B" },
    ]);
    
    return (
        <Canvas elements={elements}/>
    );
}
