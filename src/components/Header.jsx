import { Link } from "react-router-dom";

const Header = () => {
    return (<>
        <header className="header-container">
            <img className="logo" src="/logo.jfif" alt="" />
            <nav className="navbar">
                <Link to="/">Home</Link>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/login">Login</Link>
            </nav>
        </header>
    </>)
}

export default Header;