const Footer = () => {
    return (<>
        <footer className="footer-container">
            <div className="footer-brand">
                <svg className="brand-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="2" y="2" width="28" height="28" rx="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 17h4l2.4-6.5 3 13 2.4-6.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="brand-name">TechSolve</span>
            </div>
            <p className="footer-note">Support that gets to the point.</p>
        </footer>
    </>)
}

export default Footer;
