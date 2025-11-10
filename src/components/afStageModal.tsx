import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type AFStageModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  stage?: string;
  evidence?: string;
  references?: string;
  status?: string;
};

export const AFStageModal: React.FC<AFStageModalProps> = ({
  open,
  onClose,
  title = "AF Stage",
  stage = "Paroxysmal AF",
  evidence = "I48.0 – Paroxysmal atrial fibrillation",
  references = "Section 2.2.1 – AF Classification",
  status = "Sufficient patient data",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: "500px",
          bgcolor: "#ffffff",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography sx={{ fontSize: "20px", fontWeight: 600, color: "#171A1C" }}>
          {title}
        </Typography>

        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ color: "#171A1C" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            backgroundColor: "#EDF1F5",
            borderRadius: 1,
            p: 2,
            mt:0.5
          }}
        >
          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
            Stage: {stage}
          </Typography>

          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
            Evidence: {evidence}
          </Typography>

          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
            References: {references}
          </Typography>

          <Typography sx={{ fontSize: "16px", fontWeight: 500 }}>
            Status: {status}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            onClick={onClose}
            sx={{
              border: "1px solid #e6e6e6",
              textTransform: "none",
              bgcolor: "white",
              color: "#000000",
              borderRadius: "8px",
              fontSize: "16px",
              px: 4,
              py: 1,
              "&:hover": {
                bgcolor: "white",
                border: "1px solid #dcdcdc",
              },
            }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
