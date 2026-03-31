import { useState } from "react";
import Canvas from "../builder/Canvas";

export default function BuilderScreen() {
    const [activeIndex, setActiveIndex] = useState(null);
    
    const [elements, setElements] = useState([
      { x: 50, y: 50, text: "A" },
      { x: 120, y: 120, text: "B" },
    ]);

    function newElement(){
        setElements((prev) => [...prev, { x: 50, y: 50, text: "new text" }]);
    }
    console.log("active index",activeIndex)
    return (
      <>
        <button onClick={newElement}>Add text</button>
        <Canvas elements={elements} setActiveIndex ={setActiveIndex}/>
      </>
    );
}
