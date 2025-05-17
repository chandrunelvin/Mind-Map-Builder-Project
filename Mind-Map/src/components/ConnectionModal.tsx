import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { Close as CloseIcon } from '@mui/icons-material';

interface ConnectionModalProps {
  open: boolean;
  onClose: () => void;
  onAddConnection: (label: string, color: string) => void;
  currentTheme: string;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  open,
  onClose,
  onAddConnection,
  currentTheme,
}) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(currentTheme === 'dark' ? '#90caf9' : '#3949ab');

  const handleSubmit = () => {
    onAddConnection(label, color);
    // Reset form
    setLabel('');
    setColor(currentTheme === 'dark' ? '#90caf9' : '#3949ab');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Add Connection</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          id="label"
          label="Connection Label (Optional)"
          type="text"
          fullWidth
          variant="outlined"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          sx={{ mb: 3 }}
        />
        
        <Typography variant="subtitle2" gutterBottom>
          Connection Color
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <HexColorPicker color={color} onChange={setColor} />
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              width: '100%',
              height: 30,
              backgroundColor: color,
              borderRadius: 1,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              marginTop: 1,
              transition: 'all 0.2s',
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Connection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectionModal;