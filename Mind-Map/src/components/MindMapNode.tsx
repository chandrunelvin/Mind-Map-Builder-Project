import React, { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { 
  Box, 
  IconButton, 
  TextField, 
  Menu, 
  MenuItem, 
  Paper,
  Typography,
  Tooltip,
  Popover,
  Fade
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  FormatColorFill as ColorIcon,
  FormatShapes as ShapeIcon,
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { MindMap, MindMapNode as MindMapNodeType, NODE_SHAPES, NODE_COLORS, getNodeShapeStyles } from '../types/MindMap';

interface MindMapNodeProps {
  node: MindMapNodeType;
  mindMap: MindMap;
  onAddChild: (parentId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<MindMapNodeType>) => void;
  onDeleteNode: (nodeId: string, deleteChildren: boolean) => void;
  onClick?: () => void;
  isConnecting?: boolean;
  isConnectionStart?: boolean;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  mindMap,
  onAddChild,
  onUpdateNode,
  onDeleteNode,
  onClick,
  isConnecting,
  isConnectionStart,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const [contextMenu, setContextMenu] = useState<null | HTMLElement>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [shapeMenuAnchor, setShapeMenuAnchor] = useState<null | HTMLElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'NODE',
    item: () => ({ 
      id: node.id, 
      left: node.position.x, 
      top: node.position.y 
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnecting) {
      setIsEditing(true);
      setEditText(node.text);
    }
  };

  const handleTextSubmit = () => {
    if (editText.trim()) {
      onUpdateNode(node.id, { text: editText.trim() });
    }
    setIsEditing(false);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isConnecting) {
      setContextMenu(event.currentTarget as HTMLElement);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleColorClick = (event: React.MouseEvent) => {
    setColorPickerAnchor(event.currentTarget as HTMLElement);
    handleCloseContextMenu();
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchor(null);
  };

  const handleColorSelect = (color: string) => {
    onUpdateNode(node.id, { color });
    handleCloseColorPicker();
  };

  const handleShapeClick = (event: React.MouseEvent) => {
    setShapeMenuAnchor(event.currentTarget as HTMLElement);
    handleCloseContextMenu();
  };

  const handleCloseShapeMenu = () => {
    setShapeMenuAnchor(null);
  };

  const handleShapeSelect = (shape: string) => {
    onUpdateNode(node.id, { shape: shape as any });
    handleCloseShapeMenu();
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNode(node.id, { isExpanded: !node.isExpanded });
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting && onClick) {
      onClick();
    }
  };

  const shapeStyles = getNodeShapeStyles(node.shape || 'rectangle');

  return (
    <div
      ref={drag}
      id={node.id}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
      }}
      onClick={handleNodeClick}
    >
      <Paper
        ref={nodeRef}
        elevation={3}
        sx={{
          backgroundColor: node.color || '#ffffff',
          padding: 2,
          minWidth: 180,
          minHeight: 60,
          display: 'flex',
          flexDirection: 'column',
          cursor: isConnecting ? 'pointer' : 'move',
          transition: 'all 0.2s ease',
          ...shapeStyles,
          outline: isConnectionStart ? '2px solid #3949ab' : 'none',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        }}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {isEditing ? (
          <TextField
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
            autoFocus
            fullWidth
            multiline
            size="small"
            sx={{ transform: node.shape === 'diamond' ? 'rotate(-45deg)' : 'none' }}
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            width: '100%',
            transform: node.shape === 'diamond' ? 'rotate(-45deg)' : 'none',
          }}>
            <Typography
              variant="body1"
              component="div"
              sx={{
                fontWeight: 500,
                textAlign: 'center',
                mb: 1,
                color: node.textColor || '#000',
                fontSize: node.fontSize || 16,
                wordBreak: 'break-word',
              }}
            >
              {node.text}
            </Typography>
            
            {!isConnecting && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', gap: 0.5 }}>
                <Tooltip title="Add Child">
                  <IconButton size="small" onClick={() => onAddChild(node.id)}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setIsEditing(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                {node.children.length > 0 && (
                  <Tooltip title={node.isExpanded ? "Collapse" : "Expand"}>
                    <IconButton
                      size="small"
                      onClick={handleExpandToggle}
                    >
                      <ExpandMoreIcon
                        fontSize="small"
                        sx={{
                          transform: node.isExpanded ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s',
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Menu
        anchorEl={contextMenu}
        open={Boolean(contextMenu)}
        onClose={handleCloseContextMenu}
        TransitionComponent={Fade}
      >
        <MenuItem onClick={() => { onAddChild(node.id); handleCloseContextMenu(); }}>
          <AddIcon fontSize="small" sx={{ mr: 1 }} /> Add Child
        </MenuItem>
        <MenuItem onClick={() => { setIsEditing(true); handleCloseContextMenu(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Node
        </MenuItem>
        <MenuItem onClick={handleColorClick}>
          <ColorIcon fontSize="small" sx={{ mr: 1 }} /> Change Color
        </MenuItem>
        <MenuItem onClick={handleShapeClick}>
          <ShapeIcon fontSize="small" sx={{ mr: 1 }} /> Change Shape
        </MenuItem>
        <MenuItem 
          onClick={() => { onDeleteNode(node.id, false); handleCloseContextMenu(); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Node
        </MenuItem>
        {node.children.length > 0 && (
          <MenuItem 
            onClick={() => { onDeleteNode(node.id, true); handleCloseContextMenu(); }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Node & Children
          </MenuItem>
        )}
      </Menu>

      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={handleCloseColorPicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Choose a color
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {NODE_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: node.color === color ? '2px solid #000' : '1px solid #ccc',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              />
            ))}
          </Box>
          
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Custom color
          </Typography>
          
          <HexColorPicker
            color={node.color || '#ffffff'}
            onChange={handleColorSelect}
          />
        </Box>
      </Popover>

      <Menu
        anchorEl={shapeMenuAnchor}
        open={Boolean(shapeMenuAnchor)}
        onClose={handleCloseShapeMenu}
      >
        {NODE_SHAPES.map((shape) => (
          <MenuItem key={shape} onClick={() => handleShapeSelect(shape)}>
            <Box 
              sx={{ 
                width: 24, 
                height: 24, 
                backgroundColor: node.color || '#ffffff',
                border: '1px solid #000',
                marginRight: 1,
                ...getNodeShapeStyles(shape)
              }} 
            />
            {shape.charAt(0).toUpperCase() + shape.slice(1)}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default MindMapNode;