import React, { useState } from "react";

import Navbar from "./navbar";
import GraphEditor from "./graphEditor";
import GuidelineDb from "./guidelineDb";
import { useSearchParams } from "react-router-dom";
import {
  Button,
} from "@mui/material";

interface GraphViewerProps {
    isNavbar?:boolean;
}

const GraphViewer: React.FC<GraphViewerProps> = ({isNavbar=true}) => {

  const [active, setActive] = useState("graph");

  const [ searchParams, setSearchParams] = useSearchParams();
  console.log("Search params:", searchParams.toString());

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

<div style={{ display: "flex", position:'absolute', width:"300px", top:84, left: 0, right: 0, margin: "auto", justifyContent:'center', zIndex: 1, alignItems: "center", gap: 13 }}>
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
                setActive("guidelines")
                setSearchParams({});
              }}
              sx={{
                backgroundColor: active === "guidelines" ? "white" : "#01205C",
                color: active === "guidelines" ? "black" : "white",
                textTransform: "none",
                px: 2.5,
                borderRadius: "8px",
                height: "35px",
              }}
            >
              Knowledge Base
            </Button>
            <Button
              onClick={() => {
                setActive("graph")
                setSearchParams({});
              }}
              sx={{
                backgroundColor: active === "graph" ? "white" : "#01205C",
                color: active === "graph" ? "black" : "white",
                textTransform: "none",
                px: 2.5,
                borderRadius: "8px",
                height: "35px",
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
        <GraphEditor setActive={setActive}/>
      )}

      {active === "guidelines" && <GuidelineDb />}
    </div>
  );
};

export default GraphViewer;
