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
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import DeleteModal from '../modals/DeleteModal';

export default function SpeakerList({ speakers, loading, onEdit, onDelete }) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [speakerToDelete, setSpeakerToDelete] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

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

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(speakerToDelete._id);
      setDeleteModalOpen(false);
      setSpeakerToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSpeakerToDelete(null);
  };

  return (
    <>
      <Grid container spacing={3} justifyContent="center" sx={{
        '& > .MuiGrid-item': {
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { xs: '100%', sm: 'none' }
        }
      }}>
        {speakers.map((speaker) => (
          <Grid item xs={12} sm={6} md={4} key={speaker._id} sx={{
            display: { xs: 'flex', sm: 'block' },
            flexBasis: { xs: '100%', sm: 'auto' },
            flexGrow: { xs: 1, sm: 0 },
            maxWidth: { xs: '100%', sm: '50%', md: '33.333333%' }
          }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                width: { xs: '100%', sm: 'auto' },
                flexDirection: 'column',
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {/* Order Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: 'white',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                  zIndex: 10
                }}
              >
                {speaker.order}
              </Box>

              {/* Gradient Header with Photo */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  padding: 'clamp(24px, 5vw, 40px) clamp(16px, 3vw, 24px) clamp(12px, 2vw, 20px)',
                  position: 'relative'
                }}
              >
                <CardMedia
                  component="img"
                  image={speaker.imageUrl}
                  alt={speaker.name}
                  sx={{
                    width: 'clamp(96px, 20vw, 112px)',
                    height: 'clamp(96px, 20vw, 112px)',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto',
                    border: '4px solid white',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </Box>

              <CardContent sx={{
                flexGrow: 1,
                textAlign: 'center',
                padding: '20px'
              }}>
                <Typography
                  variant="h6"
                  component="div"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#1f2937',
                    marginBottom: '8px'
                  }}
                >
                  {speaker.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    marginBottom: '16px'
                  }}
                >
                  {speaker.designation}
                </Typography>

                {/* Time Info */}
                <Box
                  sx={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <ClockIcon sx={{ width: 18, height: 18, color: '#2563eb' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: '#374151',
                      fontSize: '0.875rem'
                    }}
                  >
                    {speaker.startTime} - {speaker.endTime}
                  </Typography>
                </Box>
              </CardContent>

              <Box sx={{
                p: 2,
                pt: 0,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1
              }}>
                <IconButton
                  onClick={() => onEdit(speaker)}
                  size="small"
                  sx={{
                    color: '#2563eb',
                    '&:hover': {
                      backgroundColor: '#eff6ff'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setSpeakerToDelete(speaker);
                    setDeleteModalOpen(true);
                  }}
                  size="small"
                  sx={{
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: '#fef2f2'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <DeleteModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete speaker "${speakerToDelete?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}