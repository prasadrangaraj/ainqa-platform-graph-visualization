import React from "react";
import { Box, Modal, Typography, Button, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ModalDeleteIcon from "./icons/modalDeleteIcon";

interface DeleteModalProps {
  open: boolean;
  loading:boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteText:string;
  handleClickDelete:() => void;
  deleteSubtitle:string;
  deleteTitle:string;

}

export default function ModalComponent({ open, setOpen, deleteText, loading, handleClickDelete, deleteSubtitle, deleteTitle }: DeleteModalProps) {

  return (
    <Modal open={open} onClose={() => setOpen(false)} sx={{zIndex: '11111'}}>
      <Box
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "460px",
          backgroundColor: "white",
          boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={() => setOpen(false)}
          style={{ position: "absolute", top: "10px", right: "10px", color: "#666" }}
        >
          <CloseIcon />
        </IconButton>

        {/* Trash icon */}
        <div
          style={{
            backgroundColor: "#FDECEC",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <ModalDeleteIcon/>
        </div>

        {/* Title */}
        <div style={{display:'flex',flexDirection:'column',gap:'1px', marginBottom: "24px"}}>
        <Typography variant="h6" style={{ fontWeight: 600, fontSize: "18px" }}>
          {deleteTitle}
        </Typography>

        {/* Subtitle */}
        <Typography variant="body2" style={{ color: "#666", fontSize: "14px" }}>
          {deleteSubtitle}
        </Typography>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Button
            variant="outlined"
            onClick={handleClickDelete}
            style={{
              borderColor: "#d3d3d3",
              minWidth:"100px",
              color: "#000",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            {loading ? (
          <CircularProgress size={20} sx={{ color: '#e50a0a' }} />
        ) : (
            deleteText)}
          </Button>


          
        </div>
      </Box>
    </Modal>
  );
}
