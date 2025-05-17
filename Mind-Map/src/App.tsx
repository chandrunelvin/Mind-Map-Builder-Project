import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  CssBaseline, 
  Box, 
  ThemeProvider, 
  createTheme, 
  PaletteMode 
} from '@mui/material';
import Toolbar from './components/Toolbar';
import MindMapCanvas from './components/MindMapCanvas';
import { 
  MindMap, 
  Position, 
  Connection, 
  MindMapNode,
  createEmptyMindMap 
} from './types/MindMap';

const App: React.FC = () => {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  
  // Mind map state
  const [mindMap, setMindMap] = useState<MindMap>(() => {
    // Try to load from localStorage
    const savedMap = localStorage.getItem('mindMap');
    return savedMap ? JSON.parse(savedMap) : createEmptyMindMap();
  });
  
  // Canvas view state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  
  // History for undo/redo
  const [history, setHistory] = useState<MindMap[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Save to history when mindMap changes
  useEffect(() => {
    if (mindMap) {
      // Save to localStorage
      localStorage.setItem('mindMap', JSON.stringify(mindMap));
      
      // Add to history if it's a new state
      if (historyIndex === history.length - 1) {
        setHistory([...history, mindMap]);
        setHistoryIndex(history.length);
      } else if (historyIndex >= 0) {
        // If we're in the middle of the history, truncate
        setHistory([...history.slice(0, historyIndex + 1), mindMap]);
        setHistoryIndex(historyIndex + 1);
      }
    }
  }, [mindMap]);
  
  // Create Material UI theme based on current theme
  const theme = createTheme({
    palette: {
      mode: currentTheme === 'dark' ? 'dark' : 'light' as PaletteMode,
      primary: {
        main: currentTheme === 'dark' ? '#90caf9' : '#3949ab',
      },
      background: {
        default: currentTheme === 'dark' ? '#121212' : '#f5f5f5',
        paper: currentTheme === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            overflow: 'hidden',
          },
        },
      },
    },
  });
  
  // Update a node
  const handleUpdateNode = (nodeId: string, updates: Partial<MindMapNode>) => {
    if (!mindMap.nodes[nodeId]) return;
    
    setMindMap({
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [nodeId]: {
          ...mindMap.nodes[nodeId],
          ...updates,
        },
      },
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Add a child node
  const handleAddChild = (parentId: string) => {
    if (!mindMap.nodes[parentId]) return;
    
    const newNodeId = `node-${Date.now()}`;
    const parentNode = mindMap.nodes[parentId];
    
    // Create new node positioned relative to parent
    const newNode: MindMapNode = {
      id: newNodeId,
      text: 'New Idea',
      position: {
        x: parentNode.position.x + 200,
        y: parentNode.position.y + (parentNode.children.length * 100),
      },
      color: parentNode.color,
      children: [],
      parentId,
      isExpanded: true,
    };
    
    setMindMap({
      ...mindMap,
      nodes: {
        ...mindMap.nodes,
        [newNodeId]: newNode,
        [parentId]: {
          ...parentNode,
          children: [...parentNode.children, newNodeId],
          isExpanded: true,
        },
      },
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Delete a node
  const handleDeleteNode = (nodeId: string, deleteChildren: boolean) => {
    if (nodeId === mindMap.rootId || !mindMap.nodes[nodeId]) return;
    
    const nodesToDelete = new Set<string>();
    
    // Add the node itself
    nodesToDelete.add(nodeId);
    
    // Recursively collect child nodes if deleteChildren is true
    if (deleteChildren) {
      const collectChildrenToDelete = (id: string) => {
        const node = mindMap.nodes[id];
        if (node) {
          node.children.forEach(childId => {
            nodesToDelete.add(childId);
            collectChildrenToDelete(childId);
          });
        }
      };
      
      collectChildrenToDelete(nodeId);
    } else {
      // Move children to parent
      const node = mindMap.nodes[nodeId];
      const parentId = node.parentId;
      
      if (parentId && mindMap.nodes[parentId]) {
        node.children.forEach(childId => {
          if (mindMap.nodes[childId]) {
            mindMap.nodes[childId].parentId = parentId;
          }
        });
      }
    }
    
    // Update parent to remove reference to this node
    const parentId = mindMap.nodes[nodeId].parentId;
    if (parentId && mindMap.nodes[parentId]) {
      mindMap.nodes[parentId].children = mindMap.nodes[parentId].children.filter(
        id => id !== nodeId
      );
    }
    
    // Create new nodes object without deleted nodes
    const updatedNodes = { ...mindMap.nodes };
    nodesToDelete.forEach(id => {
      delete updatedNodes[id];
    });
    
    // Filter out connections that reference deleted nodes
    const updatedConnections = mindMap.connections.filter(
      conn => !nodesToDelete.has(conn.start) && !nodesToDelete.has(conn.end)
    );
    
    setMindMap({
      ...mindMap,
      nodes: updatedNodes,
      connections: updatedConnections,
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Update connections
  const handleUpdateConnections = (connections: Connection[]) => {
    setMindMap({
      ...mindMap,
      connections,
      updatedAt: new Date().toISOString(),
    });
  };
  
  // Reset view
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Center view on the root node
  const handleCenterView = () => {
    if (mindMap?.rootId && mindMap.nodes[mindMap.rootId]) {
      const rootNode = mindMap.nodes[mindMap.rootId];
      setPosition({
        x: -rootNode.position.x + (window.innerWidth / (2 * scale) - 100),
        y: -rootNode.position.y + (window.innerHeight / (2 * scale) - 50),
      });
    }
  };
  
  // Create a new mind map
  const handleNewMap = () => {
    const newMap = createEmptyMindMap();
    setMindMap(newMap);
    handleResetView();
  };
  
  // Export mind map as JSON
  const handleExportMap = () => {
    const dataStr = JSON.stringify(mindMap, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mindmap-${mindMap.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Import mind map from JSON
  const handleImportMap = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMap = JSON.parse(e.target?.result as string);
        if (importedMap.nodes && importedMap.rootId) {
          setMindMap(importedMap);
          handleResetView();
        } else {
          alert('Invalid mind map file format');
        }
      } catch (error) {
        alert('Failed to parse the imported file');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Clear the input to allow importing the same file again
    event.target.value = '';
  };
  
  // Undo last action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMindMap(history[historyIndex - 1]);
    }
  };
  
  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMindMap(history[historyIndex + 1]);
    }
  };
  
  // Change theme
  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };
  
  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          overflow: 'hidden',
          bgcolor: theme.palette.background.default
        }}>
          <Toolbar
            scale={scale}
            onScaleChange={setScale}
            onResetView={handleResetView}
            onCenterView={handleCenterView}
            onNewMap={handleNewMap}
            onExportMap={handleExportMap}
            onImportMap={handleImportMap}
            onUndoAction={handleUndo}
            onRedoAction={handleRedo}
            onThemeChange={handleThemeChange}
            currentTheme={currentTheme}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
          
          <MindMapCanvas
            mindMap={mindMap}
            scale={scale}
            position={position}
            onUpdateNode={handleUpdateNode}
            onAddChild={handleAddChild}
            onDeleteNode={handleDeleteNode}
            onPositionChange={setPosition}
            onUpdateConnections={handleUpdateConnections}
            currentTheme={currentTheme}
          />
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
};

export default App;