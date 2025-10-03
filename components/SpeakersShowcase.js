"use client";
import React, { useState,useEffect } from "react"; // ADDED: useState hook for modal state management
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ImageModal from "../components/modals/ImageModal"; // ADDED: Import ImageModal component
import { useIdleReset } from "../components/IdleTimerProvider";

const isLive = (startTime, endTime) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = startTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;

  const [endHour, endMin] = endTime.split(':').map(Number);
  const endMinutes = endHour * 60 + endMin;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export default function SpeakersShowcase({ speakers }) {
  const { resetUI } = useIdleReset(); // ADDED: Get resetUI from context
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  // ADDED: Close speaker modal when idle timeout triggers
  useEffect(() => {
    if (resetUI > 0) { // ADDED: Only reset if resetUI has been triggered
      setSelectedSpeaker(null); // ADDED: Close speaker modal
    }
  }, [resetUI]); // ADDED: Trigger whenever resetUI counter changes

  if (!speakers || speakers.length === 0) return null;

  // Determine live speaker based on current time
  const liveSpeaker = speakers.find(s => isLive(s.startTime, s.endTime));

  // CHANGED: Only set featured if there's a live speaker, otherwise null
  const featured = liveSpeaker || null;

  // CHANGED: If no live speaker, show all speakers in carousel
  const rest = featured ? speakers.filter(s => s._id !== featured._id) : speakers;

  return (
    <Box
      sx={{
        flex: "2 1 0%",
        display: "flex",
        alignItems: "center",
        px: 2,
        overflow: "hidden",
        color: "#fff",
        position: "relative",
        background: "linear-gradient(180deg, #f0f4ff 0%, #eef6ff 100%)",
      }}
    >

      {/* Featured Speaker Card */}
      {featured && (
        <Stack
          onClick={() => setSelectedSpeaker(featured)}
          alignItems="center"
          justifyContent="center"
          spacing="clamp(2px, 0.4vh, 6px)" // Changed: Responsive spacing between elements
          sx={{
            minWidth: "clamp(140px, 20vw, 280px)",
            maxWidth: "clamp(200px, 25vw, 320px)",
            width: "clamp(180px, 22vw, 300px)",
            height: "85%",
            px: "clamp(8px, 1vw, 16px)",
            py: "clamp(8px, 1.5vh, 16px)", // Changed: Increased vertical padding scaling
            mr: "clamp(12px, 2vw, 24px)",
            overflow: "hidden", // Added: Prevents content overflow outside card
            borderRadius: 3,
            bgcolor: liveSpeaker ? "rgba(59, 130, 246, 0.25)" : "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(79, 70, 229, 0.05))", // Changed: Blue background for live speaker
            backdropFilter: "blur(16px)",
            border: liveSpeaker ? "3px solid #3b82f6" : "2px solid rgba(59, 130, 246, 0.3)", // Changed: Blue border instead of green
            boxShadow: liveSpeaker
              ? "0 0 25px rgba(59, 130, 246, 0.6)" // Changed: Light blue shadow instead of green
              : "0 4px 12px rgba(59, 130, 246, 0.3)",
            animation: liveSpeaker ? "pulseGlow 2s infinite" : "none",
            position: "relative",
            zIndex: 1,
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: liveSpeaker
                ? "0 0 35px rgba(59, 130, 246, 0.9)" // Changed: Blue hover shadow instead of green
                : "0 8px 20px rgba(59, 130, 246, 0.5)",
            },
            "@keyframes pulseGlow": {
              "0%": { boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }, // Changed: Blue pulse animation instead of green
              "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.9)" }, // Changed: Blue pulse animation instead of green
              "100%": { boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }, // Changed: Blue pulse animation instead of green
            },
          }}
        >
          {/* LIVE badge - simple badge only */}
          {liveSpeaker && (
            <Box
              sx={{
                position: "absolute",
                top: "clamp(6px, 0.8vh, 12px)",
                right: "clamp(6px, 0.8vh, 12px)",
                bgcolor: "#e53935",
                color: "white",
                fontWeight: "bold",
                px: "clamp(8px, 1.2vw, 16px)",
                py: "clamp(4px, 0.6vh, 8px)",
                borderRadius: "99px",
                zIndex: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                letterSpacing: "0.5px",
                fontSize: "clamp(0.6rem, 1.2vw, 0.8rem)", // Responsive LIVE text size
              }}
            >
              LIVE
            </Box>
          )}

          <Box
            component="img"
            src={featured ? featured.imageUrl : "nothing"}
            alt={featured.name}
            sx={{
              width: "clamp(54px, 9vh, 108px)",
              height: "clamp(54px, 9vh, 108px)",
              borderRadius: "50%",
              objectFit: "cover",
              border: liveSpeaker ? "3px solid #3b82f6" : "2px solid rgba(59, 130, 246, 0.5)", // Changed from green to blue border
              boxShadow: liveSpeaker
                ? "0 0 15px rgba(59, 130, 246, 0.6)" // Changed from green to blue shadow
                : "0 2px 8px rgba(0,0,0,0.2)",
            }}
          />

          <Typography
            fontWeight="bold"
            textAlign="center"
            sx={{
              fontSize: "clamp(0.7rem, 1.8vw, 1.1rem)", // Changed: Adjusted scaling for better visibility
              color: "#1a237e",
              width: "100%",
              px: "clamp(2px, 0.5vw, 8px)",
              lineHeight: 1.2, // Changed: Tighter line height to save vertical space
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              flexShrink: 0, // Added: Prevents text from being completely hidden
              minHeight: "clamp(18px, 3vh, 28px)", // Added: Ensures minimum space for text
            }}
          >
            {featured.name}
          </Typography>

          {featured.designation && (
            <Typography
              variant="body2"
              sx={{
                color: "#455a64",
                fontSize: "clamp(0.6rem, 1.4vw, 0.85rem)", // Changed: Adjusted scaling range
                width: "100%",

                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1, // Changed: Limit designation to 1 line to save space
                WebkitBoxOrient: "vertical",
                flexShrink: 0, // Added: Prevents text from being completely hidden
                minHeight: "clamp(14px, 2vh, 20px)", // Added: Ensures minimum space for designation
              }}
              textAlign="center"
            >
              {featured.designation}
            </Typography>
          )}
        </Stack>
      )}

      {/* Carousel Section */}
      <Box
        sx={{
          flex: 1,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          zIndex: 1,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            whiteSpace: "nowrap",
            willChange: "transform",
            animation: "marqueeScroll 40s linear infinite",
          }}
        >
          {rest.concat(rest).map((spk, idx) => (
            <Box
              key={`${spk._id}-${idx}`}
              onClick={() => setSelectedSpeaker(spk)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "180px",
                height: "85%",
                px: 2,
                py: 2,
                borderRadius: 3,
                bgcolor: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                flexShrink: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "scale(1.05)",
                  bgcolor: "rgba(255, 255, 255, 0.85)",
                  boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                },
              }}
            >
              <Box
                component="img"
                src={spk.imageUrl}
                alt={spk.name}
                sx={{
                  width: "clamp(54px, 9vh, 108px)",
                  height: "clamp(54px, 9vh, 108px)",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: liveSpeaker ? "3px solid #3b82f6" : "2px solid rgba(59, 130, 246, 0.5)",
                  boxShadow: liveSpeaker
                    ? "0 0 15px rgba(59, 130, 246, 0.6)"
                    : "0 2px 8px rgba(0,0,0,0.2)",
                  flexShrink: 0, // Added: Prevents image from shrinking below set size
                }}
              />

              <Typography
                fontWeight="bold"
                textAlign="center"
                sx={{
                  fontSize: "clamp(0.8rem, 1vw, 0.95rem)",
                  color: "#1a237e",
                  mb: 0.5,
                }}
                noWrap
              >
                {spk.name}
              </Typography>

              {spk.designation && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#546e7a",
                    fontSize: "0.75rem"
                  }}
                  textAlign="center"
                  noWrap
                >
                  {spk.designation}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Marquee Animation */}
      <style jsx global>{`
        @keyframes marqueeScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
      {selectedSpeaker && (
        <ImageModal
          speaker={{
            name: selectedSpeaker.name,
            designation: selectedSpeaker.designation,
            image: selectedSpeaker.popupImageUrl, // Using imageUrl from your data structure
            isLive: selectedSpeaker._id === liveSpeaker?._id // Check if clicked speaker is live
          }}
          onClose={() => setSelectedSpeaker(null)} // Close modal by resetting state
        />
      )}
    </Box>
  );
}