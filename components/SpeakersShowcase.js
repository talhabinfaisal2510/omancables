"use client";
import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

export default function SpeakersShowcase({ speakers, title = "Speakers" }) {
  if (!speakers || speakers.length === 0) return null;

  const [featured, ...rest] = speakers;
  const sliderItems = [...rest, ...rest];

  return (
    <Box
      sx={{
        pt: 1,
        pb: 0,
        minHeight: "21vh",
        background: "linear-gradient(180deg, #f0f4ff 0%, #eef6ff 100%)", // UPDATED: simple, modern soft-blue background
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: 700, color: "#0b3d91" }} // UPDATED: richer blue title for contrast on new bg
        >
          {title}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
            gap: { xs: 2, sm: 2.5, md: 3 },
            alignItems: "stretch",
          }}
        >
          <Card
            sx={{
              background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
              borderRadius: 10,
              border: "2px solid",
              borderColor: "#3b82f6",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
              animation: "pulse-glow 2s ease-in-out infinite",
              "@keyframes pulse-glow": {
                "0%, 100%": {
                  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                },
                "50%": {
                  boxShadow: "0 12px 48px rgba(59, 130, 246, 0.5)",
                },
              },
              "&:hover": {
                transform: "translateY(-8px) scale(1.02)",
                boxShadow: "0 20px 60px rgba(59, 130, 246, 0.6)",
                "&::before": {
                  opacity: 1,
                },
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                transition: "left 0.5s",
                opacity: 0,
              },
              "&:hover::before": {
                left: "100%",
              },
            }}
          >
            <Chip
              label="LIVE"
              color="error"
              size="small"
              sx={{
                position: "absolute",
                top: 14,
                left: 18,
                fontWeight: 700,
                zIndex: 2,
                background: "rgba(255, 255, 255, 0.9)",
                color: "#dc2626",
                px: 1,
                py: 0.5,
                "& .MuiChip-label": {
                  color: "#dc2626",
                },
              }}
            />
            <CardMedia
              component="img"
              image={featured.photo}
              alt={featured.name}
              sx={{
                height: { xs: 180, sm: 200, md: 220 },
                width: "100%",
                objectFit: "cover",
                filter: "brightness(0.9) contrast(1.1)",
                p: 1,
              }}
            />
            <CardContent
              sx={{
                py: { xs: 1.5, sm: 1.75, md: 2 },
                px: { xs: 1.5, sm: 2, md: 2.5 },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "#fff",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  mb: 0.5,
                  fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                }}
              >
                {featured.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                }}
              >
                {featured.designation}
              </Typography>
            </CardContent>
          </Card>

          <Box
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 3,
              px: 0.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: "max-content",
                animation: "slide-left 18s linear infinite",
                "@keyframes slide-left": {
                  from: { transform: "translateX(0)" },
                  to: { transform: "translateX(-50%)" },
                },
              }}
            >
              {sliderItems.map((s, idx) => (
                <Card
                  key={`${s.id}-${idx}`}
                  sx={{
                    minWidth: { xs: 200, sm: 240, md: 260 },
                    maxWidth: { xs: 220, sm: 260, md: 280 },
                    bgcolor: "#fff",
                    borderRadius: 10,
                    overflow: "hidden",
                    transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: 2,
                    "&:hover": {
                      transform: "translateY(-6px) scale(1.02)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={s.photo}
                    alt={s.name}
                    sx={{
                      width: { xs: 200, sm: 240, md: 260 },
                      height: { xs: 140, sm: 160, md: 170 },
                      objectFit: "cover",
                      p: 0.5,
                    }}
                    loading="lazy"
                  />
                  <CardContent
                    sx={{
                      py: { xs: 1, sm: 1.25, md: 1.5 },
                      px: { xs: 1, sm: 1.25, md: 1.5 },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: "#111",
                        mb: 0.25,
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                      }}
                    >
                      {s.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#555",
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.8rem",
                          md: "0.85rem",
                        },
                      }}
                    >
                      {s.designation}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
            <Divider
              sx={{ position: "absolute", inset: "auto 0 0 0", opacity: 0.08 }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
