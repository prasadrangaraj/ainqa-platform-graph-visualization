import React, { useState, useEffect } from "react";

import Navbar from "./navbar";
import GraphEditor from "./graphEditor";
import GuidelineDb from "./guidelineDb";
import { useGraphViewer, GraphViewerProvider } from "./GraphViewerContext";
import {
  Button,
} from "@mui/material";

interface GraphViewerProps {
    isNavbar?:boolean;
}

const GraphViewerInternal: React.FC<GraphViewerProps> = ({isNavbar=true}) => {
  const { mode, setMode, clearState } = useGraphViewer();
  const [active, setActive] = useState(mode);

  // Sync active state with context mode
  useEffect(() => {
    setActive(mode);
  }, [mode]);

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
                setMode("guidelines");
                clearState();
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
                setMode("graph");
                setTimeout(() => {
                  clearState();
                }, 100)
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
