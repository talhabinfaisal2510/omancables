"use client";
import {
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookIcon from "@mui/icons-material/MenuBook";

export default function PdfModal({ open, onClose, fileUrl }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          height: "90vh",
          mt: "5%",
          mx: "auto",
          borderRadius: 2,
          position: "relative",
          overflow: "visible",
        },
      }}
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start" } }}
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
        <MenuBookIcon fontSize="small" />
        <Typography variant="subtitle1">PDF</Typography>
      </Paper>

      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "error.main",
          zIndex: 999,
          bgcolor: "rgba(255,255,255,0.8)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, height: "100%" }}>
        {fileUrl ? (
          <iframe
            src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
              fileUrl
            )}`}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            No brochure available.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
