import { useState } from "react";
import { Button } from "@mui/material";
import { GeminiIcon } from "./icons/geminiIcon";

export const ButtonToggle = () => {
  const [selected, setSelected] = useState("patient");

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        padding: "3px",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <Button
        onClick={() => setSelected("patient")}
        sx={{
          textTransform: "none",
          fontSize: "16px",
          fontWeight: 500,
          px: "20px",
          height: "40px",
          borderRadius: "10px",
          backgroundColor: selected === "patient" ? "#ffffff" : "#f6f7f8",
          color: selected === "patient" ? "#171A1C": '#636B74',
          "&:hover": {
            backgroundColor: selected === "patient" ? "#ffffff" : "#f6f7f8",
          },
        }}
      >
        Patient Info
      </Button>

      <Button
        onClick={() => setSelected("chat")}
        sx={{
          textTransform: "none",
          fontSize: "16px",
          fontWeight: 500,
          px: "20px",
          height: "40px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: selected === "chat" ? "#ffffff" : "#f6f7f8",
          color: selected === "chat" ? "#171A1C": '#636B74',
          "&:hover": {
            backgroundColor: selected === "chat" ? "#ffffff" : "#f6f7f8",
          },
        }}
      >
        <GeminiIcon />
        Ai Chat
      </Button>
    </div>
  );
};
