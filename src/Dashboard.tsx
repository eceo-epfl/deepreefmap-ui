import React from 'react';
import './css/css.css';
import './css/academicons.min.css';
import './css/bulma.min.css';
import './css/bulma-carousel.min.css';
import './css/bulma-slider.min.css';
import { usePermissions, useGetList, Link } from 'react-admin';
import { Typography, Button, Container, Box, Divider } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const GettingStartedTooltip = () => {
    const { data, total, isPending, error } = useGetList('transects');
    if (isPending || error) return null;
    if (total > 0) return null;
    return (
        <Box sx={{
            position: 'absolute',
            top: '1%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            padding: '8px 16px',
            borderRadius: '8px',
            boxShadow: 3,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            maxWidth: '90%',
            textAlign: 'center'
        }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                To get started, go to <span style={{ backgroundColor: '#ffeb3b', color: '#000', padding: '2px 4px', borderRadius: '4px' }}>Transects</span>, and create a transect.
            </Typography>
        </Box>
    );
};

const Dashboard = () => {
    const { permissions } = usePermissions();

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh' }}>
            {(permissions === 'admin' || permissions === 'user') ? (
                <GettingStartedTooltip />
            ) : (
                <Typography variant="body1" color="error" align="center" gutterBottom>
                    To access the DeepReefMap portal, please contact the administrator to request access.
                </Typography>
            )}

            <Box component="section" sx={{ py: 6 }}>
                <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" component="h1" gutterBottom>
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
                        <Button
                            variant="outlined"
                            color="primary"
                            href="https://josauder.github.io/deepreefmap/"
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<FontAwesomeIcon icon={faGithub} />}
                        >
                            Project page
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <a href="http://epfl.ch"><img src="epfl.png" width="200px" alt="EPFL Logo" /></a>
                        <a href="http://trsc.org"><img src="trsc.png" width="200px" alt="TRSC Logo" /></a>
                        <a href="http://www.epfl.ch/labs/eceo/"><img src="eceo.png" width="200px" alt="ECEO Logo" /></a>
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

            <Box component="footer" sx={{ py: 6, backgroundColor: 'background.default', textAlign: 'center' }}>
                <Container maxWidth="md">
                    <Divider sx={{ my: 4 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            href="https://github.com/eceo-epfl/deepreefmap-ui"
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<FontAwesomeIcon icon={faGithub} />}
                        >
                            Frontend
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            href="https://github.com/eceo-epfl/deepreefmap-api"
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<FontAwesomeIcon icon={faGithub} />}
                        >
                            API
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <Typography variant="body2" color="textSecondary">
                            Interface developed by <Link to="https://evanjt.com" target="_blank" rel="noopener noreferrer">Evan Thomas</Link> for the DeepReefMap project
                            in collaboration<br />
                            with the <Link to="https://www.epfl.ch/labs/eceo/" target="_blank" rel="noopener noreferrer">ECEO lab</Link> and
                            the <Link to="http://trsc.org" target="_blank" rel="noopener noreferrer">Transnational Red Sea Center</Link>.
                        </Typography>

                    </Box>

                </Container>
            </Box>
        </Box>
    );
};

export default Dashboard;