// components/speakers/SpeakerManagement.js
"use client";
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Alert,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import SpeakerList from './SpeakerList'; // Import SpeakerList component
import SpeakerForm from './SpeakerForm'; // Import SpeakerForm component

export default function SpeakerManagement() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null); // null = create mode, object = edit mode

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      const response = await fetch('/api/speakers');
      if (!response.ok) throw new Error('Failed to fetch speakers');
      const data = await response.json();
      setSpeakers(data.success ? data.data : []); // Extract speakers array from response
    } catch (err) {
      setError('Failed to load speakers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (speaker = null) => {
    setSelectedSpeaker(speaker); // null for create, speaker object for edit
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSpeaker(null);
  };

  const handleSubmit = async (formData) => {
    try {
      const url = selectedSpeaker
        ? `/api/speakers/${selectedSpeaker._id}` // PUT for update
        : '/api/speakers'; // POST for create

      const method = selectedSpeaker ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save speaker');
      }

      await fetchSpeakers(); // Refresh speaker list with single DB call
      setSuccess(selectedSpeaker ? 'Speaker updated successfully!' : 'Speaker created successfully!');
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this speaker?')) return;

    try {
      const response = await fetch(`/api/speakers/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete speaker');
      }

      await fetchSpeakers(); // Refresh speaker list with single DB call
      setSuccess('Speaker deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h2" color="black">
          Speaker Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()} // Open dialog in create mode
          sx={{ bgcolor: 'primary.main' }}
        >
          Add Speaker
        </Button>
      </Box>

      {/* Modular SpeakerList component */}
      <SpeakerList
        speakers={speakers}
        loading={loading}
        onEdit={(speaker) => handleOpenDialog(speaker)} // Open dialog in edit mode
        onDelete={handleDelete}
      />

      {/* Create/Update Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSpeaker ? 'Update Speaker' : 'Create New Speaker'} {/* Dynamic title */}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Modular SpeakerForm component */}
          <SpeakerForm
            speaker={selectedSpeaker} // Pass null for create, speaker object for edit
            speakers={speakers}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbars for feedback */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}