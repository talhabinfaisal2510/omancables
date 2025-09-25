"use client";
import { useEffect, useRef } from "react";

export default function IdleTimeoutProvider({ children }) {
  const idleTimerRef = useRef(null);

  // Simple page refresh to reset everything to initial state
  const resetToInitialState = () => {
    window.location.reload(); // Refresh the entire page to reset all states
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      resetToInitialState();
    }, 30000); // 30 seconds timeout
  };

  useEffect(() => {
    // Start idle timer on app load
    resetIdleTimer();

    // Add global event listeners to detect any user activity across the entire app
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
      "touchmove",
    ];
    const handleActivity = () => resetIdleTimer();

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      // Cleanup on app unmount
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  return <>{children}</>;
}
