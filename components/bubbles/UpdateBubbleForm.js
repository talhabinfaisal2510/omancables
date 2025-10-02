// components/UpdateBubbleForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Alert
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

export default function UpdateBubbleForm({ bubble, bubbles, media, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    parentBubbleId: '',
    mediaTitle: '',
    mediaType: '',
    mediaUrl: '',
    mediaFile: null,
    existingMediaId: '' // Track existing media for updates
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bubble) {
      // Safe null check: Handle null/undefined media before accessing properties
      const mediaId = bubble.media && typeof bubble.media === 'object'
        ? bubble.media._id
        : bubble.media;

      const existingMedia = mediaId && Array.isArray(media)
        ? media.find(m => (m._id || m.id) === mediaId)
        : null;

      setFormData({
        title: bubble.title || '',
        parentBubbleId: bubble.parentBubbleId || '',
        existingMediaId: mediaId ? String(mediaId) : '',
        mediaTitle: existingMedia?.title || '',
        mediaType: existingMedia?.type || '',
        mediaUrl: existingMedia?.type === 'website' ? existingMedia?.websiteUrl : '',
        mediaFile: null
      });
    }
  }, [bubble, media]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let mediaId = formData.existingMediaId; // Keep existing media by default

      // Handle media update/creation
      if (formData.mediaTitle && formData.mediaType) {
        if (formData.existingMediaId) {
          // Update existing media
          console.log('Existing media ID:', formData.existingMediaId, typeof formData.existingMediaId);
          const mediaFormData = new FormData();
          mediaFormData.append('title', formData.mediaTitle.trim());
          mediaFormData.append('type', formData.mediaType);

          if (formData.mediaType === 'website') {
            // For website type, update using websites API
            const mediaResponse = await fetch('/api/websites', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: formData.mediaTitle.trim(),
                type: 'website',
                websiteUrl: formData.mediaUrl
              })
            });

            if (mediaResponse.ok) {
              const mediaResult = await mediaResponse.json();
              mediaId = mediaResult.website._id;
            }
          } else if (formData.mediaFile) {
            // Update with new file
            mediaFormData.append('file', formData.mediaFile);

            const mediaResponse = await fetch(`/api/media?id=${encodeURIComponent(formData.existingMediaId)}`, {
              method: 'PUT',
              body: mediaFormData
            });

            if (mediaResponse.ok) {
              const mediaResult = await mediaResponse.json();
              mediaId = mediaResult.media._id;
            }
          } else {
            // Update only title/type, keep existing file
            const mediaResponse = await fetch(`/api/media?id=${formData.existingMediaId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: formData.mediaTitle.trim(),
                type: formData.mediaType
              })
            });

            if (mediaResponse.ok) {
              const mediaResult = await mediaResponse.json();
              mediaId = mediaResult.media._id;
            }
          }
        } else {
          // Create new media
          // Create new media
          if (formData.mediaType === 'website') {
            const mediaResponse = await fetch('/api/websites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: formData.mediaTitle.trim(),
                type: 'website',
                websiteUrl: formData.mediaUrl
              })
            });

            if (mediaResponse.ok) {
              const mediaResult = await mediaResponse.json();
              mediaId = mediaResult.website._id;
            }
          } else if (formData.mediaFile) {
            const mediaFormData = new FormData();
            mediaFormData.append('title', formData.mediaTitle.trim());
            mediaFormData.append('type', formData.mediaType);
            mediaFormData.append('file', formData.mediaFile);

            const mediaResponse = await fetch('/api/media', {
              method: 'POST',
              body: mediaFormData
            });

            if (mediaResponse.ok) {
              const mediaResult = await mediaResponse.json();
              mediaId = mediaResult.media._id;
            }
          }
        }
      } else if (!formData.mediaType && formData.existingMediaId) {
        // Remove media if type is cleared
        mediaId = null;
      }

      // Update bubble with media changes
      const submitData = {
        title: formData.title.trim(),
        parentBubbleId: formData.parentBubbleId || null,
        mediaId: mediaId || null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error updating bubble:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to check if a bubble is a descendant of another - moved above to fix hoisting issue
  const isDescendant = (ancestorId, bubbleId, bubbleList) => {
    if (!Array.isArray(bubbleList)) return false; // Safety check for array
    const childBubble = bubbleList.find(b => (b.id || b._id) === bubbleId);
    if (!childBubble || !childBubble.parentBubbleId) return false;
    if (childBubble.parentBubbleId === ancestorId) return true;
    return isDescendant(ancestorId, childBubble.parentBubbleId, bubbleList);
  };

  const availableParentBubbles = Array.isArray(bubbles) ? bubbles.filter(b =>
    (b.id || b._id) !== (bubble?.id || bubble?._id) && // Can't be parent of itself, handle MongoDB _id
    !isDescendant(bubble?.id || bubble?._id, b.id || b._id, bubbles) // Can't be parent of its own ancestor
  ) : [];

  const getFileAccept = (type) => {
    const accepts = {
      image: 'image/*',
      video: 'video/*',
      pdf: 'application/pdf',
      qr: 'image/*, application/pdf, video/*' // Allow image, pdf, and video for QR codes
    };
    return accepts[type] || '*/*';
  };


  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Bubble Title"
          value={formData.title}
          onChange={handleChange('title')}
          error={!!errors.title}
          helperText={errors.title}
          required
        />

        <FormControl fullWidth>
          <InputLabel>Parent Bubble</InputLabel>
          <Select
            value={formData.parentBubbleId}
            onChange={handleChange('parentBubbleId')}
            label="Parent Bubble"
          >
            <MenuItem value="">
              <em>None (Root Level)</em>
            </MenuItem>
            {availableParentBubbles.map((parentBubble) => (
              <MenuItem key={parentBubble.id || parentBubble._id} value={parentBubble.id || parentBubble._id}>
                {parentBubble.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Media for Leaf Bubble (Optional)
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Media Title"
              value={formData.mediaTitle || ''}
              onChange={handleChange('mediaTitle')}
              placeholder="Enter media title"
            />

            <FormControl fullWidth>
              <InputLabel>Media Type</InputLabel>
              <Select
                value={formData.mediaType || ''}
                onChange={handleChange('mediaType')}
                label="Media Type"
              >
                <MenuItem value="">
                  <em>No Media</em>
                </MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="qr">QR Code</MenuItem>
                <MenuItem value="website">Website</MenuItem>
              </Select>
            </FormControl>

            {formData.mediaType === 'website' ? (
              <TextField
                fullWidth
                label="Website URL"
                value={formData.mediaUrl || ''}
                onChange={handleChange('mediaUrl')}
                placeholder="https://example.com"
                type="url"
              />
            ) : formData.mediaType && formData.mediaType !== '' ? (
              <Box>
                <input
                  type="file"
                  accept={getFileAccept(formData.mediaType)}
                  onChange={(e) => setFormData({ ...formData, mediaFile: e.target.files[0] })}
                  style={{ marginBottom: '8px' }}
                />
                {formData.mediaFile && (
                  <Typography variant="caption" color="text.secondary">
                    Selected: {formData.mediaFile.name}
                  </Typography>
                )}
                {formData.existingMediaId && !formData.mediaFile && (
                  <Typography variant="caption" color="primary">
                    Current media will be kept if no new file is uploaded
                  </Typography>
                )}
              </Box>
            ) : null}
          </Stack>
        </Box>

        {(formData.mediaType || formData.existingMediaId) && (
          <Alert severity="info">
            <Typography variant="body2">
              Bubbles with media are treated as leaf bubbles and cannot have child bubbles.
            </Typography>
          </Alert>
        )}

        {formData.mediaId && (
          <Alert severity="info">
            <Typography variant="body2">
              Bubbles with media are treated as leaf bubbles and cannot have child bubbles.
            </Typography>
          </Alert>
        )}

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null} // Added: CircularProgress shows during update
          >
            {isSubmitting ? 'Updating...' : 'Update Bubble'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}