import React from 'react';
import './css/css.css';
import './css/academicons.min.css';
import './css/bulma.min.css';
import './css/bulma-carousel.min.css';
import './css/bulma-slider.min.css';
import { usePermissions } from 'react-admin';
import { Typography, Button, Container, Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const Dashboard = () => {
    const { permissions } = usePermissions();

    return (
        <>
            {(permissions === 'admin' || permissions === 'user') ? null : (
                <Typography variant="body1" color="error" align="center" gutterBottom>
                    To access the DeepReefMap portal, please contact the administrator to request access.
                </Typography>
            )}

            <Box component="section" sx={{ py: 6 }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        DeepReefMap:
                        <br />
                        Scalable Semantic 3D Mapping of Coral Reefs with Deep Learning
                    </Typography>

                    <Typography variant="h6" component="div" gutterBottom>
                        <a href="https://scholar.google.com/citations?user=P1YcQw4AAAAJ&amp;hl=en&amp;oi=ao" target="_blank" rel="noopener noreferrer">Jonathan Sauder</a>,{' '}
                        <a href="https://scholar.google.com/citations?user=ApxnBkYAAAAJ&amp;hl=en&amp;oi=ao" target="_blank" rel="noopener noreferrer">Guilhem Banc-Prandi</a>,{' '}
                        <a href="https://scholar.google.com/citations?user=W5cZVtQAAAAJ&amp;hl=en&amp;oi=ao" target="_blank" rel="noopener noreferrer">Gabriela Perna</a>,{' '}
                        <a href="https://scholar.google.com/citations?user=6sXSYJMAAAAJ&amp;hl=en&amp;oi=ao" target="_blank" rel="noopener noreferrer">Anders Meibom</a>,{' '}
                        <a href="https://scholar.google.com/citations?user=p3iJiLIAAAAJ&amp;hl=en&amp;oi=ao" target="_blank" rel="noopener noreferrer">Devis Tuia</a>
                    </Typography>


                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            href="https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/2041-210X.14307"
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<FontAwesomeIcon icon={faFilePdf} />}
                        >
                            Paper
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            href="https://github.com/josauder/mee-deepreefmap"
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<FontAwesomeIcon icon={faGithub} />}
                        >
                            Code
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Box component="section" >
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <video poster="" id="tree" autoPlay controls muted loop width="100%">
                            <source src="https://josauder.github.io/deepreefmap/static/videos/sunken_buoy_fast_480.mov" type="video/mp4" />
                        </video>
                    </Box>

                </Container>
            </Box>
        </>
    );
};

export default Dashboard;
