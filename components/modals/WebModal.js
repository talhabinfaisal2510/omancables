"use client";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HowToRegIcon from "@mui/icons-material/HowToReg";

export default function WebModal({ open, onClose, signupLink }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          height: "85vh",
          mt: "5%",
          mx: "auto",
          borderRadius: 2,
          position: "relative",
          overflow: "visible",
        },
      }}
    >
      {/* Floating label */}
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: -20,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: "maroon",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 4,
          py: 0.5,
          borderRadius: "6px",
          zIndex: 999,
        }}
      >
        <HowToRegIcon fontSize="small" />
        <Typography variant="subtitle1">Website</Typography>
      </Paper>

      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          left: 16,
          top: 16,
          color: "error.main",
          zIndex: 999,
          bgcolor: "rgba(255,255,255,0.8)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, height: "100%", overflow: "hidden" }}>
        {signupLink ? (
          <Box sx={{ width: "100%", height: "100%", pointerEvents: "auto" }}>
            <iframe
              src={signupLink}
              title="Sign Up Form"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </Box>
        ) : (
          "No signup link configured."
        )}
      </DialogContent>
    </Dialog>
  );
}
