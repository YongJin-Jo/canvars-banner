// 이벤트에 따라 커서 이미지 변경
export function cursorForPosition(position: unknown): string {
    switch (position) {
      case 'tl':
      case 'br':
      case 'end':
      case 'start':
        return 'nwse-resize';
      case 'tr':
      case 'bl':
        return 'sw-resize';
      default:
        return 'move';
    }
  }
  