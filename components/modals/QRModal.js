"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { QRCodeSVG } from "qrcode.react";
import { use1080x1920 } from "../../hooks/use1080x1920";

export default function QRModal({ open, onClose, mediaId, title }) {
  const is1080x1920 = use1080x1920();
  const [qrUrl, setQrUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && mediaId) {
      // Generate QR code URL that points to the download endpoint - this creates the scannable link
      const downloadUrl = `${window.location.origin}/api/media/${mediaId}/download`;
      setQrUrl(downloadUrl);
      setIsLoading(false);
    } else {
      setIsLoading(true); // Reset loading state when modal closes
    }
  }, [open, mediaId]);

  if (!mediaId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          height: "70vh",
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
        <QrCodeIcon fontSize="small" />
        <Typography variant="subtitle1">QR Code</Typography>
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

      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          textAlign: "center",
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            {/* QR Code */}
            <Box
              sx={{
                p: 3,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              <QRCodeSVG
                value={qrUrl}
                size={is1080x1920 ? 500 : 300} // Larger QR code for 1080x1920, standard size for other devices
                level="H" // High error correction for better scanning
                includeMargin={true}
              />
            </Box>

            {/* Instructions */}
            <Box sx={{ maxWidth: 400 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Scan to Download PDF
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use your device's camera or QR code scanner to scan this code.
                The PDF will automatically download to your device.
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
