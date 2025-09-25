"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Paper,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { Capacitor } from "@capacitor/core";

export default function VideoModal({ open, onClose, media }) {
  // Handle database videos passed from VideoOverlay
  const videos = media || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  if (videos.length === 0) return null;

  const currentVideo = videos[currentIndex];

  // Use database URL directly - no local file handling needed
  const videoSrc = currentVideo.url;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          height: "auto",
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
        <PlayCircleFilledIcon fontSize="small" />
        <Typography variant="subtitle1">Video</Typography>
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
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box sx={{ position: "relative", width: "100%", textAlign: "center" }}>
          {/* Current Video */}
          <video
            src={videoSrc}
            autoPlay
            loop
            controls
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={() => {
              console.error(
                "Failed to load video from database URL:",
                videoSrc
              );
            }}
          />

          {/* Navigation (only if >1 video) */}
          {videos.length > 1 && (
            <>
              <IconButton
                onClick={handlePrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 16,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.4)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
              <IconButton
                onClick={handleNext}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: 16,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(0,0,0,0.4)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
