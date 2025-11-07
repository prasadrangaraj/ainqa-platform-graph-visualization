// StepperNavigation.tsx
import React from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  type StepIconProps,
} from "@mui/material";
import { CircleTickIcon } from "./icons/circleTickIcon";
import { LeftArrowIcon } from "./icons/leftArrowIcon";
import { RightArrowIcon } from "./icons/rightArrowIcon";

interface StepperNavigationProps {
  steps?: string[];
  activeStep?: number; // optional
  onStepChange?: (step: number) => void; // optional callback
}

const defaultSteps = [
  "Finding Diagnosis",
  "Individual Guideline",
  "Consolidated Guideline",
];

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, icon } = props;

  return completed ? (
    <CircleTickIcon style={{ width: 25 }} />
  ) : (
    <Box
      sx={{
        width: 25,
        height: 24,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "#32383E" : "#E3E7EB",
        color: active ? "#ffffff" : "#555E68",
        fontSize: "14px",
        fontWeight: 600,
        paddingBottom: "2px",
      }}
    >
      {icon}
    </Box>
  );
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({
  steps = defaultSteps,
  activeStep: controlledStep,
  onStepChange,
}) => {
  const isControlled = controlledStep !== undefined;
  const [internalStep, setInternalStep] = React.useState(1);

  const activeStep = isControlled ? controlledStep : internalStep;

  const setActiveStep = (value: number) => {
    if (isControlled) {
      onStepChange?.(value);
    } else {
      setInternalStep(value);
    }
  };

  const handleNext = () =>
    setActiveStep(Math.min(activeStep + 1, steps.length - 1));

  const handleBack = () =>
    setActiveStep(Math.max(activeStep - 1, 0));

  return (
    <Box
      sx={{
        width: "100%",
        p: "12px 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "20px",
        background: "#FFFFFF",
      }}
    >
      <Button
        variant="outlined"
        onClick={handleBack}
        disabled={activeStep === 0}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 500,
          px: 2,
          color: "#3C4759",
          borderColor: "#D0D8E3",
          "&:hover": { borderColor: "#AEB8C8" },
          gap: 1,
          fontSize: "16px",
        }}
      >
        <LeftArrowIcon /> Previous
      </Button>

      <Stepper
        activeStep={activeStep}
        sx={{
          display: "flex",
          flex: 1,
          mx: 4,

          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
            borderColor: "#32383E",
          },
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
            borderColor: "#32383E",
            borderWidth: "3px",
          },

          "& .MuiStepConnector-line": {
            borderColor: "#D8DEE7",
            borderWidth: 3,
          },

          "& .MuiStepLabel-label.Mui-active": {
            color: "#000000 !important",
          },
          "& .MuiStepLabel-label.Mui-completed": {
            color: "#000000 !important",
          },
          "& .MuiStepLabel-label": {
            fontSize: "14px",
            color: "#4A5568 !important",
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index}>
            <StepLabel StepIconComponent={CustomStepIcon}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Button
        variant="contained"
        onClick={handleNext}
        disabled={activeStep === steps.length - 1}
        sx={{
          background: "linear-gradient(270deg, #006DA7 0%, #0CA5F6 100%)",
          textTransform: "none",
          borderRadius: "8px",
          px: 3,
          "&:hover": {
            background: "linear-gradient(270deg, #005884 0%, #0894E5 100%)",
          },
          gap: 1,
          fontSize: "16px",
        }}
      >
        Next <RightArrowIcon />
      </Button>
    </Box>
  );
};
