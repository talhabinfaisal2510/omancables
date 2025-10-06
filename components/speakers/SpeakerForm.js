// components/speakers/SpeakerForm.js
"use client";
import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    CircularProgress,
    Avatar
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function SpeakerForm({ speaker, speakers, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        imageUrl: '',
        popupImageUrl: '',
        startTime: '',
        endTime: '',
        order: 0
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [popupImageFile, setPopupImageFile] = useState(null);
    const [popupImagePreview, setPopupImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (speaker) {
            setFormData({
                name: speaker.name,
                designation: speaker.designation,
                imageUrl: speaker.imageUrl,
                popupImageUrl: speaker.popupImageUrl || speaker.imageUrl,
                startTime: speaker.startTime,
                endTime: speaker.endTime,
                order: speaker.order
            });
            setImagePreview(speaker.imageUrl);
            setPopupImagePreview(speaker.popupImageUrl || speaker.imageUrl);
        } else {
            setFormData(prev => ({
                ...prev,
                order: speakers?.length || 0
            }));
        }
    }, [speaker, speakers]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'order' ? parseInt(value) || 0 : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle popup image selection
    const handlePopupImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }
            setPopupImageFile(file);
            setPopupImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required images for new speaker creation
        if (!speaker) {
            if (!imageFile) {
                alert('Thumbnail image is required');
                return;
            }
            if (!popupImageFile) {
                alert('Popup image is required');
                return;
            }
        }

        setUploading(true);

        try {
            const submissionData = { ...formData };

            // Convert thumbnail image to base64 if new file selected
            if (imageFile) {
                const fileData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });

                submissionData.file = {
                    data: fileData,
                    type: imageFile.type,
                    name: imageFile.name
                };
            }

            // Convert popup image to base64 if new file selected
            if (popupImageFile) {
                const popupFileData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(popupImageFile);
                });

                submissionData.popupFile = {
                    data: popupFileData,
                    type: popupImageFile.type,
                    name: popupImageFile.name
                };
            }

            await onSubmit(submissionData);
        } catch (err) {
            alert('Failed to process: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
            />

            {/* Image Upload Section */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Thumbnail Image * <Typography component="span" variant="caption" color="text.disabled">(displayed in Carousel)</Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {imagePreview && (
                        <Avatar
                            src={imagePreview}
                            alt="Thumbnail Preview"
                            sx={{ width: 80, height: 80 }}
                            variant="rounded"
                        />
                    )}
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading}
                    >
                        {imagePreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </Button>
                </Box>
            </Box>

            {/* Popup Image Upload Section */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Popup Image * <Typography component="span" variant="caption" color="text.disabled">(displayed in modal)</Typography>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {popupImagePreview && (
                        <Avatar
                            src={popupImagePreview}
                            alt="Popup Preview"
                            sx={{ width: 80, height: 80 }}
                            variant="rounded"
                        />
                    )}
                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading}
                    >
                        {popupImagePreview ? 'Change Popup Image' : 'Upload Popup Image'}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handlePopupImageChange}
                            required={!speaker}
                        />
                    </Button>
                </Box>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TimePicker
                            label="Start Time"
                            value={formData.startTime ? new Date(`2000-01-01T${formData.startTime}`) : null} // Convert HH:MM to Date object
                            onChange={(newValue) => {
                                if (newValue) {
                                    const hours = String(newValue.getHours()).padStart(2, '0');
                                    const minutes = String(newValue.getMinutes()).padStart(2, '0');
                                    handleInputChange({ target: { name: 'startTime', value: `${hours}:${minutes}` } }); // Convert back to HH:MM
                                }
                            }}
                            ampm={false} // Forces 24-hour format display
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    helperText: "24-hour format (HH:MM)",
                                    sx: { mb: 2 }
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TimePicker
                            label="End Time"
                            value={formData.endTime ? new Date(`2000-01-01T${formData.endTime}`) : null} // Convert HH:MM to Date object
                            onChange={(newValue) => {
                                if (newValue) {
                                    const hours = String(newValue.getHours()).padStart(2, '0');
                                    const minutes = String(newValue.getMinutes()).padStart(2, '0');
                                    handleInputChange({ target: { name: 'endTime', value: `${hours}:${minutes}` } }); // Convert back to HH:MM
                                }
                            }}
                            ampm={false} // Forces 24-hour format display
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    helperText: "24-hour format (HH:MM)",
                                    sx: { mb: 2 }
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </LocalizationProvider>
            <TextField
                fullWidth
                label="Display Order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
                required
                helperText="Lower numbers appear first in carousel"
                sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    disabled={uploading}
                    startIcon={<CloseIcon />}
                    sx={{
                        fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                        padding: "clamp(0.375rem, 1vh, 0.5rem) clamp(0.75rem, 2vw, 1rem)"
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
                    sx={{
                        fontSize: "clamp(0.75rem, 1.5vw, 0.875rem)",
                        padding: "clamp(0.375rem, 1vh, 0.5rem) clamp(0.75rem, 2vw, 1rem)"
                    }}
                >
                    {uploading ? (speaker ? 'Updating...' : 'Creating...') : (speaker ? 'Update' : 'Create')}
                </Button>
            </Box>
        </Box>
    );
}