import { Link } from "react-router-dom";

const Header = () => {
    return (<>
        <header className="header-container">
            <Link to="/" className="brand">
                <svg className="brand-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="2" y="2" width="28" height="28" rx="7" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 17h4l2.4-6.5 3 13 2.4-6.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="brand-name">TechSolve</span>
            </Link>
            <nav className="navbar">
                <Link to="/">Home</Link>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/login" className="nav-cta">Login</Link>
            </nav>
        </header>
    </>)
}

export default Header;
