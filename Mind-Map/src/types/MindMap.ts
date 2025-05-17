export interface Position {
  x: number;
  y: number;
}

export type NodeShape = 'rectangle' | 'ellipse' | 'diamond' | 'hexagon';

export interface Connection {
  start: string;
  end: string;
  color?: string;
  label?: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  parentId: string | null;
  children: string[];
  color: string;
  position: Position;
  isExpanded: boolean;
  shape: NodeShape;
  fontSize?: number;
  textColor?: string;
  borderColor?: string;
}

export interface MindMap {
  nodes: Record<string, MindMapNode>;
  rootId: string;
  connections: Connection[];
}

export const NODE_COLORS = [
  '#F9CEEE', // Light Pink
  '#FAEDCB', // Cream
  '#C9E4DE', // Mint
  '#C6DEF1', // Light Blue
  '#DBCDF0', // Lavender
  '#F2C6DE', // Rose
  '#F7D9C4', // Peach
  '#E2CFC4', // Taupe
  '#E2E2DF', // Light Gray
  '#D3F8E2', // Pale Green
];

export const NODE_SHAPES: NodeShape[] = ['rectangle', 'ellipse', 'diamond', 'hexagon'];

export function getNodeShapeStyles(shape: NodeShape): React.CSSProperties {
  switch (shape) {
    case 'ellipse':
      return { borderRadius: '50%' };
    case 'diamond':
      return { 
        transform: 'rotate(45deg)', 
        '& > *': { transform: 'rotate(-45deg)' } as any 
      };
    case 'hexagon':
      return { 
        clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' 
      };
    case 'rectangle':
    default:
      return { borderRadius: '8px' };
  }
}