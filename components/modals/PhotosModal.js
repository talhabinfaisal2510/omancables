"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { motion, AnimatePresence } from "framer-motion";

// Variants for sliding
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
    transition: { duration: 0.3 },
  }),
};

export default function PhotosModal({ open, onClose, media }) {
  const images = media?.filter((m) => m.type === "image") || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);

  const pauseSlideshow = () => {
    setPaused(true);
    // Resume after 10s
    setTimeout(() => setPaused(false), 10000);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    pauseSlideshow();
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    pauseSlideshow();
  };

  const handleDotClick = (i) => {
    setDirection(i > currentIndex ? 1 : -1);
    setCurrentIndex(i);
    pauseSlideshow();
  };

  useEffect(() => {
    if (!open || images.length === 0 || paused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open, images.length, paused]);

  if (images.length === 0) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "95vw",
          height: "60vh",
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
        <PhotoCameraIcon fontSize="small" />
        <Typography variant="subtitle1">Photos</Typography>
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
          p: 0,
        }}
      >
        {/* Image with sliding animation */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden", // only clips the sliding images
          }}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentIndex}
              src={images[currentIndex].fileUrl}
              alt={images[currentIndex].fileName}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: "50vh",
                borderRadius: "8px",
                objectFit: "cover",
                position: "absolute",
              }}
            />
          </AnimatePresence>
        </Box>

        {/* Prev button OUTSIDE image box */}
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
            zIndex: 1000,
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        {/* Next button OUTSIDE image box */}
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
            zIndex: 1000,
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>

        {/* Dots */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 3,
            gap: 1,
          }}
        >
          {images.map((_, i) => (
            <Box
              key={i}
              onClick={() => handleDotClick(i)}
              sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: i === currentIndex ? "maroon" : "grey.400",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
