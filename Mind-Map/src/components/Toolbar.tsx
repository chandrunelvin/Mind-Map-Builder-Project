import React, { useState } from "react";
import {
  AppBar,
  Toolbar as MuiToolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Divider,
  Fade,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  FileDownload,
  FileUpload,
  AddCircleOutline,
  Undo,
  Redo,
  DarkMode,
  LightMode,
  Palette,
} from "@mui/icons-material";
import { Brain, HelpCircle, Layout, Clock } from "lucide-react";
import {
  GitGraph, // Represents connections and branches
  Network, // Good for showing interconnected nodes
  Share2, // Represents connections spreading out
  StretchHorizontal, // Shows expansion
  Binary, // For hierarchical structures
  Workflow, // For process flows
} from "lucide-react";

import { Position } from "../types/MindMap";

interface ToolbarProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  onResetView: () => void;
  onCenterView: () => void;
  onNewMap: () => void;
  onExportMap: () => void;
  onImportMap: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUndoAction: () => void;
  onRedoAction: () => void;
  onThemeChange: (theme: string) => void;
  currentTheme: string;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  scale,
  onScaleChange,
  onResetView,
  onCenterView,
  onNewMap,
  onExportMap,
  onImportMap,
  onUndoAction,
  onRedoAction,
  onThemeChange,
  currentTheme,
  canUndo,
  canRedo,
}) => {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [newMapDialogOpen, setNewMapDialogOpen] = useState(false);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Zoom in handler
  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.1, 2.5));
  };

  // Zoom out handler
  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.1, 0.5));
  };

  // Create new map confirmation
  const handleNewMapConfirm = () => {
    onNewMap();
    setNewMapDialogOpen(false);
  };

  // Trigger file input click for import
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Theme menu handlers
  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  // Get theme icon based on current theme
  const getThemeIcon = () => {
    switch (currentTheme) {
      case "dark":
        return <DarkMode fontSize="small" />;
      case "light":
        return <LightMode fontSize="small" />;
      default:
        return <Palette fontSize="small" />;
    }
  };

  // Theme options
  const themes = [
    {
      name: "Light Mode",
      value: "light",
      icon: <LightMode fontSize="small" />,
    },
    { name: "Dark Mode", value: "dark", icon: <DarkMode fontSize="small" /> },
    {
      name: "Gradient Blue",
      value: "gradient-blue",
      icon: <Palette fontSize="small" />,
    },
    {
      name: "Gradient Purple",
      value: "gradient-purple",
      icon: <Palette fontSize="small" />,
    },
    {
      name: "Gradient Sunset",
      value: "gradient-sunset",
      icon: <Palette fontSize="small" />,
    },
  ];

  return (
    <>
      <AppBar
        position="static"
        color="default"
        elevation={2}
        sx={{
          background:
            currentTheme === "dark"
              ? "linear-gradient(90deg, #343a40 0%, #212529 100%)"
              : currentTheme.startsWith("gradient")
              ? "linear-gradient(90deg, #e9ecef 0%, #f8f9fa 100%)"
              : "linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)",
        }}
      >
        <MuiToolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo and title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {/* <Brain
              size={28}
              color={currentTheme === "dark" ? "#90caf9" : "#3949ab"}
              strokeWidth={2}
            /> */}
            <Network
              size={28}
              color={currentTheme === "dark" ? "#90caf9" : "#3949ab"}
              strokeWidth={2}
            />

            <Typography
              variant="h6"
              component="div"
              sx={{
                ml: 1,
                fontWeight: 600,
                color: currentTheme === "dark" ? "#90caf9" : "#3949ab",
                textShadow:
                  currentTheme === "dark"
                    ? "0 0 10px rgba(144, 202, 249, 0.3)"
                    : "none",
              }}
            >
              Mind Mapper
            </Typography>
            {/* <Workflow
              size={28}
              color={currentTheme === "dark" ? "#90caf9" : "#3949ab"}
              strokeWidth={2}
            /> */}
          </Box>

          {/* Toolbar buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip title="New Mind Map">
              <IconButton
                onClick={() => setNewMapDialogOpen(true)}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                <AddCircleOutline />
              </IconButton>
            </Tooltip>

            <Tooltip title="Undo">
              <span>
                <IconButton
                  onClick={onUndoAction}
                  disabled={!canUndo}
                  color="primary"
                  sx={{
                    color: currentTheme === "dark" ? "#90caf9" : undefined,
                  }}
                >
                  <Undo />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Redo">
              <span>
                <IconButton
                  onClick={onRedoAction}
                  disabled={!canRedo}
                  color="primary"
                  sx={{
                    color: currentTheme === "dark" ? "#90caf9" : undefined,
                  }}
                >
                  <Redo />
                </IconButton>
              </span>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 0.5,
                backgroundColor:
                  currentTheme === "dark"
                    ? "rgba(255, 255, 255, 0.12)"
                    : undefined,
              }}
            />

            <Tooltip title="Zoom In">
              <IconButton
                onClick={handleZoomIn}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                <ZoomIn />
              </IconButton>
            </Tooltip>

            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                minWidth: "55px",
                textAlign: "center",
                bgcolor:
                  currentTheme === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.05)",
                color: currentTheme === "dark" ? "#fff" : "inherit",
                p: "4px 8px",
                borderRadius: 1,
              }}
            >
              {Math.round(scale * 100)}%
            </Typography>

            <Tooltip title="Zoom Out">
              <IconButton
                onClick={handleZoomOut}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                <ZoomOut />
              </IconButton>
            </Tooltip>

            <Tooltip title="Center View">
              <IconButton
                onClick={onCenterView}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                <CenterFocusStrong />
              </IconButton>
            </Tooltip>

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 0.5,
                backgroundColor:
                  currentTheme === "dark"
                    ? "rgba(255, 255, 255, 0.12)"
                    : undefined,
              }}
            />

            <Tooltip title="Change Theme">
              <IconButton
                onClick={handleThemeMenuOpen}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                {getThemeIcon()}
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Mind Map">
              <IconButton
                onClick={onExportMap}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                <FileDownload />
              </IconButton>
            </Tooltip>

            <Tooltip title="Import Mind Map">
              <IconButton
                onClick={handleImportClick}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                <FileUpload />
              </IconButton>
            </Tooltip>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={onImportMap}
            />

            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 0.5,
                backgroundColor:
                  currentTheme === "dark"
                    ? "rgba(255, 255, 255, 0.12)"
                    : undefined,
              }}
            />

            <Tooltip title="Help">
              <IconButton
                onClick={() => setHelpDialogOpen(true)}
                color="primary"
                sx={{ color: currentTheme === "dark" ? "#90caf9" : undefined }}
              >
                <HelpCircle size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </MuiToolbar>
      </AppBar>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
        TransitionComponent={Fade}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HelpCircle size={20} />
            <Typography variant="h6">Mind Mapper - Help</Typography>
          </Box>
          <IconButton onClick={() => setHelpDialogOpen(false)} size="small">
            <Box sx={{ fontSize: 20, fontWeight: "bold" }}>×</Box>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Clock size={18} /> Keyboard Shortcuts
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Ctrl + Mouse: Drag to pan the canvas</li>
              <li>Ctrl + Z: Undo last action</li>
              <li>Ctrl + Y: Redo action</li>
              <li>Double-click node: Edit node text</li>
              <li>Delete key: Delete selected node</li>
            </Box>

            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Layout size={18} /> Working with Nodes
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Drag nodes to reposition them</li>
              <li>Click the + button to add a child node</li>
              <li>Click the Edit button to modify node properties</li>
              <li>Double-click on a node to edit its text</li>
              <li>Use the expand/collapse button to manage large mind maps</li>
            </Box>

            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Box
                component="span"
                sx={{ display: "flex", alignItems: "center" }}
              >
                Connecting Nodes
              </Box>
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                Click the link icon in the canvas to enter connection mode
              </li>
              <li>
                Click on a source node, then click on a target node to create a
                connection
              </li>
              <li>You can add labels and custom colors to your connections</li>
              <li>Connections persist when dragging nodes</li>
              <li>Exit connection mode by clicking the link icon again</li>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setHelpDialogOpen(false)}
            color="primary"
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Map Confirmation Dialog */}
      <Dialog
        open={newMapDialogOpen}
        onClose={() => setNewMapDialogOpen(false)}
        TransitionComponent={Fade}
      >
        <DialogTitle>Create New Mind Map</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Creating a new mind map will delete your current work. Do you want
            to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewMapDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleNewMapConfirm}
            color="primary"
            variant="contained"
          >
            Create New
          </Button>
        </DialogActions>
      </Dialog>

      {/* Theme Menu */}
      <Menu
        anchorEl={themeMenuAnchor}
        open={Boolean(themeMenuAnchor)}
        onClose={handleThemeMenuClose}
        TransitionComponent={Fade}
      >
        {themes.map((theme) => (
          <MenuItem
            key={theme.value}
            onClick={() => {
              onThemeChange(theme.value);
              handleThemeMenuClose();
            }}
            selected={currentTheme === theme.value}
          >
            <ListItemIcon>{theme.icon}</ListItemIcon>
            <ListItemText>{theme.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Toolbar;
