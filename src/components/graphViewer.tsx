import React, { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import Navbar from "./navbar";
import GraphEditor from "./graphEditor";
import GuidelineDb from "./guidelineDb";
import { useGraphViewer, GraphViewerProvider } from "./GraphViewerContext";
import CloseIcon from "@mui/icons-material/Close";

interface GraphViewerProps {
    isNavbar?:boolean;
}

const GraphViewerInternal: React.FC<GraphViewerProps> = ({isNavbar=true}) => {
  const { mode, setMode, clearState, hasUnsavedChanges, isEditingJson } = useGraphViewer();
  const [active, setActive] = useState(mode);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingModeChange, setPendingModeChange] = useState<"graph" | "guidelines" | null>(null);

  // Sync active state with context mode
  useEffect(() => {
    setActive(mode);
  }, [mode]);

  // Function to handle mode change with unsaved changes check
  const handleModeChange = (newMode: "graph" | "guidelines") => {
    // If we're already in the target mode, do nothing
    if (active === newMode) return;

    // If there are unsaved changes in JSON editor, show modal for ANY mode change
    if (hasUnsavedChanges && isEditingJson) {
      setPendingModeChange(newMode);
      setShowUnsavedChangesModal(true);
      return;
    }
    
    // If no unsaved changes, proceed
    setMode(newMode);
    clearState();
  };

  // Handle save changes and switch mode
  const handleSaveChangesAndSwitch = () => {
    // This will be handled by the GraphEditor's/GuidelineDb's internal save mechanism
    // We just need to switch mode after giving time for save
    setTimeout(() => {
      if (pendingModeChange) {
        setMode(pendingModeChange);
        clearState();
        setPendingModeChange(null);
        setShowUnsavedChangesModal(false);
      }
    }, 500);
  };

  // Handle discard changes and switch mode
  const handleDiscardChangesAndSwitch = () => {
    if (pendingModeChange) {
      setMode(pendingModeChange);
      clearState();
      setPendingModeChange(null);
      setShowUnsavedChangesModal(false);
    }
  };

  // Handle cancel mode change
  const handleCancelModeChange = () => {
    setPendingModeChange(null);
    setShowUnsavedChangesModal(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position:'relative',
        height: "100vh",
        padding: 0,
        margin: 0,
      }}
    >
      {isNavbar &&<Navbar
        // active={active}
        // setActive={setActive}
      />}

      {/* Unsaved Changes Modal for Mode Switching */}
      {showUnsavedChangesModal && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '400px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div style={{display:'flex',width:'100%',justifyContent:'space-between'}}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Unsaved Changes
              </Typography>
              <span onClick={handleCancelModeChange} style={{cursor:'pointer'}}>
                <CloseIcon/>
              </span>
            </div>
            <Typography variant="body2" sx={{ color: 'text.secondary', marginBottom: '24px' }}>
              You have unsaved changes in the JSON editor. Do you want to save them before switching modes?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px',width:'100%' }}>
              <Button
                onClick={handleDiscardChangesAndSwitch}
                variant="outlined"
                sx={{
                  textTransform: 'none',
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#ffebee',
                    borderColor: '#d32f2f',
                  },
                }}
              >
                Discard
              </Button>
              <Button
                onClick={handleSaveChangesAndSwitch}
                variant="contained"
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#01205C',
                  '&:hover': {
                    backgroundColor: '#001a4a',
                  },
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <div style={{ display: "flex", position:'absolute', width:"300px", top:isNavbar ? 84 : 26, left: 0, right: 0, margin: "auto", justifyContent:'center', zIndex: 1, alignItems: "center", gap: 13 }}>
        <div
          style={{
            backgroundColor: "#01205C",
            borderRadius: "5px",
            padding: 5,
            height: "35px",
          }}
        >
          <Button
            onClick={() => {
              handleModeChange("guidelines");
            }}
            sx={{
              backgroundColor: active === "guidelines" ? "white" : "#01205C",
              color: active === "guidelines" ? "black" : "white",
              textTransform: "none",
              px: 2.5,
              borderRadius: "8px",
              height: "35px",
              "&:hover": {
                backgroundColor: active === "guidelines" ? "#f5f5f5" : "#01205C",
                color: active === "guidelines" ? "#01205C" : "white",
              },
            }}
          >
            Knowledge Base
          </Button>
          <Button
            onClick={() => {
              handleModeChange("graph");
            }}
            sx={{
              backgroundColor: active === "graph" ? "white" : "#01205C",
              color: active === "graph" ? "black" : "white",
              textTransform: "none",
              px: 2.5,
              borderRadius: "8px",
              height: "35px",
              "&:hover": {
                backgroundColor: active === "graph" ? "#f5f5f5" : "#01205C",
                color: active === "graph" ? "#01205C" : "white",
              },
            }}
          >
            Graph Editor
          </Button>
        </div>

        {/* <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "white", mx: 1 }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <HomeIcon />
            <Typography style={{ color: "white" }}>Home</Typography>
          </div>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "white", mx: 1 }}
          />

          <div>
            <Typography style={{ color: "white", fontSize: 13 }}>
              pcdoctosit@gmail.com
            </Typography>
            <Typography style={{ color: "white", fontSize: 12 }}>
              Role : Doctor
            </Typography>
          </div>

          <Avatar
            variant="rounded"
            sx={{
              backgroundColor: "white",
              color: "black",
              width: 32,
              height: 32,
            }}
          >
            F
          </Avatar> */}
      </div>
      {active === "graph" && (
        <GraphEditor isNavbar={isNavbar} setActive={setActive as React.Dispatch<React.SetStateAction<string>>} />
      )}

      {active === "guidelines" && <GuidelineDb isNavbar={isNavbar} />}
    </div>
  );
};

// Main GraphViewer component that includes its own provider
const GraphViewer: React.FC<GraphViewerProps> = (props) => {
  return (
    <GraphViewerProvider>
      <GraphViewerInternal {...props} />
    </GraphViewerProvider>
  );
};

export default GraphViewer;