import './css/css.css'
import './css/academicons.min.css'
import './css/fontawesome.all.min.css'
import './css/bulma.min.css'
import './css/bulma-carousel.min.css'
import './css/bulma-slider.min.css'
import { usePermissions } from 'react-admin';
import { Typography } from '@mui/material';

const Dashboard = () => {
    const { permissions } = usePermissions();

    return (
        <>{
            (permissions === 'admin' || permissions === 'user') ? null : (
                <>
                    <Typography
                        variant="body"
                        color="error"
                        align='center'
                        gutterBottom>
                        To access the DeepReefMap portal, please contact the administrator to request access.
                    </Typography>
                </>
            )}
            <section className="hero">
                <div className="hero-body">
                    <div className="container is-max-desktop">
                        <div className="columns is-centered">
                            <div className="column has-text-centered">
                                <h1 className="title is-1 publication-title">
                                    <b>DeepReefMap:</b>
                                    <br />
                                    Scalable Semantic 3D Mapping of Coral Reefs with Deep Learning
                                </h1>
                                <div className="is-size-5 publication-authors">


                                    <span className="author-block">
                                        <a href="https://scholar.google.com/citations?user=P1YcQw4AAAAJ&amp;hl=en&amp;oi=ao" target="_blank">Jonathan Sauder, </a></span>

                                    <span className="author-block">
                                        <a href="https://scholar.google.com/citations?user=ApxnBkYAAAAJ&amp;hl=en&amp;oi=ao" target="_blank">Guilhem Banc-Prandi, </a></span>
                                    <span className="author-block">
                                        <a href="https://scholar.google.com/citations?user=W5cZVtQAAAAJ&amp;hl=en&amp;oi=ao" target="_blank">Gabriela Perna, </a>
                                    </span>
                                    <span className="author-block">
                                        <a href="https://scholar.google.com/citations?user=6sXSYJMAAAAJ&amp;hl=en&amp;oi=ao" target="_blank">Anders Meibom, </a>
                                    </span>
                                    <span className="author-block">
                                        <a href="https://scholar.google.com/citations?user=p3iJiLIAAAAJ&amp;hl=en&amp;oi=ao" target="_blank">Devis Tuia</a>
                                    </span>

                                </div>

                                <div className="publication-links">
                                    <span className="link-block">
                                        <a
                                            href="https://arxiv.org/pdf/2309.12804.pdf"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="external-link button is-normal is-rounded is-dark"
                                        >
                                            <span className="icon">
                                                <i className="fas fa-file-pdf" />
                                            </span>
                                            <span>Pre-Print</span>
                                        </a>
                                    </span>
                                    {/* Add more link-block sections as needed */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div class="container is-max-desktop">
                    <div class="hero-body">
                        <video poster="" id="tree" autoplay="" controls="" muted="" loop="" width="100%">
                            <source src="https://josauder.github.io/deepreefmap/static/videos/speedup_44.mp4" type="video/mp4" />
                        </video>
                        <h2 class="subtitle has-text-centered">
                            This is the project page of DeepReefMap, an in-development method for semantic 3D mapping of coral reefs from underwater video.
                            DeepReefMap is being developed within the Transnational Red Sea Center at EPFL in collaboration with partnering researchers in the Red Sea.
                        </h2>
                    </div>
                </div>
            </section></>
    );
};

export default Dashboard;
