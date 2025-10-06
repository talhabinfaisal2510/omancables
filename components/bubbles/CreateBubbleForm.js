// components/CreateBubbleForm.js
import React, { useState } from 'react';
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
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';

export default function CreateBubbleForm({ bubbles, media, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    parentBubbleId: '',
    mediaTitle: '',
    mediaType: '',
    mediaUrl: '',
    mediaFile: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    // Clear error when user starts typing
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
      let mediaId = null;

      // Create media first if media data is provided
      if (formData.mediaTitle && formData.mediaType) {
        if (formData.mediaType === 'website') {
          // For website type, use the dedicated websites API endpoint with JSON
          console.log('✅ WEBSITE DETECTED - Using websites API'); // More visible logging
          console.log('🔍 FORM DATA:', {
            mediaTitle: formData.mediaTitle,
            mediaType: formData.mediaType,
            mediaUrl: formData.mediaUrl
          });
          const mediaResponse = await fetch('/api/websites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.mediaTitle.trim(),
              type: 'website',
              websiteUrl: formData.mediaUrl
            })
          });
          console.log('🌐 WEBSITE API RESPONSE STATUS:', mediaResponse.status);
          if (mediaResponse.ok) {
            const mediaResult = await mediaResponse.json();
            mediaId = mediaResult.website._id;
          }
        } else if (formData.mediaFile && formData.mediaType !== 'website') {
          // For file uploads only (non-website types), use FormData with /api/media
          const fileFormData = new FormData();
          fileFormData.append('title', formData.mediaTitle.trim());
          fileFormData.append('type', formData.mediaType);
          fileFormData.append('file', formData.mediaFile);

          const mediaResponse = await fetch('/api/media', {
            method: 'POST',
            body: fileFormData
          });

          if (mediaResponse.ok) {
            const mediaResult = await mediaResponse.json();
            mediaId = mediaResult.media._id;
          } else {
            console.error('File upload failed:', await mediaResponse.text()); // Added error logging
          }
        } else if (formData.mediaType && formData.mediaType !== 'website' && !formData.mediaFile) {
          console.warn('Media type selected but no file provided for:', formData.mediaType);
        }
      }

      // Create bubble with associated media
      const submitData = {
        title: formData.title.trim(),
        ...(formData.parentBubbleId && { parentBubbleId: formData.parentBubbleId }),
        ...(mediaId && { mediaId })
      };

      await onSubmit(submitData);
      setFormData({
        title: '',
        parentBubbleId: '',
        mediaTitle: '',
        mediaType: '',
        mediaUrl: '',
        mediaFile: null
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableParentBubbles = Array.isArray(bubbles) ? bubbles.filter(bubble =>
    (bubble.id || bubble._id) !== formData.id // Prevent self-parenting, handle MongoDB _id
  ) : [];

  const getFileAccept = (type) => {
    const accepts = {
      image: 'image/*',
      video: 'video/*',
      pdf: 'application/pdf',
      qr: 'image/*, application/pdf, video/*'
    };
    return accepts[type] || '*/*';
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 'clamp(0.5rem, 2vh, 1rem)', // Changed: Fluid margin
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack spacing="clamp(0.75rem, 2vh, 1.5rem)" sx={{ flex: 1, overflow: 'auto' }}> {/* Changed: Fluid spacing, scrollable */}
        <TextField
          fullWidth
          label="Bubble Title"
          value={formData.title}
          onChange={handleChange('title')}
          error={!!errors.title}
          helperText={errors.title}
          required
          sx={{
            '& .MuiInputBase-input': {
              fontSize: 'clamp(0.875rem, 2vw, 1rem)', // Added: Fluid font
              padding: 'clamp(0.5rem, 1.5vh, 0.75rem)' // Added: Fluid padding
            },
            '& .MuiInputLabel-root': {
              fontSize: 'clamp(0.875rem, 2vw, 1rem)' // Added: Fluid label
            }
          }}
        />
        <FormControl fullWidth>
          <InputLabel sx={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>Parent Bubble</InputLabel> {/* Added: Fluid label */}
          <Select
            value={formData.parentBubbleId}
            onChange={handleChange('parentBubbleId')}
            label="Parent Bubble"
            sx={{
              '& .MuiSelect-select': {
                fontSize: 'clamp(0.875rem, 2vw, 1rem)', // Added: Fluid font
                padding: 'clamp(0.5rem, 1.5vh, 0.75rem)' // Added: Fluid padding
              }
            }}
          >
            <MenuItem value="">
              <em>None (Root Level)</em>
            </MenuItem>
            {availableParentBubbles.map((bubble) => (
              <MenuItem key={bubble.id || bubble._id} value={bubble.id || bubble._id}>
                {bubble.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }} // Added: Fluid font
          >
            Media for Leaf Bubble (Optional)
          </Typography>
          <Stack spacing="clamp(0.5rem, 1.5vh, 1rem)"> {/* Changed: Fluid spacing */}
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
              </Box>
            ) : null}
          </Stack>
        </Box>

        {formData.mediaId && (
          <Alert severity="info">
            <Typography variant="body2">
              Bubbles with media are automatically treated as leaf bubbles and cannot have child bubbles.
            </Typography>
          </Alert>
        )}

        <Stack
          direction="row"
          spacing="clamp(0.5rem, 2vw, 1rem)" // Changed: Fluid spacing
          justifyContent="flex-end"
          sx={{ mt: 'auto', pt: 'clamp(0.5rem, 2vh, 1rem)' }} // Added: Sticky to bottom with fluid padding
        >
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
              padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.75rem, 2vw, 1rem)'
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            sx={{
              fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
              padding: 'clamp(0.375rem, 1vh, 0.5rem) clamp(0.75rem, 2vw, 1rem)'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Bubble'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}