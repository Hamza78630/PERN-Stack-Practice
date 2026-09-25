import { Link } from "react-router-dom";

const Home = () => {
    return (<>
        <section className="hero">
            <div className="hero-copy">
                <h1>Technology, solved.</h1>
                <p>
                    TechSolve is a support hub for the fixes, questions and troubleshooting
                    that get in the way of your day. Tell us what's wrong and we'll get you
                    back on track.
                </p>
                <div className="hero-actions">
                    <Link to="/login" className="btn-primary">Get support</Link>
                    <a href="#help" className="btn-ghost">How it works</a>
                </div>
            </div>

            <div className="hero-art" aria-hidden="true">
                <svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg">
                    <rect x="30" y="20" width="230" height="140" rx="10" className="art-kraft" strokeWidth="2" />
                    <circle cx="58" cy="48" r="6" className="art-red" />
                    <circle cx="80" cy="48" r="6" className="art-amber" />
                    <circle cx="102" cy="48" r="6" className="art-success" />
                    <path d="M46 100h55l14-28 18 56 14-28h48" className="art-line" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="110" y="120" width="220" height="150" rx="10" className="art-panel" strokeWidth="2" />
                    <rect x="130" y="146" width="120" height="10" rx="5" className="art-indigo-fill" />
                    <rect x="130" y="170" width="160" height="10" rx="5" className="art-line-fill" />
                    <rect x="130" y="194" width="90" height="10" rx="5" className="art-line-fill" />
                    <circle cx="295" cy="235" r="22" className="art-red-fill" />
                    <path d="M286 235l6 6 13-15" className="art-check" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </section>

        <section className="help-section" id="help">
            <h2>How can we help?</h2>

            <div className="help-list">
                <div className="help-item">
                    <svg className="help-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.7 2.7-2-2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3>Troubleshoot</h3>
                    <p>Step-by-step fixes for the errors and glitches that slow you down.</p>
                </div>

                <div className="help-item">
                    <svg className="help-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M4 13a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        <rect x="3" y="13" width="4" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                        <rect x="17" y="13" width="4" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    <h3>Tech Help</h3>
                    <p>Talk to a real person when a fix needs more than a guide.</p>
                </div>

                <div className="help-item">
                    <svg className="help-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M5 17a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    <h3>Guide</h3>
                    <p>Clear documentation written for people, not engineers.</p>
                </div>
            </div>
        </section>

        <section className="whyus-section">
            <h2>Why choose us</h2>

            <div className="whyus-list">
                <div className="whyus-item">
                    <span className="whyus-check">✓</span>
                    <span>Easy to understand</span>
                </div>
                <div className="whyus-item">
                    <span className="whyus-check">✓</span>
                    <span>Reliable solutions</span>
                </div>
                <div className="whyus-item">
                    <span className="whyus-check">✓</span>
                    <span>Support when you need it</span>
                </div>
                <div className="whyus-item">
                    <span className="whyus-check">✓</span>
                    <span>Step-by-step guides</span>
                </div>
            </div>
        </section>
    </>)
}

export default Home;
