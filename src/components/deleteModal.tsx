import React, { useState } from "react";
import { Box, Modal, Typography, Button, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ModalDeleteIcon from "./icons/modalDeleteIcon";

import { useGraphViewer } from './GraphViewerContext';
import { fetchApi } from './utils/api';

interface DeleteModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteSuccess?: (withGuideline: boolean) => void;
  showSnackbar?: (message: string, severity: "success" | "error" | "info" | "warning") => void;
  isSingle?:boolean;
}

export default function DeleteModal({ open, setOpen, onDeleteSuccess, showSnackbar, isSingle }: DeleteModalProps) {
  const { guidelineId, selectedDatabase } = useGraphViewer();

  const[singleDeleteLoader, setSingleDeleteLoader] = useState(false)
  const[deleteLoader, setDeleteLoader] = useState(false)


  const handleDelete = async (withGuideline: boolean) => {
    if (!guidelineId) {
      showSnackbar?.("No guideline selected", "warning");
      return;
    }
    if(withGuideline){
      setSingleDeleteLoader(true)
    }else {
      setDeleteLoader(true)
    }

    try {
      const endpoint = withGuideline 
        ? `/v1/knowledge-map/guidelines/guideline-with-graph/${guidelineId}`
        : `/v1/knowledge-map/guidelines/graph/${guidelineId}`;

      const result = await fetchApi(endpoint, "DELETE", undefined, selectedDatabase?.id);
      
      if (result.success) {
        showSnackbar?.(withGuideline ? "Entirely deleted successfully!" : "Nodes & Edges deleted successfully!", "success");
        setOpen(false);
        if (onDeleteSuccess) {
          onDeleteSuccess(withGuideline);
        }
      } else {
        showSnackbar?.(`Failed to delete: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      showSnackbar?.("Error occurred while deleting.", "error");
    } finally {
      setSingleDeleteLoader(false)
      setDeleteLoader(false)
    }
  };
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
          Do you want to delete this guideline?
        </Typography>

        {/* Subtitle */}
        <Typography variant="body2" style={{ color: "#666", fontSize: "14px" }}>
          Please select whether you want to delete just the data or the entire guideline. This action cannot be undone.
        </Typography>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          {isSingle && <Button
            variant="outlined"
            onClick={() => handleDelete(false)}
            style={{
              borderColor: "#d3d3d3",
              color: "#000",
              minWidth:"100px",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            {deleteLoader ? (
          <CircularProgress size={20} sx={{ color: '#e50a0a' }} />) :"Delete Nodes & Edges"}
          </Button>}
          <Button
            variant="outlined"
            onClick={() => handleDelete(true)}
            style={{
              borderColor: "#d3d3d3",
              color: "#000",
              minWidth:"100px",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            {isSingle ? singleDeleteLoader ? (
          <CircularProgress size={20} sx={{ color: '#e50a0a' }} />) : "Delete Entirely" : singleDeleteLoader ? (
            <CircularProgress size={20} sx={{ color: '#e50a0a' }} />) : "Delete Guideline"}
          </Button>

          
        </div>
      </Box>
    </Modal>
  );
}
