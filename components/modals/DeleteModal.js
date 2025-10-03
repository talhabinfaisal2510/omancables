"use client";
import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const DeleteModal = ({ open, onClose, onConfirm, message, loading = false }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(16px)",

                },
            }}
        >
            {/* Close button in top-right corner */}
            <IconButton
                onClick={onClose}
                disabled={loading}
                sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: "rgba(0, 0, 0, 0.5)",
                    "&:hover": {
                        bgcolor: "rgba(59, 130, 246, 0.1)", // CHANGED: Light blue background on hover (matches your app's blue theme)
                        color: "#3b82f6", // CHANGED: Proper blue text on hover
                    },
                }}
            >
                <CloseIcon />
            </IconButton>

            {/* Title with warning icon */}
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    pt: 3,
                    pb: 2,
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "rgba(59, 130, 246, 0.1)", // CHANGED: Proper blue with transparency (matches your app's #3b82f6)
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <WarningAmberIcon
                        sx={{
                            fontSize: 28,
                            color: "#3b82f6", // CHANGED: Proper blue hex value (matches your app's primary blue)
                        }}
                    />
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: "#1a237e",
                        fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                    }}
                >
                    Delete
                </Typography>
            </DialogTitle>

            {/* Content with delete message */}
            <DialogContent sx={{ pb: 2 }}>
                <Typography
                    sx={{
                        color: "#455a64",
                        fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
                        lineHeight: 1.6,
                    }}
                >
                    {message || "Are you sure you want to delete this item? This action cannot be undone."}
                </Typography>
            </DialogContent>

            {/* Action buttons - Cancel (left) and Delete (right) */}
            <DialogActions
                sx={{
                    px: 3,
                    pb: 3,
                    pt: 1,
                    gap: 2,
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                        minWidth: "clamp(100px, 15vw, 120px)",
                        height: "clamp(40px, 5vh, 48px)",
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                        color: "#455a64",
                        borderColor: "rgba(69, 90, 100, 0.3)",
                        "&:hover": {
                            borderColor: "#455a64",
                            bgcolor: "rgba(69, 90, 100, 0.05)",
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        minWidth: "clamp(100px, 15vw, 120px)",
                        height: "clamp(40px, 5vh, 48px)",
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                        bgcolor: "#3b82f6", // CHANGED: Proper blue hex (matches your app's primary blue)
                        color: "#ffffff",
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", // CHANGED: Blue shadow to match button color
                        "&:hover": {
                            bgcolor: "#2563eb", // CHANGED: Darker blue on hover (consistent with your VideoOverlay buttons)
                            boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)", // CHANGED: Enhanced blue shadow on hover
                        },
                        "&:disabled": {
                            bgcolor: "rgba(59, 130, 246, 0.5)",
                            color: "#ffffff",
                        },
                    }}
                >
                    {loading ? "Deleting..." : "Delete"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteModal;