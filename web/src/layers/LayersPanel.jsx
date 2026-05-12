import { ELEMENT_TYPES, elementRegistry } from "../registry/elementRegistry";

export default function LayersPanel({ elements, activeId, onSelect, onRename }) {
  const renderLayer = (element, depth = 0) => {
    const isActive = element.id === activeId;
    const children = elements.filter(el => el.parentId === element.id);
    const label = elementRegistry[element.type]?.label || "Element";

    return (
      <div key={element.id} className="layer-group">
        <div 
          className={`layer-item ${isActive ? "is-active" : ""}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onSelect(element.id)}
        >
          <span className="layer-item__icon">
            {element.type === ELEMENT_TYPES.CONTAINER ? "□" : "T"}
          </span>
          <span className="layer-item__name">
            {element.text || label}
          </span>
        </div>
        {children.map(child => renderLayer(child, depth + 1))}
      </div>
    );
  };

  const rootElements = elements.filter(el => !el.parentId);

  return (
    <div className="layers-panel">
      {rootElements.length === 0 ? (
        <div className="empty-state">No layers yet</div>
      ) : (
        rootElements.map(el => renderLayer(el))
      )}
    </div>
  );
}
