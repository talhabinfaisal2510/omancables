"use client";
import React, { useState,useEffect } from "react";
import { Box, Button, Typography, Collapse } from "@mui/material";
import { use1080x1920 } from "../hooks/use1080x1920";
import PdfModal from "../components/modals/PdfModal";
import WebModal from "../components/modals/WebModal";
import QRModal from "../components/modals/QRModal";
import PhotosModal from "../components/modals/PhotosModal";
import VideoModal from "../components/modals/VideoModal";

const VideoOverlay = ({ onVideoChange }) => {
  const is1080x1920 = use1080x1920();
  // Remove hardcoded buttonHierarchy object completely
  const [bubbles, setBubbles] = useState([]); // Store fetched bubbles from database
  const [loading, setLoading] = useState(true);
  // Add this function to build hierarchy dynamically from database bubbles
  const buildBubbleHierarchy = (parentId = null) => {
    return bubbles
      .filter(bubble => {
        // For root level (parentId === null), find bubbles with null or undefined parentBubbleId
        if (parentId === null) {
          return !bubble.parentBubbleId;
        }
        // For child levels, match parentBubbleId
        return bubble.parentBubbleId === parentId || bubble.parentBubbleId?._id === parentId;
      })
      .reduce((acc, bubble) => {
        const bubbleId = bubble._id || bubble.id;
        acc[bubble.title] = {
          id: bubbleId,
          media: bubble.media, // Include media reference for leaf bubbles
          subButtons: buildBubbleHierarchy(bubbleId) // Recursively build child hierarchy
        };
        return acc;
      }, {});
  };

  // Get root level bubbles (call this where buttonHierarchy was used)
  const buttonHierarchy = buildBubbleHierarchy();

  // Video mapping for different buttons - centralized video source management
  const videoSources = {
    "Featured Events":
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/earth.mp4",
    "Safety First (Zero & Beyond)":
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "OCI Information":
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/earth.mp4",
    "Discover OCI":
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  };

  // State to track active hierarchy levels
  // State to track active hierarchy levels
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  // Modal state management for different media types
  const [modalState, setModalState] = useState({
    open: false,
    type: null,
    url: null,
    title: null,
    mediaId: null, // Added mediaId for QR modal to generate download link
    mediaArray: null, // Added for PhotosModal which expects array of media objects
  });

  useEffect(() => {
    const fetchBubbles = async () => {
      try {
        const response = await fetch('/api/bubble'); // Fetch all bubbles with populated media
        if (!response.ok) throw new Error('Failed to fetch bubbles');
        const data = await response.json();
        setBubbles(data.bubbles || []); // Store bubbles in state
      } catch (error) {
        console.error('Error fetching bubbles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBubbles();
  }, []);

  const fetchMediaByTitle = async (title) => {
    try {
      const response = await fetch(
        `/api/media?title=${encodeURIComponent(title)}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.media; // Returns media object with type and url
      }
      return null;
    } catch (error) {
      console.error("Error fetching media:", error);
      return null;
    }
  };

  const handleButtonClick = async (buttonLabel, bubbleData = null, isMainButton = false) => { // Added bubbleData parameter
    console.log("Button clicked:", buttonLabel);

    // First check if bubbleData has media populated (from database)
    if (bubbleData?.media) {
      const data = bubbleData.media; // Use pre-populated media from bubble
      console.log("Using bubble media:", data);

      // Handle different content types (same logic as before, just using bubble.media instead of API call)
      if (data.type === "pdf") {
        setModalState({
          open: true,
          type: "pdf",
          url: data.url,
          title: data.title,
          mediaId: data._id,
        });
        return;
      } else if (data.type === "website" && data.websiteUrl) {
        setModalState({
          open: true,
          type: "website",
          url: data.websiteUrl,
          title: data.title,
          mediaId: data._id,
        });
        return;
      } else if (data.type === "qr") {
        setModalState({
          open: true,
          type: "qr",
          url: null,
          title: data.title,
          mediaId: data._id,
        });
        return;
      } else if (data.type === "image") {
        const imageArray = [{
          type: "image",
          fileUrl: data.url,
          fileName: data.title,
          _id: data._id,
        }];
        setModalState({
          open: true,
          type: "image",
          url: null,
          title: data.title,
          mediaId: data._id,
          mediaArray: imageArray,
        });
        return;
      } else if (data.type === "video") {
        const videoArray = [{
          type: "video",
          url: data.url,
          fileName: data.title,
          _id: data._id,
        }];
        setModalState({
          open: true,
          type: "video",
          url: null,
          title: data.title,
          mediaId: data._id,
          mediaArray: videoArray,
        });
        return;
      }
    }

    // Fallback: fetch media by title if not in bubble data (backward compatibility)
    const data = await fetchMediaByTitle(buttonLabel);
    if (data) {
      // ... keep existing fetchMediaByTitle logic for fallback
    }

    // Handle hierarchy state for main buttons (keep existing logic)
    if (isMainButton) {
      if (activeMain === buttonLabel) {
        setActiveMain(null);
        setActiveSub(null);
      } else {
        setActiveMain(buttonLabel);
        setActiveSub(null);
      }
    }
  };

  // Modal close handler
  const handleCloseModal = () => {
    console.log("Closing modal"); // Debug log for modal close
    setModalState({
      open: false,
      type: null,
      url: null,
      title: null,
      mediaId: null,
      mediaArray: null, // Added mediaArray reset for PhotosModal
    }); // Added mediaId reset
  };

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        p: is1080x1920 ? 4 : { xs: 1, sm: 2, md: 3 },
        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
        zIndex: 10,
      }}
    >
      {/* Main 3 buttons */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: is1080x1920 ? "40px" : "12px",
          marginBottom: activeMain !== null ? "16px" : "0",
          transition: "margin-bottom 0.3s ease",
          animation: "slideUp 0.6s ease-out",
          "@keyframes slideUp": {
            from: { transform: "translateY(20px)", opacity: 0 },
            to: { transform: "translateY(0)", opacity: 1 },
          },
        }}
      >
        {Object.keys(buttonHierarchy).map((buttonLabel, index) => {
          // Use hierarchy keys
          const button = {
            label: buttonLabel,
            id: buttonHierarchy[buttonLabel].id,
          };
          return (
            <Box
              key={button.id}
              sx={{
                animation: `slideUp 0.6s ease-out ${index * 0.1
                  }s both, float 3s ease-in-out infinite ${index * 0.5}s`,
                "@keyframes float": {
                  "0%, 100%": {
                    transform: "translateY(0px)",
                  },
                  "50%": {
                    transform: "translateY(-8px)",
                  },
                },
                "&:hover": {
                  transform: "translateY(-6px) scale(1.08)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: "none",
                },
                "&:active": {
                  transform: "translateY(-3px) scale(0.96)",
                  transition: "all 0.15s ease",
                },
              }}
            >
              <Button
                variant="contained"
                onClick={() => handleButtonClick(buttonLabel, buttonHierarchy[buttonLabel], true)}
                sx={{
                  minWidth: is1080x1920
                    ? "260px"
                    : { xs: "80px", sm: "100px", md: "120px" },
                  height: is1080x1920
                    ? "94px"
                    : { xs: "40px", sm: "44px", md: "48px" },
                  borderRadius: 3,
                  background:
                    activeMain === button.label ? "#2563eb" : "#1e3a8a", // Dark blue background for main buttons
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: is1080x1920
                    ? "1.2rem"
                    : { xs: "0.75rem", sm: "0.8rem", md: "0.9rem" },
                  textTransform: "none",
                  boxShadow:
                    activeMain === button.label
                      ? "0 12px 48px rgba(37, 99, 235, 0.6), 0 8px 24px rgba(30, 58, 138, 0.4)" // Enhanced shadow when selected
                      : "0 8px 32px rgba(30, 58, 138, 0.4), 0 4px 16px rgba(30, 58, 138, 0.2)", // Normal shadow
                  backdropFilter: "blur(12px)",
                  border: "2px solid rgba(255,255,255,0.1)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    // Shimmer effect overlay
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "left 0.6s ease",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    activeMain === button.label
                      ? "translateY(-4px) scale(1.2)"
                      : "translateY(0)", // Lift and scale selected button
                  animation:
                    "pulse 2s ease-in-out infinite, glow 4s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%, 100%": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    },
                    "50%": {
                      boxShadow:
                        "0 6px 20px rgba(0,0,0,0.25), 0 0 20px rgba(59, 130, 246, 0.3)",
                    },
                  },
                  "@keyframes glow": {
                    "0%, 100%": {
                      border: "1px solid rgba(255,255,255,0.2)",
                    },
                    "50%": {
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                    },
                  },
                  "&:hover": {
                    background: "#2563eb", // Lighter blue on hover for clear feedback
                    boxShadow:
                      "0 12px 48px rgba(30, 58, 138, 0.6), 0 8px 24px rgba(37, 99, 235, 0.4)",
                    transform: "translateY(-6px) scale(1.08)",
                    border: "2px solid rgba(255,255,255,0.3)",
                    animation: "none",
                    transition: "all 0.3s ease", // Smooth transition for hover
                  },
                  "&:active": {
                    transform: "translateY(-1px) scale(0.96)", // Smooth click feedback
                    boxShadow: "0 2px 8px rgba(30, 58, 138, 0.4)",
                    transition: "all 0.15s cubic-bezier(0.4, 0, 0.6, 1)", // Natural click transition
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: is1080x1920
                        ? "1.4rem"
                        : { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
                      transition: "all 0.3s ease",
                      animation: "textGlow 3s ease-in-out infinite",
                      "@keyframes textGlow": {
                        "0%, 100%": {
                          textShadow: "0 0 0px rgba(59, 130, 246, 0)",
                        },
                        "50%": {
                          textShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
                        },
                      },
                      "&:hover": {
                        color: "#3b82f6",
                        animation: "none",
                      },
                    }}
                  >
                    {button.label}
                  </Typography>
                </Box>
              </Button>
            </Box>
          );
        })}
      </Box>

      {/* Expanded 6 buttons */}
      <Collapse
        in={activeMain !== null}
        timeout={600}
        sx={{
          // Extended timeout for smoother animation
          "& .MuiCollapse-wrapper": {
            transition:
              "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important",
          },
        }}
      >
        <Box sx={{ mt: 1 }}>
          {/* Sub Buttons Level */}
          {activeMain && buttonHierarchy[activeMain]?.subButtons && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                },
                justifyItems: "center",
                gap: is1080x1920 ? "12px" : "6px",
                mb: activeSub ? 2 : 0, // Add margin if sub-sub buttons will appear
              }}
            >
              {Object.keys(buttonHierarchy[activeMain].subButtons).map(
                (subLabel, index) => {
                  const subButton =
                    buttonHierarchy[activeMain].subButtons[subLabel];
                  return (
                    <Box
                      key={subButton.id}
                      sx={{
                        animation: `slideUp 0.4s ease-out ${index * 0.05
                          }s both`,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleButtonClick(subLabel, subButton); // Pass bubble data including media
                          if (subButton.subButtons && Object.keys(subButton.subButtons).length > 0) { // Check if has children
                            setActiveSub(activeSub === subLabel ? null : subLabel);
                          }
                        }}
                        sx={{
                          width: is1080x1920
                            ? "300px"
                            : { xs: "140px", sm: "160px", md: "180px" },
                          height: is1080x1920
                            ? "70px"
                            : { xs: "50px", sm: "56px", md: "62px" }, // Increased height for better visual presence
                          borderRadius: 3,
                          background:
                            activeSub === subLabel ? "#22c55e" : "#166534", // Lighter green when selected, dark green when not
                          transform:
                            activeSub === subLabel
                              ? "translateY(-3px) scale(1.15)"
                              : "translateY(0)", // Lift and scale selected sub button
                          boxShadow:
                            activeSub === subLabel
                              ? "0 12px 40px rgba(34, 197, 94, 0.5), 0 6px 20px rgba(22, 101, 52, 0.3)" // Enhanced shadow when selected
                              : "0 6px 20px rgba(22, 101, 52, 0.3), 0 3px 10px rgba(22, 101, 52, 0.2)", // Normal shadow
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: is1080x1920
                            ? "1.5rem"
                            : { xs: "0.8rem", sm: "0.9rem", md: "1rem" }, // Increased font sizes
                          position: "relative",
                          overflow: "hidden",

                          "@keyframes borderRotate": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" },
                          },
                          textTransform: "none",
                          border: "1px solid rgba(59, 130, 246, 0.4)",
                          backdropFilter: "blur(8px)",
                          "&:hover": {
                            background: "#22c55e", // Lighter green on hover for clear feedback
                            border: "2px solid rgba(255,255,255,0.6)",
                            boxShadow:
                              "0 16px 64px rgba(22, 101, 52, 0.6), 0 8px 32px rgba(34, 197, 94, 0.4)",
                            transform: "translateY(-6px) scale(1.08)",
                            transition: "all 0.3s ease", // Smooth transition for hover
                          },
                        }}
                      >
                        {subLabel}
                      </Button>
                    </Box>
                  );
                }
              )}
            </Box>
          )}

          {/* Sub-Sub Buttons Level */}
          {activeMain &&
            activeSub &&
            buttonHierarchy[activeMain]?.subButtons[activeSub]?.subButtons && (
              <Box
                sx={{
                  display: "flex",
                  gap: is1080x1920 ? "8px" : "4px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {Object.keys(
                  buttonHierarchy[activeMain].subButtons[activeSub].subButtons
                ).map((subSubLabel, index) => {
                  const subSubButton =
                    buttonHierarchy[activeMain].subButtons[activeSub]
                      .subButtons[subSubLabel];
                  return (
                    <Box
                      key={subSubButton.id}
                      sx={{
                        animation: `slideUp 0.3s ease-out ${index * 0.03
                          }s both`,
                      }}
                    >
                      <Button
                        variant="text"
                        onClick={() => handleButtonClick(subSubLabel, subSubButton)} // Trigger video change for sub-sub buttons
                        sx={{
                          width: is1080x1920
                            ? "300px"
                            : { xs: "140px", sm: "160px", md: "180px" },
                          height: is1080x1920
                            ? "55px"
                            : { xs: "28px", sm: "30px", md: "32px" },
                          borderRadius: 1.5,
                          background: "#991b1b", // Dark red background for sub-sub buttons (no selection state needed as they're leaf buttons)
                          color: "#ffffff",
                          fontWeight: 600,
                          transform: "translateY(0)", // Add transform property for consistency
                          boxShadow:
                            "0 4px 16px rgba(153, 27, 27, 0.3), 0 2px 8px rgba(153, 27, 27, 0.2)", // Normal shadow
                          fontWeight: 600, // Increased font weight for better visibility
                          fontSize: is1080x1920
                            ? "1.75rem"
                            : { xs: "0.6rem", sm: "0.65rem", md: "0.7rem" },
                          textTransform: "none",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          "&:hover": {
                            background: "#dc2626", // Lighter red on hover for clear feedback
                            border: "2px solid rgba(255,255,255,0.9)",
                            boxShadow:
                              "0 12px 48px rgba(153, 27, 27, 0.5), 0 6px 24px rgba(220, 38, 38, 0.4)",
                            transform: "translateY(-4px) scale(1.06)",
                            transition: "all 0.3s ease", // Smooth transition for hover
                          },
                        }}
                      >
                        {subSubLabel}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            )}
        </Box>
      </Collapse>
      {/* PDF Modal */}
      <PdfModal
        open={modalState.open && modalState.type === "pdf"}
        onClose={handleCloseModal}
        fileUrl={modalState.url}
      />

      {/* Website Modal */}
      <WebModal
        open={modalState.open && modalState.type === "website"}
        onClose={handleCloseModal}
        signupLink={modalState.url}
      />
      {/* QR Modal - Added for QR code functionality */}
      <QRModal
        open={modalState.open && modalState.type === "qr"}
        onClose={handleCloseModal}
        mediaId={modalState.mediaId}
        title={modalState.title}
      />
      <PhotosModal
        open={modalState.open && modalState.type === "image"}
        onClose={handleCloseModal}
        media={modalState.mediaArray} // Pass media array as expected by PhotosModal
      />
      <VideoModal
        open={modalState.open && modalState.type === "video"}
        onClose={handleCloseModal}
        media={modalState.mediaArray} // Pass media array as expected by VideoModal
      />
    </Box>
  );
};

export default VideoOverlay;
