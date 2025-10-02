"use client";
import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import VideoOverlay from "./VideoOverlay";

export default function VideoHero({
  src,
}) {
  const [ready, setReady] = React.useState(false);
  const [currentVideoSrc, setCurrentVideoSrc] = React.useState(src); // State to manage dynamic video source

  // Handler to change video source from overlay buttons
  const handleVideoChange = (newSrc) => {
    setCurrentVideoSrc(newSrc);
    setReady(false); // Reset loading state for new video
  };

  return (
    <Box sx={{
      position: "relative",
      flex: "8 1 0%", // CHANGED: Shorthand for flexGrow: 8, flexShrink: 1, flexBasis: 0% - takes 8 parts of available space
      width: "100%",
      minHeight: "50vh" // ADDED: Maintain minimum height constraint
    }}>
      {!ready && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "absolute",
            inset: 0,
          }}
        >
          <CircularProgress
            size={`clamp(40px, 8vw, 56px)`} // Changed: Fluid sizing using clamp for responsiveness
            thickness={5}
            color="inherit" // NEW: use current color
            sx={{
              mb: 2,
              color: "#89f7fe", // NEW: visible blue on dark bg
              filter: "drop-shadow(0 0 6px rgba(137,247,254,0.6))", // NEW: glow so it’s clearly visible
              zIndex: 4, // NEW: ensure spinner sits above text
            }}
          />

          <Typography
            variant="h6"
            sx={{
              mt: `clamp(0.5rem, 2vw, 2rem)`, // Changed: Fluid margin using clamp
              fontWeight: "bold",
              letterSpacing: "0.05em",
              fontSize: `clamp(0.875rem, 2.5vw, 1.25rem)`, // Added: Fluid font size for better scaling
              background: "linear-gradient(90deg, #00c6ff, #0072ff)", // NEW: gradient text for visual appeal
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "pulse 1.5s ease-in-out infinite", // NEW: subtle pulse animation
              "@keyframes pulse": {
                "0%": { opacity: 0.6 },
                "50%": { opacity: 1 },
                "100%": { opacity: 0.6 },
              },
            }}
          >
            🎬 Preparing your video...
          </Typography>
        </Stack>
      )}
      <Box
        component="video"
        src={currentVideoSrc} // Use dynamic video source instead of static prop
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        autoPlay
        muted
        loop
        playsInline
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <VideoOverlay onVideoChange={handleVideoChange} />{" "}
    </Box>
  );
}
