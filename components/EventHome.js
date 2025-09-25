"use client";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import VideoHero from "./VideoHero";
import SpeakersShowcase from "./SpeakersShowcase";

const theme = createTheme({ palette: { mode: "dark" } });

const SAMPLE_SPEAKERS = [
  {
    id: "1",
    name: "Aisha Al-Harthy",
    designation: "Sustainability Lead",
    photo: "/vercel.svg",
  },
  {
    id: "2",
    name: "Omar Al-Farsi",
    designation: "R&D Director",
    photo: "/next.svg",
  },
  {
    id: "3",
    name: "Layla Al-Mandhari",
    designation: "Innovation Manager",
    photo: "/window.svg",
  },
  {
    id: "4",
    name: "Hassan Al-Hashmi",
    designation: "ESG Analyst",
    photo: "/globe.svg",
  },
  {
    id: "5",
    name: "Sara Nasser",
    designation: "Chief Sustainability Officer",
    photo: "/vercel.svg",
  },
];

export default function EventHome() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <VideoHero src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" />
        <SpeakersShowcase speakers={SAMPLE_SPEAKERS} />
      </Box>
    </ThemeProvider>
  );
}
