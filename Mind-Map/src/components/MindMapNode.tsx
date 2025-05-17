import React, { useState, useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import {
  Box,
  IconButton,
  TextField,
  Popover,
  Paper,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MoreHoriz as MoreHorizIcon } from "@mui/icons-material";

import {
  Edit as EditIcon,
  FormatColorFill as ColorIcon,
  FormatShapes as ShapeIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";
import {
  MindMap,
  MindMapNode as MindMapNodeType,
  NODE_SHAPES,
  NODE_COLORS,
  GRADIENT_COLORS,
  getNodeShapeStyles,
} from "../types/MindMap";

interface MindMapNodeProps {
  node: MindMapNodeType;
  mindMap: MindMap;
  onAddChild: (parentId: string) => void;
  onUpdateNode: (nodeId: string, updates: Partial<MindMapNodeType>) => void;
  onDeleteNode: (nodeId: string, deleteChildren: boolean) => void;
  onClick?: () => void;
  isConnecting?: boolean;
  isConnectionStart?: boolean;
  isConnectionHover?: boolean;
  onConnectionHover?: (hover: boolean) => void;
  currentTheme: string;
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
  isConnectionHover,
  onConnectionHover,
  currentTheme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<null | HTMLElement>(null);
  const [shapeMenuAnchor, setShapeMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [gradientMenuAnchor, setGradientMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isDarkMode = currentTheme === "dark";

  // Configure drag behavior using react-dnd
  const [{ isDragging }, drag] = useDrag({
    type: "NODE",
    item: () => ({
      id: node.id,
      left: node.position.x,
      top: node.position.y,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up connection hover handlers
  useEffect(() => {
    if (onConnectionHover && isConnecting && !isConnectionStart) {
      const handleMouseEnter = () => onConnectionHover(true);
      const handleMouseLeave = () => onConnectionHover(false);

      if (nodeRef.current) {
        nodeRef.current.addEventListener("mouseenter", handleMouseEnter);
        nodeRef.current.addEventListener("mouseleave", handleMouseLeave);
      }

      return () => {
        if (nodeRef.current) {
          nodeRef.current.removeEventListener("mouseenter", handleMouseEnter);
          nodeRef.current.removeEventListener("mouseleave", handleMouseLeave);
        }
      };
    }
  }, [isConnecting, isConnectionStart, onConnectionHover]);

  // Double click to edit node text
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnecting) {
      setIsEditing(true);
      setEditText(node.text);
    }
  };

  // Submit edited text
  const handleTextSubmit = () => {
    if (editText.trim()) {
      onUpdateNode(node.id, { text: editText.trim() });
    }
    setIsEditing(false);
  };

  // Open color picker
  const handleColorClick = () => {
    setColorPickerAnchor(nodeRef.current);
    setOptionsAnchor(null);
  };

  // Close color picker
  const handleCloseColorPicker = () => {
    setColorPickerAnchor(null);
  };

  // Select a color
  const handleColorSelect = (color: string) => {
    onUpdateNode(node.id, { color, gradient: "" });
    handleCloseColorPicker();
  };

  // Open gradient menu
  const handleGradientClick = () => {
    setGradientMenuAnchor(nodeRef.current);
    setOptionsAnchor(null);
  };

  // Close gradient menu
  const handleCloseGradientMenu = () => {
    setGradientMenuAnchor(null);
  };

  // Select a gradient
  const handleGradientSelect = (gradient: string) => {
    onUpdateNode(node.id, {
      gradient,
      color: gradient ? "" : node.color || (isDarkMode ? "#121212" : "#ffffff"),
    });
    handleCloseGradientMenu();
  };

  // Open shape menu
  const handleShapeClick = () => {
    setShapeMenuAnchor(nodeRef.current);
    setOptionsAnchor(null);
  };

  // Close shape menu
  const handleCloseShapeMenu = () => {
    setShapeMenuAnchor(null);
  };

  // Select a shape
  const handleShapeSelect = (shape: string) => {
    onUpdateNode(node.id, { shape: shape as any });
    handleCloseShapeMenu();
  };

  // Toggle node expansion
  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNode(node.id, { isExpanded: !node.isExpanded });
  };

  // Handle node click for connections
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  // Open options menu
  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOptionsAnchor(e.currentTarget as HTMLElement);
  };

  // Close options menu
  const handleCloseOptions = () => {
    setOptionsAnchor(null);
  };

  // Delete node handler
  const handleDelete = () => {
    onDeleteNode(node.id, false);
    handleCloseOptions();
  };

  // Handle adding a child node
  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddChild(node.id);
  };

  // Get node shape styles
  const shapeStyles = getNodeShapeStyles(node.shape || "rectangle");

  // Prepare background style based on color and gradient
  const getBackgroundStyle = () => {
    if (node.gradient) {
      return { background: node.gradient };
    }
    return {
      backgroundColor: node.color || (isDarkMode ? "#121212" : "#ffffff"),
    };
  };

  // Get content styling based on shape
  const getContentStyle = () => {
    if (node.shape === "diamond") {
      return {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        transform: "rotate(-45deg)",
      };
    }

    return {
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      width: "100%",
    };
  };

  return (
    <div
      ref={drag}
      id={node.id}
      style={{
        position: "absolute",
        left: node.position.x,
        top: node.position.y,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging
          ? 100
          : isConnectionStart || isConnectionHover
          ? 50
          : 1,
      }}
      onClick={handleNodeClick}
    >
      <Paper
        ref={nodeRef}
        elevation={isDarkMode ? 0 : 3}
        sx={{
          ...getBackgroundStyle(),
          padding: 2,
          minWidth: 180,
          minHeight: 60,
          display: "flex",
          flexDirection: "column",
          cursor: isConnecting ? "pointer" : "move",
          transition: "all 0.2s ease",
          ...shapeStyles,
          border: isDarkMode ? "1px solid #333" : "none",
          outline: isConnectionStart
            ? `2px solid ${isDarkMode ? "#90caf9" : "#3949ab"}`
            : isConnectionHover
            ? `2px dashed ${isDarkMode ? "#90caf9" : "#3949ab"}`
            : "none",
          animation: isConnectionHover
            ? "pulse 1.5s infinite"
            : isConnectionStart
            ? "glow 1.5s infinite alternate"
            : "none",
          "&:hover": {
            boxShadow: isDarkMode
              ? "0 8px 16px rgba(255,255,255,0.1)"
              : "0 8px 16px rgba(0,0,0,0.1)",
            transform: "translateY(-2px)",
          },
          "@keyframes pulse": {
            "0%": { boxShadow: `0 0 0 0 rgba(144, 202, 249, 0.4)` },
            "70%": { boxShadow: `0 0 0 10px rgba(144, 202, 249, 0)` },
            "100%": { boxShadow: `0 0 0 0 rgba(144, 202, 249, 0)` },
          },
          "@keyframes glow": {
            "0%": { boxShadow: `0 0 5px rgba(144, 202, 249, 0.5)` },
            "100%": { boxShadow: `0 0 15px rgba(144, 202, 249, 0.8)` },
          },
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <TextField
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
            autoFocus
            fullWidth
            multiline
            size="small"
            sx={{
              "& .MuiInputBase-root": {
                transform: node.shape === "diamond" ? "rotate(0deg)" : "none",
                backgroundColor: isDarkMode ? "#333" : "#fff",
                color: isDarkMode ? "#fff" : "#000",
              },
            }}
          />
        ) : (
          <Box sx={getContentStyle()}>
            <Typography
              variant="body1"
              component="div"
              sx={{
                fontWeight: 500,
                textAlign: "center",
                mb: 1,
                color: node.textColor || (isDarkMode ? "#ffffff" : "#000000"),
                fontSize: node.fontSize || 16,
                wordBreak: "break-word",
              }}
            >
              {node.text}
            </Typography>

            {!isConnecting && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: "auto",
                  gap: 0.5,
                }}
              >
                {/* Add Child Button */}
                <Tooltip title="Add Child">
                  <IconButton
                    size="small"
                    onClick={handleAddChild}
                    color={isDarkMode ? "secondary" : "primary"}
                    sx={{ color: isDarkMode ? "#90caf9" : "#3949ab" }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Expand/Collapse Button */}
                {node.children.length > 0 && (
                  <Tooltip title={node.isExpanded ? "Collapse" : "Expand"}>
                    <IconButton
                      size="small"
                      onClick={handleExpandToggle}
                      sx={{ color: isDarkMode ? "#90caf9" : "#3949ab" }}
                    >
                      <ExpandMoreIcon
                        fontSize="small"
                        sx={{
                          transform: node.isExpanded
                            ? "rotate(180deg)"
                            : "none",
                          transition: "transform 0.3s",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Options Button */}
                <Tooltip title="Options">
                  <IconButton
                    size="small"
                    onClick={handleOptionsClick}
                    sx={{ color: isDarkMode ? "#90caf9" : "#3949ab" }}
                  >
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Options Menu */}
      <Menu
        anchorEl={optionsAnchor}
        open={Boolean(optionsAnchor)}
        onClose={handleCloseOptions}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        }}
      >
        <MenuItem onClick={handleColorClick}>
          <ListItemIcon>
            <ColorIcon
              fontSize="small"
              sx={{ color: isDarkMode ? "#90caf9" : "#3949ab" }}
            />
          </ListItemIcon>
          <ListItemText>Change Color</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleGradientClick}>
          <ListItemIcon>
            <ColorIcon
              fontSize="small"
              sx={{ color: isDarkMode ? "#90caf9" : "#3949ab" }}
            />
          </ListItemIcon>
          <ListItemText>Apply Gradient</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShapeClick}>
          <ListItemIcon>
            <ShapeIcon
              fontSize="small"
              sx={{ color: isDarkMode ? "#90caf9" : "#3949ab" }}
            />
          </ListItemIcon>
          <ListItemText>Change Shape</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#f44336" }} />
          </ListItemIcon>
          <ListItemText sx={{ color: "#f44336" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Color Picker */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={handleCloseColorPicker}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Choose a color
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {NODE_COLORS.map((color) => (
              <Box
                key={color}
                onClick={() => handleColorSelect(color)}
                sx={{
                  width: 24,
                  height: 24,
                  backgroundColor: color,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border:
                    node.color === color
                      ? `2px solid ${isDarkMode ? "#fff" : "#000"}`
                      : `1px solid ${isDarkMode ? "#666" : "#ccc"}`,
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              />
            ))}
          </Box>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Custom color
          </Typography>

          <HexColorPicker
            color={node.color || (isDarkMode ? "#121212" : "#ffffff")}
            onChange={handleColorSelect}
          />
        </Box>
      </Popover>

      {/* Gradient Picker */}
      <Popover
        open={Boolean(gradientMenuAnchor)}
        anchorEl={gradientMenuAnchor}
        onClose={handleCloseGradientMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Choose a gradient
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {GRADIENT_COLORS.map((gradient, index) => (
              <Box
                key={index}
                onClick={() => handleGradientSelect(gradient)}
                sx={{
                  height: 30,
                  background: gradient,
                  borderRadius: "4px",
                  cursor: "pointer",
                  border:
                    node.gradient === gradient
                      ? `2px solid ${isDarkMode ? "#fff" : "#000"}`
                      : `1px solid ${isDarkMode ? "#666" : "#ccc"}`,
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                }}
              />
            ))}
            <MenuItem
              onClick={() => handleGradientSelect("")}
              sx={{
                mt: 1,
                color: isDarkMode ? "#90caf9" : "#3949ab",
              }}
            >
              Clear Gradient
            </MenuItem>
          </Box>
        </Box>
      </Popover>

      {/* Shape Menu */}
      <Menu
        anchorEl={shapeMenuAnchor}
        open={Boolean(shapeMenuAnchor)}
        onClose={handleCloseShapeMenu}
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#000",
          },
        }}
      >
        {NODE_SHAPES.map((shape) => (
          <MenuItem key={shape} onClick={() => handleShapeSelect(shape)}>
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor:
                  node.color || (isDarkMode ? "#121212" : "#ffffff"),
                border: `1px solid ${isDarkMode ? "#fff" : "#000"}`,
                marginRight: 1,
                ...getNodeShapeStyles(shape),
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
