const MIN_CARD_WIDTH = 90;
const MIN_CARD_HEIGHT = 44;

export function normalizeElementToCanvas(element, canvas) {
  const maxWidth = Math.max(MIN_CARD_WIDTH, canvas.width - element.x);
  const maxHeight = Math.max(MIN_CARD_HEIGHT, canvas.height - element.y);
  const width = Math.max(MIN_CARD_WIDTH, Math.min(element.width, maxWidth));
  const height = Math.max(MIN_CARD_HEIGHT, Math.min(element.height, maxHeight));

  return {
    ...element,
    width,
    height,
    x: Math.max(0, Math.min(element.x, canvas.width - width)),
    y: Math.max(0, Math.min(element.y, canvas.height - height)),
  };
}

export function normalizeElements(elements, canvas) {
  return elements.map((element) => normalizeElementToCanvas(element, canvas));
}
