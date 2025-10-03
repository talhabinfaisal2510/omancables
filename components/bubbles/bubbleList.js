// components/BubbleList.js
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AccountTree as TreeIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as FileIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import DeleteModal from '../modals/DeleteModal';

export default function BubbleList({ bubbles, media, loading, onEdit, onDelete, onViewMedia }) {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false); // ADDED: State to control delete modal visibility
  const [bubbleToDelete, setBubbleToDelete] = React.useState(null); // ADDED: Store bubble ID to be deleted
  const [deleting, setDeleting] = React.useState(false); // ADDED: Loading state during deletion
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress sx={{ width: 'clamp(2rem, 5vw, 4rem)', height: 'clamp(2rem, 5vw, 4rem)' }} /> {/* Fixed: clamp as CSS string in sx */}
      </Box>
    );
  }

  if (!Array.isArray(bubbles) || !bubbles.length) {
    return (
      <Box textAlign="center" height="100%" display="flex" flexDirection="column" justifyContent="center">
        <TreeIcon sx={{ fontSize: 'clamp(2rem, 8vw, 4rem)', color: 'grey.400', mb: 'clamp(0.5rem, 2vh, 1rem)' }} /> {/* Changed: Fluid sizing */}
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: 'clamp(0.875rem, 2vw, 1.25rem)' }}> {/* Added: Fluid font */}
          No bubbles found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}> {/* Added: Fluid font */}
          Create your first bubble to get started
        </Typography>
      </Box>
    );
  }

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'pdf': return <PdfIcon />;
      case 'audio': return <AudioIcon />;
      default: return <FileIcon />;
    }
  };

  const getBubbleMedia = (bubbleId) => {
    // Safe array operations with fallback to prevent "find is not a function" errors
    if (!Array.isArray(media) || !Array.isArray(bubbles) || !bubbleId) return null; // Added bubbleId null check
    const bubble = bubbles.find(b => b && (b._id || b.id) === bubbleId); // Added bubble null check

    if (!bubble?.media) return null;

    // Check if bubble.media is already populated (object) or just an ObjectId (string)
    if (typeof bubble.media === 'object' && bubble.media.title) {
      // Media is already populated from .populate('media')
      return bubble.media;
    } else {
      // Media is just an ObjectId, find it in media array
      const mediaId = typeof bubble.media === 'object' ? bubble.media._id : bubble.media;
      return media.find(m => (m._id || m.id).toString() === mediaId.toString());
    }
  };

  const isLeafBubble = (bubbleId) => {
    // Safe array operation with fallback
    if (!Array.isArray(bubbles) || !bubbleId) return true; // Added bubbleId null check
    return !bubbles.some(bubble => bubble && bubble.parentBubbleId === bubbleId); // Added bubble null check
  };

  const renderBubbles = (parentId = null) => {
    return bubbles
      .filter(bubble => bubble && bubble.parentBubbleId === parentId)
      .map(bubble => {
        // Additional safety check to ensure bubble exists and has valid id
        if (!bubble || (!bubble.id && !bubble._id)) {
          console.warn('Invalid bubble object found:', bubble); // Debug warning
          return null;
        }

        const bubbleId = bubble.id || bubble._id;
        const bubbleMedia = getBubbleMedia(bubbleId);
        const isLeaf = isLeafBubble(bubbleId);
        const hasChildren = bubbles.some(b => b && b.parentBubbleId === bubbleId);

        return (
          <Accordion key={`bubble-${bubbleId}`} sx={{ mb: 'clamp(0.25rem, 1vh, 0.5rem)' }}>{/* Changed: Fluid margin */}
            <Box sx={{ position: 'relative' }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }} />}
                sx={{
                  bgcolor: isLeaf ? '#e8f5e8' : '#e3f2fd',
                  '&:hover': { bgcolor: isLeaf ? '#d4edda' : '#bbdefb' },
                  pr: 'clamp(1rem, 3vw, 2rem)', // Reduced padding to allow expand icon to appear on far right
                  minHeight: 'clamp(3rem, 8vh, 4rem)',
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    position: 'absolute',
                    right: 'clamp(0.5rem, 2vw, 1rem)', // Position expand icon on far right
                    zIndex: 2 // Higher z-index than action buttons
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ gap: 'clamp(0.25rem, 1vw, 0.5rem)' }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontSize: 'clamp(0.875rem, 2vw, 1.25rem)' }} // Added: Fluid font size
                  >
                    {bubble.title}
                  </Typography>

                  {bubbleMedia && (
                    <Chip
                      label="Has Media"
                      size="small"
                      color="secondary"
                      variant="outlined"
                      icon={getMediaIcon(bubbleMedia.type)}
                      sx={{ fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)', height: 'clamp(1.25rem, 3vh, 1.5rem)' }} // Added: Fluid chip sizing
                    />
                  )}
                </Stack>
              </AccordionSummary>

              <Box
                sx={{
                  position: 'absolute',
                  right: 'clamp(3.5rem, 8vw, 5rem)', // Moved further left to make space for expand icon on far right
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  gap: 'clamp(0.25rem, 0.5vw, 0.5rem)',
                  zIndex: 1
                }}
              >
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(bubble);
                  }}
                  title="Edit bubble"
                  sx={{ padding: 'clamp(0.25rem, 1vh, 0.5rem)' }}
                >
                  <EditIcon sx={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }} />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBubbleToDelete(bubbleId); // CHANGED: Store bubble ID instead of directly deleting
                    setDeleteModalOpen(true); // CHANGED: Open delete confirmation modal
                  }}
                  title="Delete bubble"
                  sx={{ padding: 'clamp(0.25rem, 1vh, 0.5rem)' }}
                >
                  <DeleteIcon sx={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }} />
                </IconButton>
              </Box>
            </Box>

            <AccordionDetails sx={{ padding: 'clamp(0.5rem, 2vh, 1rem)' }}>
              {bubbleMedia && (
                <Card variant="outlined" sx={{ mb: 'clamp(0.5rem, 2vh, 1rem)', bgcolor: 'grey.50' }}> {/* Changed: Fluid margin */}
                  <CardContent sx={{ padding: 'clamp(0.5rem, 1.5vh, 0.75rem) !important' }}> {/* Added: Fluid padding */}

                    {bubbleMedia.type === 'image' && (
                      <Box sx={{ maxWidth: '100%', textAlign: 'center' }}>
                        <img
                          src={bubbleMedia.url}
                          alt={bubbleMedia.title}
                          style={{
                            maxWidth: '100%',
                            height: 'clamp(10rem, 30vh, 18.75rem)', // Changed: Fluid height (was maxHeight: 300px)
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                        />
                      </Box>
                    )}
                    {bubbleMedia.type === 'video' && (
                      <Box sx={{ maxWidth: '100%' }}>
                        <video
                          controls
                          style={{
                            width: '100%',
                            height: 'clamp(10rem, 30vh, 18.75rem)', // Changed: Fluid height (was maxHeight: 300px)
                            borderRadius: '4px'
                          }}
                        >
                          <source src={bubbleMedia.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </Box>
                    )}
                    {bubbleMedia.type === 'audio' && (
                      <Box sx={{ width: '100%' }}>
                        <audio controls style={{ width: '100%', height: 'clamp(2rem, 5vh, 3rem)' }}> {/* Added: Fluid height */}
                          <source src={bubbleMedia.url} type="audio/mpeg" />
                          Your browser does not support the audio tag.
                        </audio>
                      </Box>
                    )}
                    {bubbleMedia.type === 'pdf' && (
                      <Box sx={{ width: '100%', height: 'clamp(15rem, 40vh, 25rem)' }}>
                        <iframe
                          src={bubbleMedia.url}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '4px'
                          }}
                          title={bubbleMedia.title}
                        />
                      </Box>
                    )}
                    {bubbleMedia.type === 'qr' && (
                      <Box sx={{ textAlign: 'center', py: 'clamp(1rem, 3vh, 2rem)' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                            color: 'primary.main',
                            fontWeight: 'medium',
                            wordBreak: 'break-all' // Handle long URLs
                          }}
                        >
                          QR Code URL: {bubbleMedia.url} {/* Display QR code URL instead of PDF/image */}
                        </Typography>
                      </Box>
                    )}
                    {bubbleMedia.type === 'website' && (
                      <Box sx={{ textAlign: 'center', py: 'clamp(1rem, 3vh, 2rem)' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                            color: 'primary.main',
                            fontWeight: 'medium'
                          }}
                        >
                          Website: {bubbleMedia.websiteUrl} {/* Display website name instead of iframe */}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Show child bubbles */}
              {hasChildren ? (
                <Box sx={{ mt: 'clamp(0.5rem, 1vh, 0.75rem)' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
                  >
                    Child Bubbles:
                  </Typography>
                  {renderBubbles(bubbleId)} {/* Using cached bubbleId */}
                </Box>
              ) : (
                !bubbleMedia && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }} // Added: Fluid font
                  >
                    No child bubbles or media
                  </Typography>
                )
              )}
            </AccordionDetails>
          </Accordion>
        );
      });
  };

  // ADDED: Handle confirmed deletion
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(bubbleToDelete); // ADDED: Call parent's delete handler
      setDeleteModalOpen(false); // ADDED: Close modal after successful deletion
      setBubbleToDelete(null); // ADDED: Clear selected bubble
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  // ADDED: Handle modal close
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setBubbleToDelete(null);
  };

  // ADDED: Get bubble title for delete message
  const getBubbleTitle = () => {
    if (!bubbleToDelete) return '';
    const bubble = bubbles.find(b => b && (b._id || b.id) === bubbleToDelete);
    return bubble?.title || 'this bubble';
  };

  return (
    <>
      <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontSize: 'clamp(1.25rem, 3vw, 2rem)',
            mb: 'clamp(0.5rem, 2vh, 1rem)',
            color: 'black'
          }}
        >
          Bubble Hierarchy
        </Typography>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {renderBubbles()}
        </Box>
      </Box>

      {/* ADDED: Delete confirmation modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${getBubbleTitle()}"? This will also delete all child bubbles and cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}