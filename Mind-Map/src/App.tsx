import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Toolbar from './components/Toolbar';
import MindMapCanvas from './components/MindMapCanvas';
import { MindMap, MindMapNode, Position } from './types/MindMap';

function App() {
  // Mind map state
  const [mindMap, setMindMap] = useState<MindMap>(() => {
    const stored = localStorage.getItem('mindMap');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored mind map', e);
      }
    }
    
    // Default mind map
    const rootId = 'root';
    return {
      nodes: {
        [rootId]: {
          id: rootId,
          text: 'Central Idea',
          parentId: null,
          children: [],
          color: '#C6DEF1',
          position: { x: 0, y: 0 },
          isExpanded: true,
          shape: 'rectangle',
        },
      },
      rootId,
    };
  });

  // Canvas state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  // Undo/redo history
  const [history, setHistory] = useState<MindMap[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize history with current state
  useEffect(() => {
    if (history.length === 0) {
      setHistory([mindMap]);
      setHistoryIndex(0);
    }
  }, []);

  // Update undo/redo availability
  useEffect(() => {
    setCanUndo(historyIndex > 0);
    setCanRedo(historyIndex < history.length - 1);
  }, [history, historyIndex]);

  // Save to local storage when mind map changes
  useEffect(() => {
    localStorage.setItem('mindMap', JSON.stringify(mindMap));
  }, [mindMap]);

  // Add to history when state changes
  const addToHistory = useCallback((newState: MindMap) => {
    setHistory(prev => {
      // Remove any future states if we're in the middle of the history
      const newHistory = prev.slice(0, historyIndex + 1);
      // Add the new state
      return [...newHistory, newState];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setMindMap(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setMindMap(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Node manipulation
  const handleAddChild = useCallback((parentId: string) => {
    setMindMap((prev: MindMap) => {
      const newId = `node-${Date.now()}`;
      const parentNode = prev.nodes[parentId];
      const childPosition = { 
        x: parentNode.position.x + 200, 
        y: parentNode.position.y + (parentNode.children.length * 100)
      };
      
      const newMap = {
        ...prev,
        nodes: {
          ...prev.nodes,
          [newId]: {
            id: newId,
            text: 'New Idea',
            parentId,
            children: [],
            color: parentNode.color,
            position: childPosition,
            isExpanded: true,
            shape: parentNode.shape,
          },
          [parentId]: {
            ...parentNode,
            children: [...parentNode.children, newId],
          },
        },
      };
      
      addToHistory(newMap);
      return newMap;
    });
  }, [addToHistory]);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<MindMapNode>) => {
    setMindMap((prev: MindMap) => {
      // If updating parent, update the node's relation in the hierarchy
      if ('parentId' in updates && updates.parentId !== prev.nodes[nodeId].parentId) {
        const oldParentId = prev.nodes[nodeId].parentId;
        const newParentId = updates.parentId;
        
        let newNodes = { ...prev.nodes };
        
        // Remove from old parent's children
        if (oldParentId) {
          const oldParent = newNodes[oldParentId];
          newNodes[oldParentId] = {
            ...oldParent,
            children: oldParent.children.filter(id => id !== nodeId),
          };
        }
        
        // Add to new parent's children
        if (newParentId) {
          const newParent = newNodes[newParentId as string];
          newNodes[newParentId as string] = {
            ...newParent,
            children: [...newParent.children, nodeId],
          };
        }
        
        // Update the node with its new parent
        newNodes[nodeId] = {
          ...newNodes[nodeId],
          ...updates,
        };
        
        const newMap = {
          ...prev,
          nodes: newNodes,
        };
        
        addToHistory(newMap);
        return newMap;
      }
      
      // Simple update without changing parent
      const newMap = {
        ...prev,
        nodes: {
          ...prev.nodes,
          [nodeId]: {
            ...prev.nodes[nodeId],
            ...updates,
          },
        },
      };
      
      addToHistory(newMap);
      return newMap;
    });
  }, [addToHistory]);

  const handleDeleteNode = useCallback((nodeId: string, deleteChildren: boolean) => {
    setMindMap((prev: MindMap) => {
      // Prevent deleting the root node
      if (nodeId === prev.rootId) {
        return prev;
      }
      
      const node = prev.nodes[nodeId];
      const newNodes = { ...prev.nodes };
      
      if (deleteChildren) {
        // Delete the node and all its children recursively
        const deleteNodeAndChildren = (id: string) => {
          const nodeToDelete = newNodes[id];
          nodeToDelete.children.forEach(deleteNodeAndChildren);
          delete newNodes[id];
        };
        deleteNodeAndChildren(nodeId);
      } else {
        // Move children to parent before deleting
        if (node.parentId && node.children.length > 0) {
          const parentNode = newNodes[node.parentId];
          // Add node's children to its parent
          node.children.forEach(childId => {
            newNodes[childId] = {
              ...newNodes[childId],
              parentId: node.parentId,
            };
          });
          // Update parent's children list
          newNodes[node.parentId] = {
            ...parentNode,
            children: [
              ...parentNode.children.filter(id => id !== nodeId),
              ...node.children,
            ],
          };
        }
        // Remove the node
        delete newNodes[nodeId];
      }
      
      // Update parent's children list
      if (node.parentId) {
        const parent = newNodes[node.parentId];
        newNodes[node.parentId] = {
          ...parent,
          children: parent.children.filter(id => id !== nodeId),
        };
      }
      
      const newMap = {
        ...prev,
        nodes: newNodes,
      };
      
      addToHistory(newMap);
      return newMap;
    });
  }, [addToHistory]);

  // View management
  const handleResetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleCenterView = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mind map I/O
  const handleNewMap = useCallback(() => {
    const rootId = 'root';
    const newMap = {
      nodes: {
        [rootId]: {
          id: rootId,
          text: 'Central Idea',
          parentId: null,
          children: [],
          color: '#C6DEF1',
          position: { x: 0, y: 0 },
          isExpanded: true,
          shape: 'rectangle',
        },
      },
      rootId,
    };
    
    setMindMap(newMap);
    addToHistory(newMap);
    handleResetView();
  }, [addToHistory, handleResetView]);

  const handleExportMap = useCallback(() => {
    const dataStr = JSON.stringify(mindMap, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mindmap-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [mindMap]);

  const handleImportMap = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setMindMap(imported);
        addToHistory(imported);
        handleResetView();
      } catch (error) {
        console.error('Error importing mind map:', error);
        alert('Invalid mind map file');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = '';
  }, [addToHistory, handleResetView]);

  // Theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#3949ab',
      },
      secondary: {
        main: '#00897b',
      },
      background: {
        default: '#f5f5f5',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Box 
          sx={{ 
            height: '100vh',
            width: '100vw',
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
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
            canUndo={canUndo}
            canRedo={canRedo}
          />
          
          <MindMapCanvas
            mindMap={mindMap}
            scale={scale}
            position={position}
            onUpdateNode={handleUpdateNode}
            onAddChild={handleAddChild}
            onDeleteNode={handleDeleteNode}
            onPositionChange={setPosition}
          />
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;