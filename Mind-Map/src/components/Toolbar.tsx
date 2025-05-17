import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar as MuiToolbar, 
  IconButton, 
  Typography, 
  Box, 
  Menu,
  MenuItem,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Divider,
  Slide
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  FileDownload,
  FileUpload,
  AddCircleOutline,
  Undo,
  Redo,
  Delete,
  Settings,
  Help,
  Close,
  ViewInAr as ThemeIcon
} from '@mui/icons-material';
import { Brain, Eraser, HelpCircle, Palette } from 'lucide-react';
import { Position } from '../types/MindMap';

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
  canUndo,
  canRedo
}) => {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [newMapDialogOpen, setNewMapDialogOpen] = useState(false);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.1, 0.5));
  };

  const handleNewMapConfirm = () => {
    onNewMap();
    setNewMapDialogOpen(false);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={2} sx={{ 
        background: 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)',
      }}>
        <MuiToolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Brain size={28} color="#3949ab" strokeWidth={2} />
            <Typography variant="h6" component="div" sx={{ ml: 1, fontWeight: 600, color: '#3949ab' }}>
              Mind Map Builder
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="New Mind Map">
              <IconButton onClick={() => setNewMapDialogOpen(true)} color="primary">
                <AddCircleOutline />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Undo">
              <span>
                <IconButton onClick={onUndoAction} disabled={!canUndo} color="primary">
                  <Undo />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title="Redo">
              <span>
                <IconButton onClick={onRedoAction} disabled={!canRedo} color="primary">
                  <Redo />
                </IconButton>
              </span>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} color="primary">
                <ZoomIn />
              </IconButton>
            </Tooltip>
            
            <Typography variant="body2" sx={{ 
              fontWeight: 500, 
              minWidth: '55px', 
              textAlign: 'center',
              bgcolor: 'rgba(0,0,0,0.05)',
              p: '4px 8px',
              borderRadius: 1
            }}>
              {Math.round(scale * 100)}%
            </Typography>
            
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} color="primary">
                <ZoomOut />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Reset View">
              <IconButton onClick={onResetView} color="primary">
                <CenterFocusStrong />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            
            <Tooltip title="Change Theme">
              <IconButton onClick={handleThemeMenuOpen} color="primary">
                <Palette size={20} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export Mind Map">
              <IconButton onClick={onExportMap} color="primary">
                <FileDownload />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Import Mind Map">
              <IconButton onClick={handleImportClick} color="primary">
                <FileUpload />
              </IconButton>
            </Tooltip>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={onImportMap}
            />

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            
            <Tooltip title="Help">
              <IconButton onClick={() => setHelpDialogOpen(true)} color="primary">
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
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Mind Map Builder - Help</Typography>
          <IconButton onClick={() => setHelpDialogOpen(false)} size="small">
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>Keyboard Shortcuts</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Ctrl + Mouse: Drag to pan the canvas</li>
              <li>Ctrl + Z: Undo last action</li>
              <li>Ctrl + Y: Redo action</li>
              <li>Double-click node: Edit node text</li>
              <li>Delete key: Delete selected node</li>
            </Box>
            
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 2 }}>Working with Nodes</Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>Drag nodes to reposition them</li>
              <li>Right-click on a node to open the context menu</li>
              <li>Change colors, shapes, and add children from the context menu</li>
              <li>Double-click on a node to edit its text</li>
              <li>Use the expand/collapse button to manage large mind maps</li>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* New Map Confirmation Dialog */}
      <Dialog
        open={newMapDialogOpen}
        onClose={() => setNewMapDialogOpen(false)}
      >
        <DialogTitle>Create New Mind Map</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Creating a new mind map will delete your current work. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewMapDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewMapConfirm} color="primary" variant="contained">
            Create New
          </Button>
        </DialogActions>
      </Dialog>

      {/* Theme Menu */}
      <Menu
        anchorEl={themeMenuAnchor}
        open={Boolean(themeMenuAnchor)}
        onClose={handleThemeMenuClose}
      >
        <MenuItem onClick={handleThemeMenuClose}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f8f9fa', borderRadius: '50%', mr: 1, border: '1px solid #ddd' }} />
          Light Mode
        </MenuItem>
        <MenuItem onClick={handleThemeMenuClose}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#343a40', borderRadius: '50%', mr: 1, border: '1px solid #ddd' }} />
          Dark Mode
        </MenuItem>
        <MenuItem onClick={handleThemeMenuClose}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            borderRadius: '50%', 
            mr: 1,
            border: '1px solid #ddd'
          }} />
          Gradient Theme
        </MenuItem>
      </Menu>
    </>
  );
};

export default Toolbar;