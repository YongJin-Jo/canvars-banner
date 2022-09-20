import { ElementsInfo, ElementsPencilPosition, ElementsPosition } from "../../../types/canvarsDefine";

  export {
    positionWithinElement,
    adjustElementCoordinates,
    CalculatesMovingPoints,
  }
  
  function positionWithinElement(
    x: number,
    y: number,
    element: ElementsInfo
  ): any {
    
    const { type, points } = element;
    const index = points.length - 1;
  
    switch (type) {
      case 'line': {
        const { x1, y1, x2, y2 } = points[index] as ElementsPosition;
        const on = onLine(x1, y1, x2, y2, x, y, 1);
        const start = nearPoint(x, y, x1, y1, 'start');
        const end = nearPoint(x, y, x2, y2, 'end');
  
        return on || start || end;
      }
      case 'rect': {
        const { x1, y1, x2, y2 } = points[index] as ElementsPosition;
  
        const topLeft = nearPoint(x, y, x1, y1, 'tl');
        const topRight = nearPoint(x, y, x2, y1, 'tr');
        const bottomLeft = nearPoint(x, y, x1, y2, 'bl');
        const bottomRight = nearPoint(x, y, x2, y2, 'br');
        const inside = x > x1 && x < x2 && y > y1 && y < y2 ? 'inside' : null;
        return topLeft || topRight || bottomLeft || bottomRight || inside;
      }
      case 'pencil': {
        const betweenAnyPoint = element.points.some((point, index) => {
          const nextPoint = points[index + 1] as ElementsPencilPosition;
          if (!nextPoint) return false;
          return onLine(point.x1, point.y1, nextPoint.x1, nextPoint.y1, x, y, 5);
        });
  
        const onPath = betweenAnyPoint ? 'inside' : null;
        return onPath;
      }
      case 'text': {
        const [{ x1, y1, x2, y2 }] = points as ElementsPosition[];
        
        return x >= x1 && y >= y1 && x <= x2 && y <= y2 ? 'inside' : null;
      }
    }
  }
  
  function adjustElementCoordinates(element: ElementsInfo) {
    const { type, points } = element;
    const index = points.length - 1;
    const { x1, y1, x2, y2 } = points[index] as ElementsPosition;
  
    if (type === 'rect') {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
  
      return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    } else {
      if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
      } else {
        return { x1, y1, x2, y2 };
      }
    }
  }
  
  function onLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number,
    Maxdistance: number
  ) {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < Maxdistance ? 'inside' : null;
  }
  
  function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
  
  function nearPoint(x: number, y: number, x1: number, y1: number, name: string) {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
  }
  
  // action moving event
  function CalculatesMovingPoints(
    point: ElementsPosition[],
    clientX: number,
    clientY: number,
    offsetX: number,
    offsetY: number
  ) {
    const Index = point.length - 1;
    const prevPoints = point[Index] as ElementsPosition;
    const w = prevPoints.x2 - prevPoints.x1;
    const h = prevPoints.y2 - prevPoints.y1;
    const newX1 = clientX - (offsetX as number);
    const newY1 = clientY - (offsetY as number);
    return { newX1, newY1, w, h };
  }
  