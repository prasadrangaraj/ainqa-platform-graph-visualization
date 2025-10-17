import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

interface ButtonData {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  sx?: object;
}

interface OptionBoxProps {
  title: string;
  buttons: ButtonData[];
}

const OptionBox: React.FC<OptionBoxProps> = ({ title, buttons }) => {
  return (
    <Card
      sx={{
        width: 173,
        borderRadius: 3, // Slightly reduced border radius for a softer look
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", // Softer shadow
        backgroundColor: "#fff",
        textAlign: "center",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out", // Smoother transition
        "&:hover": {
          transform: "translateY(-3px)", // Subtle lift on hover
          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
        },
        "& .MuiCardContent-root": { paddingBottom: "14px" },
        fontFamily: "'Poppins', sans-serif", // Assuming Poppins or similar modern font is available or can be added
      }}
    >
      {/* Header */}
      {
        title && (
            <Box
        sx={{
          background: "#01205C", // Solid color header
          color: "white",
          py: 1.5, // Increased vertical padding
          fontWeight: 600,
          fontSize: "1rem", // Slightly smaller font size for a cleaner look
          margin: "0", // Remove margin to make it flush with the card
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </Box>
        )
      }

      {/* Buttons */}
      <CardContent>
        <Stack spacing={1.4}>
          {buttons.map((btn, index) => (
            <Button
              key={index}
              variant="outlined"
              sx={{
                textTransform: "none",
                borderRadius: 1, // Slightly more rounded buttons
                borderColor: "#d1d1d1", // Lighter border color
                backgroundColor: "#f8f8f8", // Lighter background for default state
                "&:hover": {
                  backgroundColor: "#e0e0e0", // Subtle hover background
                  borderColor: "#a0a0a0", // Darker border on hover
                },
                color: "#01205C", // Use the new color for text
                height: "35px", // Increased height for better clickability
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "13px",
                ...btn.sx,
              }}
              onClick={btn.onClick}
            >
              {btn.icon}
              {btn.label}
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OptionBox;