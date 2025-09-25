"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Input,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/navigation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Button titles array
const buttonTitles = [
  "Discover OCI",
  "OCI Information",
  "Media",
  "Website iFrame",
  "3D Tour",
  "Sustainability Journey",
  "Ambitions",
  "United Nations SDGs",
  "Focus Areas",
  "Featured Events",
  "Sustainability Day",
  "Today's Agenda",
  "OCI Chatbot",
  "Safety First (Zero & Beyond)",
  "Safety Video",
  "Emergency Evacuation Map",
];

// Get all button titles
const getAllTitles = () => buttonTitles;

export default function CmsPage() {
  const router = useRouter();
  const [openForm, setOpenForm] = useState(false);
  const [submitting, setSubmitting] = useState(false); // NEW: track API in-flight state

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    url: "",
    websiteUrl: "",
  });
  const [message, setMessage] = useState("");
  const [openLogoutConfirm, setOpenLogoutConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const titles = getAllTitles(buttonTitles);

  // Check auth on load
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.type) {
        setMessage("❌ Title and type are required");
        return;
      }
      setSubmitting(true); // NEW: show progress while API runs

      // Debug logging to see what we're sending
      console.log("=== DEBUG CMS SEND ===");
      console.log("Form data type:", formData.type);
      console.log("Form data title:", formData.title);
      console.log(
        "Selected file:",
        selectedFile ? selectedFile.name : "No file"
      );

      if (formData.type === "website") {
        // Validate website URL is provided
        if (!formData.websiteUrl?.trim()) {
          setMessage("❌ Website URL is required");
          return;
        }

        console.log("🌐 SUBMITTING WEBSITE:", {
          title: formData.title,
          websiteUrl: formData.websiteUrl,
        });

        // Handle website type separately using websites API
        const res = await fetch("/api/websites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            websiteUrl: formData.websiteUrl,
          }),
        });

        if (res.ok) {
          const responseData = await res.json();
          console.log("✅ WEBSITE API SUCCESS:", responseData);
          setMessage("✅ Website added successfully");
          handleReset();
        } else {
          const errorData = await res.json();
          console.log("❌ WEBSITE API ERROR:", errorData);
          setMessage(
            `❌ Failed to add website: ${errorData.error || "Unknown error"}`
          );
        }
      } else if (["qr", "image", "video", "pdf"].includes(formData.type)) {
        // Handle file uploads - unified approach for all file types
        if (!selectedFile) {
          setMessage("❌ Please select a file to upload");
          return;
        }

        const submitData = new FormData();
        submitData.append("title", formData.title);
        submitData.append("type", formData.type); // Explicit type for API processing
        submitData.append("file", selectedFile); // Generic file key as fallback

        // Debug log FormData contents
        console.log("FormData contents:");
        for (let [key, value] of submitData.entries()) {
          console.log(key, value);
        }

        const res = await fetch("/api/media", {
          method: "POST",
          body: submitData,
        });

        if (res.ok) {
          const responseData = await res.json();
          console.log("API Response:", responseData); // Debug response
          setMessage(`✅ ${formData.type.toUpperCase()} uploaded successfully`);
          handleReset();
        } else {
          const errorData = await res.json();
          console.log("API Error:", errorData); // Debug error
          setMessage(
            `❌ Failed to upload ${formData.type}: ${
              errorData.error || "Unknown error"
            }`
          );
        }
      } else {
        setMessage("❌ Unsupported type selected");
        return;
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error processing media");
    } finally {
      setSubmitting(false); // NEW: hide progress after API completes
    }
  };

  const handleReset = () => {
    setFormData({
      type: "",
      title: "",
      url: "",
      websiteUrl: "",
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOpenForm(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    router.replace("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #89f7fe, #0663d0)",

        color: "white",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        pt: 8,
        pb: 16,
      }}
    >
      <IconButton
        onClick={() => setOpenLogoutConfirm(true)}
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
        <LogoutIcon
          sx={{
            fontSize: "4rem",
            color: "#000",
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: "50%",
            padding: "0.5rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.8)",
              color: "#fff",
            },
          }}
        />
      </IconButton>

      <Typography variant="h3" gutterBottom>
        CMS Dashboard
      </Typography>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={() => setOpenForm(true)}
          sx={{
            background: "linear-gradient(135deg, #ff512f, #dd2476)",
            "&:hover": {
              background: "linear-gradient(135deg, #dd2476, #ff512f)",
            },
            py: 1.5,
            px: 4,
            fontSize: "1.2rem",
            borderRadius: 2,
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
        >
          Upload Media
        </Button>
      </Box>

      {/* Upload Form Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Media</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
            >
              {titles.map((title) => (
                <MenuItem key={title} value={title}>
                  {title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              margin="normal"
            >
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="website">Website</MenuItem>
              <MenuItem value="qr">QR Code</MenuItem>
            </TextField>

            {formData.type === "website" && ( // CHANGED: render only when website selected
              <TextField
                fullWidth
                label="Website URL"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                margin="normal"
              />
            )}

            {["image", "video", "pdf", "qr"].includes(formData.type) && ( // NEW: file chooser only for upload types
              <FormControl fullWidth margin="normal">
                <Input
                  type="file"
                  inputRef={fileInputRef}
                  onChange={handleFileSelect}
                  inputProps={{
                    accept:
                      formData.type === "image"
                        ? "image/*"
                        : formData.type === "video"
                        ? "video/*"
                        : formData.type === "pdf"
                        ? ".pdf"
                        : "image/*,.pdf", // CHANGED: safe default for 'qr'
                  }}
                  startAdornment={
                    <CloudUploadIcon sx={{ mr: 1, color: "primary.main" }} />
                  }
                  disabled={submitting} // NEW: prevent changes while submitting
                />
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)} disabled={submitting}>
            {" "}
            {/* NEW: disabled during submit */}
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting} // NEW: prevent double submits
            sx={{ minWidth: "8rem" }} // NEW: keep button width stable for spinner
          >
            {submitting ? ( // UPDATED: show spinner and text together
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} /> Submit
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Logout Dialog */}
      <Dialog
        open={openLogoutConfirm}
        onClose={() => setOpenLogoutConfirm(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to Logout?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutConfirm(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {message && (
        <Typography sx={{ mt: 4, textAlign: "center" }}>{message}</Typography>
      )}
    </Box>
  );
}
