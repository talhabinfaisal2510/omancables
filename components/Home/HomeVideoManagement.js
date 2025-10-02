"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    IconButton,
    Alert,
    CircularProgress,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { VideoLibrary as VideoIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

export default function HomeVideoManagement() {
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [openDialog, setOpenDialog] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchVideoUrl();
    }, []);

    useEffect(() => {
        return () => {
            if (videoPreview && videoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(videoPreview);
            }
        };
    }, [videoPreview]);

    const fetchVideoUrl = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/home');
            const data = await res.json();
            if (data.success) {
                setVideoUrl(data.data.videoUrl);
                setVideoPreview(data.data.videoUrl);
            } else {
                setError(data.error || 'Failed to load video');
            }
        } catch (err) {
            setError('Failed to load video');
        } finally {
            setLoading(false);
        }
    };

    // Open dialog
    const handleEditClick = () => {
        setOpenDialog(true);
        setVideoFile(null);
        setVideoPreview(videoUrl);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setError('Please select a valid video file');
            return;
        }
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            setError('Video must be less than 100MB');
            return;
        }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setError('');
    };

    const handleCancel = () => {
        setVideoFile(null);
        setVideoPreview(videoUrl);
        setOpenDialog(false);
        setError('');
        setUploadProgress(0);
    };

    const handleUpload = async () => {
        if (!videoFile) return setError('Select a video first');
        setUploading(true);
        setUploadProgress(0);
        setError('');
        try {
            const formData = new FormData();
            formData.append('video', videoFile);

            const xhr = new XMLHttpRequest();
            const uploadPromise = new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        setUploadProgress(Math.round((e.loaded / e.total) * 100));
                    }
                });
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
                    else reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'));
                });
                xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
            });

            xhr.open('PUT', '/api/home'); // PUT API
            xhr.send(formData);

            const data = await uploadPromise;
            if (data.success) {
                setVideoUrl(data.data.videoUrl);
                setVideoPreview(data.data.videoUrl);
                setSuccess('Video uploaded successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setOpenDialog(false);
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>;

    return (
        <Card sx={{
            mb: 4,
            borderRadius: 3,

            width: 'fit-content', // Added: Card shrinks to content width
            maxWidth: '100%', // Added: Prevents overflow on small screens
            mx: 'auto', // Added: Center the card horizontally
        }}>
            <CardContent sx={{
                '&:last-child': { pb: 2 } // Added: Maintain consistent padding
            }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, mb: 2
                }}>
                    <VideoIcon fontSize="large" color="primary" />
                    <Typography variant="h5">Home Background Video</Typography>
                    <IconButton onClick={handleEditClick} sx={{ ml: 'auto' }}>
                        <EditIcon />
                    </IconButton>
                </Box>

                {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
                {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

                <Box sx={{
                    mb: 2,
                    width: 'fit-content', // Changed back: Box now wraps tightly around video
                    maxWidth: '100%', // Added: Prevents overflow on smaller screens
                    mx: 'auto', // Added: Center the box horizontally
                }}>
                    <video src={videoPreview} controls style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        maxHeight: '60vh',
                    }} />
                </Box>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} style={{ display: 'none' }} />

                {/* Upload Dialog */}
                <Dialog open={openDialog} onClose={handleCancel} maxWidth="sm" fullWidth>
                    <DialogTitle>Upload New Video</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 2 }}>
                            <video src={videoPreview} controls style={{ width: '100%', maxHeight: '40vh', marginBottom: 8 }} />
                            <Button variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {videoFile ? 'Change Video' : 'Select Video'}
                            </Button>
                        </Box>

                        {uploading && (
                            <Box>
                                <Typography variant="body2">Uploading... {uploadProgress}%</Typography>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancel} disabled={uploading} startIcon={<CancelIcon />}
                        variant="outlined">Cancel</Button>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading || !videoFile}
                            variant="contained"
                            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} // 
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
}
