import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Box, Paper, IconButton, Tooltip, Badge } from '@mui/material';
import Xarrow, { Xwrapper } from 'react-xarrows';
import { Link as LinkIcon } from 'lucide-react';
import MindMapNode from './MindMapNode';
import ConnectionModal from './ConnectionModal';
import { MindMap, MindMapNode as MindMapNodeType, Position, Connection } from '../types/MindMap';

interface MindMapCanvasProps {
  mindMap: MindMap;
  scale: number;
  position: Position;
  onUpdateNode: (nodeId: string, updates: Partial<MindMapNodeType>) => void;
  onAddChild: (parentId: string) => void;
  onDeleteNode: (nodeId: string, deleteChildren: boolean) => void;
  onPositionChange: (pos: Position) => void;
  onUpdateConnections: (connections: Connection[]) => void;
  currentTheme: string;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  mindMap,
  scale,
  position,
  onUpdateNode,
  onAddChild,
  onDeleteNode,
  onPositionChange,
  onUpdateConnections,
  currentTheme,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [startDragPos, setStartDragPos] = useState<Position>({ x: 0, y: 0 });
  const [startCanvasPos, setStartCanvasPos] = useState<Position>({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [connectionHover, setConnectionHover] = useState<string | null>(null);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);
  const [connectionParams, setConnectionParams] = useState<{start: string, end: string} | null>(null);

  // Handle middle mouse button or ctrl+left click to drag the canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsDraggingCanvas(true);
      setStartDragPos({ x: e.clientX, y: e.clientY });
      setStartCanvasPos({ ...position });
      e.preventDefault();
    }
  };

  // Update canvas position while dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      const dx = (e.clientX - startDragPos.x) / scale;
      const dy = (e.clientY - startDragPos.y) / scale;
      onPositionChange({
        x: startCanvasPos.x + dx,
        y: startCanvasPos.y + dy,
      });
    }
  };

  // End canvas dragging
  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // Add global mouse up handler to ensure dragging stops even when mouse is released outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingCanvas(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Configure react-dnd for dragging nodes
  const [, drop] = useDrop({
    accept: 'NODE',
    drop: (item: { id: string, left: number, top: number }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta && mindMap?.nodes[item.id]) {
        const node = mindMap.nodes[item.id];
        const left = Math.round(node.position.x + delta.x / scale);
        const top = Math.round(node.position.y + delta.y / scale);
        onUpdateNode(item.id, { position: { x: left, y: top } });
      }
      return { moved: true };
    },
  });

  // Center root node when creating a new mind map
  useEffect(() => {
    if (canvasRef.current && mindMap?.rootId) {
      const rootNode = mindMap.nodes[mindMap.rootId];
      if (rootNode && rootNode.position.x === 0 && rootNode.position.y === 0) {
        const canvasWidth = canvasRef.current.clientWidth;
        const canvasHeight = canvasRef.current.clientHeight;
        onUpdateNode(mindMap.rootId, {
          position: {
            x: canvasWidth / 2 / scale - 100,
            y: canvasHeight / 2 / scale - 50,
          },
        });
      }
    }
  }, [mindMap?.rootId, scale, onUpdateNode]);

  // Handle node clicks for creating connections
  const handleNodeClick = (nodeId: string) => {
    if (isConnecting) {
      if (connectionStart) {
        // Don't connect node to itself
        if (connectionStart === nodeId) {
          setConnectionStart(null);
          return;
        }
        
        // Check if connection already exists
        const connectionExists = mindMap.connections.some(
          conn => (conn.start === connectionStart && conn.end === nodeId) || 
                 (conn.start === nodeId && conn.end === connectionStart)
        );
        
        if (!connectionExists) {
          // Open modal to add connection details
          setConnectionParams({ start: connectionStart, end: nodeId });
          setConnectionModalOpen(true);
        } else {
          // Provide visual feedback for existing connection
          setConnectionHover(nodeId);
          setTimeout(() => {
            setConnectionHover(null);
            setConnectionStart(null);
          }, 500);
        }
      } else {
        // Set the starting node for connection
        setConnectionStart(nodeId);
      }
    }
  };

  // Toggle connection mode
  const toggleConnectionMode = () => {
    setIsConnecting(!isConnecting);
    setConnectionStart(null);
    setConnectionHover(null);
  };

  // Add a new connection with details from modal
  const handleAddConnection = (label: string, color: string) => {
    if (connectionParams) {
      const newConnection: Connection = {
        start: connectionParams.start,
        end: connectionParams.end,
        label: label || undefined,
        color: color || (currentTheme === 'dark' ? '#90caf9' : '#3949ab'),
      };
      
      const updatedConnections = [...(mindMap.connections || []), newConnection];
      onUpdateConnections(updatedConnections);
      
      // Reset connection state
      setConnectionParams(null);
      setConnectionStart(null);
      setConnectionModalOpen(false);
    }
  };

  // Cancel adding a connection
  const handleCancelConnection = () => {
    setConnectionModalOpen(false);
    setConnectionParams(null);
    setConnectionStart(null);
  };

  // Render all connections between nodes
  const renderConnections = () => {
    if (!mindMap?.nodes) return [];
    
    const connections: JSX.Element[] = [];
    
    // Render automatic connections based on parent-child relationships
    const renderNodeConnections = (nodeId: string) => {
      const node = mindMap.nodes[nodeId];
      if (!node.isExpanded) return;

      node.children.forEach(childId => {
        const childNode = mindMap.nodes[childId];
        if (childNode) {
          connections.push(
            <Xarrow
              key={`${nodeId}-${childId}`}
              start={nodeId}
              end={childId}
              color={currentTheme === 'dark' ? '#90caf9' : '#3949ab'}
              strokeWidth={2}
              curveness={0.3}
              animateDrawing={0.3}
              path="smooth"
              startAnchor="auto"
              endAnchor="auto"
              headSize={5}
            />
          );
          renderNodeConnections(childId);
        }
      });
    };

    if (mindMap.rootId) {
      renderNodeConnections(mindMap.rootId);
    }
    
    // Render manual connections
    mindMap.connections?.forEach((connection, index) => {
      connections.push(
        <Xarrow
          key={`manual-${index}`}
          start={connection.start}
          end={connection.end}
          color={connection.color || (currentTheme === 'dark' ? '#90caf9' : '#3949ab')}
          strokeWidth={2}
          curveness={0.3}
          path="smooth"
          startAnchor="auto"
          endAnchor="auto"
          headSize={5}
          labels={{ middle: connection.label }}
        />
      );
    });
    
    // Render temporary connection when in connecting mode
    if (isConnecting && connectionStart) {
      connections.push(
        <Xarrow
          key="temp-connection"
          start={connectionStart}
          end={connectionHover || connectionStart}
          color={currentTheme === 'dark' ? '#90caf9' : '#3949ab'}
          strokeWidth={2}
          curveness={0.3}
          path="smooth"
          startAnchor="auto"
          endAnchor="auto"
          headSize={5}
          dashness={{ strokeLen: 10, nonStrokeLen: 10, animation: 1 }}
        />
      );
    }
    
    return connections;
  };

  // Render all nodes recursively
  const renderNodes = () => {
    if (!mindMap?.nodes) return null;
    
    const renderNode = (nodeId: string, isVisible: boolean) => {
      const node = mindMap.nodes[nodeId];
      if (!node) return null;
      
      const parentNode = node.parentId ? mindMap.nodes[node.parentId] : null;
      const shouldShow = isVisible && (!parentNode || parentNode.isExpanded);

      return (
        <React.Fragment key={nodeId}>
          {shouldShow && (
            <MindMapNode
              node={node}
              mindMap={mindMap}
              onAddChild={onAddChild}
              onUpdateNode={onUpdateNode}
              onDeleteNode={onDeleteNode}
              onClick={() => handleNodeClick(node.id)}
              isConnecting={isConnecting}
              isConnectionStart={connectionStart === node.id}
              isConnectionHover={connectionHover === node.id}
              onConnectionHover={(hover) => {
                if (isConnecting && connectionStart && connectionStart !== node.id) {
                  setConnectionHover(hover ? node.id : null);
                }
              }}
              currentTheme={currentTheme}
            />
          )}
          {node.children.map(childId => renderNode(childId, shouldShow))}
        </React.Fragment>
      );
    };

    return mindMap.rootId ? renderNode(mindMap.rootId, true) : null;
  };

  // Get background styling based on theme
  const getBackgroundStyle = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          backgroundColor: '#212529',
          backgroundImage: 'radial-gradient(#444 1px, transparent 1px)',
        };
      case 'gradient-blue':
      case 'gradient-purple':
      case 'gradient-sunset':
        return {
          backgroundColor: '#f8f9fa',
          backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
        };
      default:
        return {
          backgroundColor: '#f8f9fa',
          backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)',
        };
    }
  };

  return (
    <Paper
      ref={drop}
      component="div"
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        ...getBackgroundStyle(),
        backgroundSize: '20px 20px',
        cursor: isDraggingCanvas ? 'grabbing' : isConnecting ? 'crosshair' : 'default',
        transition: 'background-color 0.3s ease',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Connection mode toggle button */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Tooltip title={isConnecting ? "Cancel Connection" : "Connect Nodes"}>
          <Badge 
            color="primary" 
            variant="dot" 
            invisible={!isConnecting}
            overlap="circular"
          >
            <IconButton
              onClick={toggleConnectionMode}
              color={isConnecting ? "primary" : "default"}
              sx={{
                backgroundColor: 'white',
                borderRadius: '50%',
                boxShadow: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isConnecting ? 'rgba(57, 73, 171, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                },
                animation: isConnecting ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0px rgba(57, 73, 171, 0.4)' },
                  '70%': { boxShadow: '0 0 0 6px rgba(57, 73, 171, 0)' },
                  '100%': { boxShadow: '0 0 0 0px rgba(57, 73, 171, 0)' },
                },
              }}
            >
              <LinkIcon size={20} />
            </IconButton>
          </Badge>
        </Tooltip>
      </Box>
      
      {/* Canvas container */}
      <div 
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <Xwrapper>
          <Box
            sx={{
              transformOrigin: '0 0',
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transition: isDraggingCanvas ? 'none' : 'transform 0.15s ease-out',
              height: '5000px',
              width: '5000px',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            {renderNodes()}
            {renderConnections()}
          </Box>
        </Xwrapper>
      </div>
      
      {/* Connecting mode instructions */}
      {isConnecting && connectionStart && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(57, 73, 171, 0.9)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 2,
            zIndex: 1000,
            boxShadow: 2,
            animation: 'fadeIn 0.3s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateX(-50%) translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
            },
          }}
        >
          Select a node to connect
        </Box>
      )}

      {/* Connection details modal */}
      <ConnectionModal
        open={connectionModalOpen}
        onClose={handleCancelConnection}
        onAddConnection={handleAddConnection}
        currentTheme={currentTheme}
      />
    </Paper>
  );
};

export default MindMapCanvas;