"use client";
// pages/index.js or components/BubbleApp.js
import React, { useState, useEffect } from 'react';
import {
  Container,
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
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import BubbleList from '../../components/bubbles/bubbleList';
import CreateBubbleForm from '../../components/bubbles/CreateBubbleForm';
import UpdateBubbleForm from '../../components/bubbles/UpdateBubbleForm';
import SpeakerManagement from '../../components/speakers/SpeakerManagement';
import HomeVideoManagement from '@/components/Home/HomeVideoManagement';

export default function BubbleApp() {
  const [bubbles, setBubbles] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchBubbles();
    fetchMedia();
  }, []);

  const fetchBubbles = async () => {
    try {
      const response = await fetch('/api/bubble'); // Updated endpoint to match folder structure
      if (!response.ok) throw new Error('Failed to fetch bubbles');
      const data = await response.json();
      setBubbles(Array.isArray(data) ? data : data.bubbles || []); // Ensure bubbles is always an array
    } catch (err) {
      setError('Failed to load bubbles');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media/all'); // Updated endpoint to match folder structure
      if (!response.ok) throw new Error('Failed to fetch media');
      const data = await response.json();
      setMedia(data.success ? data.media : []);
    } catch (err) {
      console.error('Failed to load media:', err);
    }
  };

  const handleCreateBubble = async (bubbleData) => {
    try {
      const response = await fetch('/api/bubble', { // Updated endpoint to match folder structure
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bubbleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create bubble');
      }

      await fetchBubbles();
      setSuccess('Bubble created successfully!');
      setOpenCreateDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateBubble = async (id, bubbleData) => {
    try {
      const response = await fetch(`/api/bubble/${id}`, { // Updated endpoint to match folder structure
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bubbleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update bubble');
      }

      await fetchBubbles();
      setSuccess('Bubble updated successfully!');
      setOpenUpdateDialog(false);
      setSelectedBubble(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBubble = async (id) => {

    try {
      const response = await fetch(`/api/bubble/${id}`, { // Updated endpoint to match folder structure
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete bubble');
      }

      await fetchBubbles();
      setSuccess('Bubble deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#ededed' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color='black'>
        CMS Dashboard {/* CHANGED: More generic title */}
      </Typography>

      {/* ADDED: Home video management section at top */}
      <HomeVideoManagement />

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" color="black">
            Bubbles
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)} // Open dialog in create mode
            sx={{ bgcolor: 'primary.main' }}
          >
            Add Bubble
          </Button>
        </Box>

        {bubbles.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" color="text.secondary">
              No bubbles found. Click "Add Bubble" to create your first one.
            </Typography>
          </Box>
        ) : (
          <BubbleList
            bubbles={bubbles}
            media={media}
            loading={loading}
            onEdit={(bubble) => {
              setSelectedBubble(bubble);
              setOpenUpdateDialog(true);
            }}
            onDelete={(id) => handleDeleteBubble(id)}
            onViewMedia={(mediaItem) => {
              setSelectedMedia(mediaItem);
            }}
          />
        )}
      </Box>

      {/* Create Bubble Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Create New Bubble
          <IconButton
            onClick={() => setOpenCreateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CreateBubbleForm
            bubbles={bubbles}
            media={media}
            onSubmit={handleCreateBubble}
            onCancel={() => setOpenCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Update Bubble Dialog */}
      <Dialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Update Bubble
          <IconButton
            onClick={() => setOpenUpdateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedBubble && (
            <UpdateBubbleForm
              bubble={selectedBubble}
              bubbles={bubbles}
              media={media}
              onSubmit={(data) => handleUpdateBubble(selectedBubble._id || selectedBubble.id, data)}
              onCancel={() => {
                setOpenUpdateDialog(false);
                setSelectedBubble(null);
              }}
            />
          )}
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
      <SpeakerManagement />
    </Container >

  );
}