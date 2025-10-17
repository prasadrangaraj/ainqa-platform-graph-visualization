import React from "react";
import { Box, IconButton, Typography, Drawer as MuiDrawer, type SxProps, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  drawerStyle?:SxProps;
  title?:string;
  showIcon?:boolean;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ open, onClose, children,drawerStyle, title, showIcon=true }) => {
  return (
    <MuiDrawer
          anchor="left"
          open={open}
          onClose={onClose}
          hideBackdrop
          PaperProps={{
            sx: {
              ...(drawerStyle),
              // width: 360, // Remove fixed width
              // py: 3,
              // px: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0px 0px 15px rgba(0,0,0,0.4)",
              pointerEvents: "auto",
              height: "100%",
              mt: "60px",
              zIndex: 1111111111111,
              // paddingTop:"80px"
            },
          }}
          sx={{
            pointerEvents: "none",
            
            zIndex: 11111111,
          }}
        >
    {/* <Modal
      open={open}
      onClose={onClose}
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      disableScrollLock
      sx={{
        // pointerEvents: "none", 
        zIndex: 111111,
      }}
    > */}
      <Box
        sx={{
          // pointerEvents: "auto", 
          // position: "absolute",
          // top: "55%",
          // left: "12%",
          // transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
            borderRadius: 2,
          // minWidth: "300px",
          textAlign: "center",
          padding: "10px 10px 10px 20px",
          height: "100%",
        }}
      >
        {showIcon && <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
         {showIcon && <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>}
        </div>}
        <Box sx={{ mt: 2, textAlign: "left", overflowY: "auto", maxHeight: "87%","&::-webkit-scrollbar": {
                  width: "6px", // Smaller width
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#bbb", // Lighter grey color
                  borderRadius: "3px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#999", // Slightly darker grey on hover
                },
                 }}>
          {children}
        </Box>
      </Box>

    </MuiDrawer>
  );
};

export default ErrorModal;
