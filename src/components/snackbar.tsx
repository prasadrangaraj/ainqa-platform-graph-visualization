import React from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ 
        zIndex: 99999,
        position: 'fixed !important',
        '& .MuiSnackbarContent-root': {
          position: 'relative',
          zIndex: 99999
        }
      }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          '&.MuiAlert-standardSuccess': {
            backgroundColor: '#4caf50',
            color: '#fff'
          },
          '&.MuiAlert-standardError': {
            backgroundColor: '#f44336',
            color: '#fff'
          },
          '&.MuiAlert-standardWarning': {
            backgroundColor: '#ff9800',
            color: '#fff'
          },
          '&.MuiAlert-standardInfo': {
            backgroundColor: '#2196f3',
            color: '#fff'
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;