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
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function SpeakerForm({ speaker, speakers, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        imageUrl: '',
        startTime: '',
        endTime: '',
        order: 0
    });
    const [imageFile, setImageFile] = useState(null); // Store selected image file
    const [imagePreview, setImagePreview] = useState(''); // Store preview URL
    const [uploading, setUploading] = useState(false); // Track upload state

    useEffect(() => {
        if (speaker) {
            // Edit mode - populate form with existing speaker data
            setFormData({
                name: speaker.name,
                designation: speaker.designation,
                imageUrl: speaker.imageUrl,
                startTime: speaker.startTime,
                endTime: speaker.endTime,
                order: speaker.order
            });
            setImagePreview(speaker.imageUrl); // Show existing image in edit mode
        } else {
            // Create mode - auto-assign next order number
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            setImageFile(file); // Store file for upload
            setImagePreview(URL.createObjectURL(file)); // Create preview URL from file
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setUploading(true); // Changed: Set uploading state at the start for all submissions

        try {
            // If new image selected, convert to base64
            if (imageFile) {
                const reader = new FileReader();

                const fileData = await new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(imageFile);
                });

                // Pass the file data along with form data
                await onSubmit({ // Added: await the submission
                    ...formData,
                    file: {
                        data: fileData,
                        type: imageFile.type,
                        name: imageFile.name
                    }
                });
            } else {
                // No new image, just submit existing data
                await onSubmit(formData); // Added: await the submission
            }
        } catch (err) {
            alert('Failed to process: ' + err.message); // Changed: Generic error message
        } finally {
            setUploading(false); // Changed: Always reset uploading state in finally block
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
                    Speaker Image *
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {imagePreview && ( // Show image preview if available
                        <Avatar
                            src={imagePreview}
                            alt="Preview"
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
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleImageChange}
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
                <Button onClick={onCancel} variant="outlined" disabled={uploading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : undefined} // Added: Shows CircularProgress icon during upload
                    sx={{ minWidth: '120px' }} // Changed: Increased width to accommodate icon + text
                >
                    {uploading ? (speaker ? 'Updating...' : 'Creating...') : (speaker ? 'Update' : 'Create')} {/* Changed: Shows progress text during upload */}
                </Button>
            </Box>
        </Box>
    );
}