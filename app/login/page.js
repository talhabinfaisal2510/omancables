"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button, Typography, IconButton } from "@mui/material";
import BackIcon from "@mui/icons-material/ArrowBack";
import { use1080x1920 } from "../../hooks/use1080x1920";

export default function LoginPage() {
  const router = useRouter();
  const is1080x1920 = use1080x1920();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const validEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const validPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (email === validEmail && password === validPass) {
      sessionStorage.setItem(
        "authToken",
        JSON.stringify({
          email,
          timestamp: Date.now(),
        })
      );
      router.push("/cms");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: `radial-gradient(1200px 800px at 20% 10%, #ffffff 0%, #eeeeee 40%, #e2e2e2 70%, #d6d6d6 100%),
          linear-gradient(135deg, #fafafa 0%, #eaeaea 50%, #d6d6d6 100%)`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        transition: "background 300ms ease",
        color: "white",
        textAlign: "center",
        position: "relative",
      }}
    >
      <IconButton
        onClick={() => router.replace("/")}
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          backgroundColor: "#2f7ae5",
          borderRadius: "50%",
          padding: is1080x1920 ? "0.75rem" : "0.5rem",
          boxShadow: "0 6px 18px rgba(47, 122, 229, 0.35)",
          transition:
            "transform 180ms ease, box-shadow 180ms ease, background-color 240ms ease",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 10px 28px rgba(47, 122, 229, 0.5)",
            backgroundColor: "#2b6fda",
          },
          "&:active": {
            transform: "scale(0.98)",
            boxShadow: "0 4px 14px rgba(47, 122, 229, 0.35)",
            backgroundColor: "#1b4dbf",
          },
        }}
      >
        <BackIcon
          sx={{
            fontSize: is1080x1920 ? "6rem" : "4rem",
            color: "#000000",
          }}
        />
      </IconButton>

      <Typography variant="h2" gutterBottom sx={{ color: "#000000" }}>
        Admin Login
      </Typography>

      <form
        onSubmit={handleLogin}
        style={{ width: "100%", maxWidth: is1080x1920 ? "820px" : "400px" }}
      >
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            sx: {
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiInputBase-input": {
                fontSize: is1080x1920 ? "3rem" : "1.25rem",
                padding: is1080x1920 ? "1rem 1.25rem" : "0.75rem 1rem",
              },
            },
          }}
          InputLabelProps={{
            sx: {
              fontSize: is1080x1920 ? "3rem" : "1rem",
            },
          }}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            sx: {
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiInputBase-input": {
                fontSize: is1080x1920 ? "3rem" : "1.25rem",
                padding: is1080x1920 ? "1rem 1.25rem" : "0.75rem 1rem",
              },
            },
          }}
          InputLabelProps={{
            sx: {
              fontSize: is1080x1920 ? "3rem" : "1rem",
            },
          }}
        />
        {error && <Typography sx={{ color: "red", mt: 1 }}>{error}</Typography>}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            py: is1080x1920 ? 2.25 : 1.5,
            fontSize: is1080x1920 ? "3rem" : "1.2rem",
            minHeight: is1080x1920 ? 72 : 52,
            backgroundColor: "#2f7ae5",
            boxShadow: "0 6px 18px rgba(47, 122, 229, 0.35)",
            transition:
              "transform 180ms ease, box-shadow 180ms ease, background-color 240ms ease",
            "&:hover": {
              transform: "scale(1.02)",
              backgroundColor: "#2b6fda",
              boxShadow: "0 10px 28px rgba(47, 122, 229, 0.5)",
            },
            "&:active": {
              transform: "scale(0.99)",
              boxShadow: "0 4px 14px rgba(47, 122, 229, 0.35)",
              backgroundColor: "#1b4dbf",
            },
          }}
        >
          Login
        </Button>
      </form>
    </Box>
  );
}
