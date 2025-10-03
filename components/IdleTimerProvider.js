"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

// Create context for global reset mechanism
const IdleResetContext = createContext(null);

export const useIdleReset = () => {
  const context = useContext(IdleResetContext);
  if (!context) {
    throw new Error('useIdleReset must be used within IdleTimeoutProvider');
  }
  return context;
};

export default function IdleTimeoutProvider({ children }) {
  const idleTimerRef = useRef(null);
  const [resetKey, setResetKey] = useState(0);
  const [resetUI, setResetUI] = useState(0); // ADDED: Separate UI reset counter that doesn't remount components

  // CHANGED: Trigger UI reset without component remount
  const triggerReset = () => {
    console.log('Idle timeout: Resetting UI state');
    setResetUI(prev => prev + 1); // CHANGED: Only increment UI reset, not full component remount
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      triggerReset();
    }, 30000);
  };

  useEffect(() => {
    resetIdleTimer();

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    const handleActivity = () => resetIdleTimer();

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetKey]);

  return (
    <IdleResetContext.Provider value={{ resetKey, resetUI, triggerReset }}> {/* ADDED: Pass resetUI to context */}
      <div key={resetKey}>
        {children}
      </div>
    </IdleResetContext.Provider>
  );
}