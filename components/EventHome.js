"use client";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import VideoHero from "./VideoHero";
import SpeakersShowcase from "./SpeakersShowcase";
import { useIdleReset } from "../components/IdleTimerProvider";
const theme = createTheme({ palette: { mode: "dark" } });

import { useState, useEffect } from "react";


export default function EventHome() {
  const [speakers, setSpeakers] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { resetKey} = useIdleReset(); // ADDED: Also get resetUI (though not used here, just for consistency)

  useEffect(() => {
    // CHANGED: Fetch both speakers and home configuration
    const fetchData = async () => {
      try {
        const [speakersRes, homeRes] = await Promise.all([
          fetch('/api/speakers'),
          fetch('/api/home') // ADDED: Fetch home config for video URL
        ]);

        const speakersData = await speakersRes.json();
        const homeData = await homeRes.json();

        if (speakersData.success) {
          setSpeakers(speakersData.data);
        }

        if (homeData.success) {
          setVideoUrl(homeData.data.videoUrl); // ADDED: Set dynamic video URL
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // ADDED: Update live speaker every minute based on current time
    const intervalId = setInterval(() => {
      setSpeakers(prev => [...prev]); // Trigger re-render to check live status
    }, 60000); // Check every 60 seconds

    return () => clearInterval(intervalId); // ADDED: Cleanup interval on unmount
  }, []);

  return (
    <div key={`home-${resetKey}`}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{
          height: "100vh",
          display: "flex", // ADDED: Use flex layout for proper height distribution
          flexDirection: "column", // ADDED: Stack children vertically
          overflow: "hidden" // ADDED: Prevent any scrolling at root level
        }}>
          {videoUrl && <VideoHero src={videoUrl} />}
          {!loading && <SpeakersShowcase speakers={speakers} />}
        </Box>
      </ThemeProvider>
    </div >
  );
}