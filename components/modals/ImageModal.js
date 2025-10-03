import { useState, useEffect } from 'react';
import { Box, Modal, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ImageModal = ({ speaker, onClose }) => {


    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!speaker) return null;

    return (
        <Modal
            open={true}
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: 'clamp(300px, 85vw, 1400px)', // Fixed responsive width that adapts to viewport
                    height: 'auto', // CHANGED: Auto height to fit image + info section
                    maxHeight: '90vh', // CHANGED: Maximum height constraint of 90vh
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: 24,
                    overflow: 'auto', // CHANGED: Allow scrolling if content exceeds maxHeight
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    }}
                    aria-label="Close"
                >
                    <CloseIcon sx={{ color: 'white' }} />
                </IconButton>


                {/* Image Section */}
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'gray',
                        width: '100%',
                        height: 'auto',
                        overflow: 'hidden',
                    }}
                >
                    <img
                        src={speaker.image}
                        alt={speaker.name}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                        draggable="false"
                    />
                </Box>

            </Box>
        </Modal>
    );
};

export default ImageModal;
