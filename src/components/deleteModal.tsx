import React from "react";
import { Box, Modal, Typography, Button, IconButton } from "@mui/material";
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
  const { guidelineId } = useGraphViewer();

  console.log(isSingle,'isSingle')

  const handleDelete = async (withGuideline: boolean) => {
    if (!guidelineId) {
      showSnackbar?.("No guideline selected", "warning");
      return;
    }

    try {
      const endpoint = withGuideline 
        ? `/guidelines/guideline-with-graph/${guidelineId}`
        : `/guidelines/graph/${guidelineId}`;

      const result = await fetchApi(endpoint, "DELETE");
      
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
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            Delete Nodes & Edges
          </Button>}
          <Button
            variant="outlined"
            onClick={() => handleDelete(true)}
            style={{
              borderColor: "#d3d3d3",
              color: "#000",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            {isSingle ?  "Delete Entirely" : "Delete Guideline"}
          </Button>

          
        </div>
      </Box>
    </Modal>
  );
}
