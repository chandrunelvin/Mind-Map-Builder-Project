export interface Position {
  x: number;
  y: number;
}

export interface Connection {
  start: string;
  end: string;
  label?: string;
  color?: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  position: Position;
  color?: string;
  gradient?: string;
  textColor?: string;
  fontSize?: number;
  shape?: "rectangle" | "rounded" | "ellipse" | "hexagon";
  children: string[];
  parentId?: string;
  isExpanded: boolean;
}

export interface MindMap {
  id: string;
  name: string;
  rootId: string;
  nodes: { [key: string]: MindMapNode };
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

// Node shape constants
export const NODE_SHAPES = [
  "rectangle",
  "rounded",
  "ellipse",
  // "diamond",
  "hexagon",
];

// Node color constants
export const NODE_COLORS = [
  "#ffffff", // white
  "#f8f9fa", // light gray
  "#e9ecef", // gray
  "#dee2e6", // dark gray
  "#ffe8cc", // light orange
  "#ffccbc", // light coral
  "#ffcdd2", // light red
  "#f8bbd0", // light pink
  "#e1bee7", // light purple
  "#d1c4e9", // light deep purple
  "#c5cae9", // light indigo
  "#bbdefb", // light blue
  "#b3e5fc", // light light blue
  "#b2ebf2", // light cyan
  "#b2dfdb", // light teal
  "#c8e6c9", // light green
  "#dcedc8", // light light green
  "#f0f4c3", // light lime
  "#fff9c4", // light yellow
  "#ffecb3", // light amber
];

// Gradient color constants
export const GRADIENT_COLORS = [
  "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  "linear-gradient(to right, #6a11cb 0%, #2575fc 100%)",
  "linear-gradient(120deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(to right, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
  "linear-gradient(to top, #c471f5 0%, #fa71cd 100%)",
  "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(to right, #f83600 0%, #f9d423 100%)",
  "linear-gradient(to bottom, #209cff 0%, #68e0cf 100%)",
  "linear-gradient(to right, #874da2 0%, #c43a30 100%)",
];

// Function to get shape styles based on shape type
export const getNodeShapeStyles = (shape: string): React.CSSProperties => {
  switch (shape) {
    case "rounded":
      return { borderRadius: "50%" };
    case "ellipse":
      return { borderRadius: "50%" };
    // case "diamond":
    //   return {
    //     transform: "rotate(45deg)",
    //     borderRadius: "4px",
    //   };
    case "hexagon":
      return {
        clipPath:
          "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      };
    case "rectangle":
    default:
      return { borderRadius: "4px" };
  }
};

// Helper functions for mind map management
export const createDefaultNode = (
  id: string,
  text: string,
  parentId?: string
): MindMapNode => {
  return {
    id,
    text,
    position: { x: 0, y: 0 },
    children: [],
    parentId,
    isExpanded: true,
  };
};

export const createEmptyMindMap = (
  name: string = "Untitled Mind Map"
): MindMap => {
  const rootId = `node-${Date.now()}`;
  return {
    id: `map-${Date.now()}`,
    name,
    rootId,
    nodes: {
      [rootId]: createDefaultNode(rootId, "Central Idea"),
    },
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
