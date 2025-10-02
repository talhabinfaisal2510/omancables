// components/speakers/SpeakerList.js
"use client";
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

export default function SpeakerList({ speakers, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (speakers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No speakers found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click "Add Speaker" to create your first speaker
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} justifyContent="center" sx={{
      '& > .MuiGrid-item': { // Added: Target all Grid items
        width: { xs: '100%', sm: 'auto' }, // Force full width on mobile
        maxWidth: { xs: '100%', sm: 'none' } // Override MUI's max-width constraint
      }
    }}>
      {speakers.map((speaker) => (
        <Grid item xs={12} sm={6} md={4} key={speaker._id} sx={{
          display: { xs: 'flex', sm: 'block' },
          flexBasis: { xs: '100%', sm: 'auto' }, // Added: Override flex-basis on mobile
          flexGrow: { xs: 1, sm: 0 }, // Added: Allow growth on mobile only
          maxWidth: { xs: '100%', sm: '50%', md: '33.333333%' } // Added: Explicit max-width control
        }}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              width: { xs: '100%', sm: 'auto' },
              flexDirection: 'column',
              position: 'relative',
              transition: 'transform 0.2s, box-shadow 0.2s', // Smooth hover animation
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={speaker.imageUrl}
              alt={speaker.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" gutterBottom>
                {speaker.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {speaker.designation}
              </Typography>
              <Typography variant="caption" color="primary" display="block" sx={{ mt: 1 }}>
                Live: {speaker.startTime} - {speaker.endTime}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Order: {speaker.order}
              </Typography>
            </CardContent>
            <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton
                onClick={() => onEdit(speaker)} // Pass speaker to parent for editing
                color="primary"
                size="small"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => onDelete(speaker._id)} // Pass ID to parent for deletion
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}