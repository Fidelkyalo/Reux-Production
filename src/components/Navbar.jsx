
import React, { useState, useEffect } from 'react';
import { Menu, X, Instagram, LogIn, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
            const email = sessionStorage.getItem('userEmail');
            setIsLoggedIn(loggedIn && email === 'reuxproduction@gmail.com');
        };

        checkAuth();
        // Listen for storage changes in other tabs
        window.addEventListener('storage', checkAuth);
        // Also check periodically or on navigation if needed
        return () => window.removeEventListener('storage', checkAuth);
    }, [location]);

    const handleNavClick = (id) => {
        setIsOpen(false);
        if (!isHome) {
            navigate('/', { state: { scrollTo: id } });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <Link to="/" className="logo">
                    <img src="/assets/logo.jpg" alt="REUX" />
                </Link>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <a href="#hero" onClick={() => handleNavClick('hero')}>Home</a>
                    <a href="#gallery" onClick={() => handleNavClick('gallery')}>Portfolio</a>
                    <a href="#about" onClick={() => handleNavClick('about')}>About</a>
                    <a href="#contact" onClick={() => handleNavClick('contact')}>Contact</a>

                    <div className="social-mobile">
                        <a href="https://www.instagram.com/reux_production?igsh=MTJqN3M3d2Fka2Jq" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                        <Link to="/login" className="login-icon" onClick={() => setIsOpen(false)}><LogIn size={20} /></Link>
                    </div>
                </div>

                <div className="nav-actions">
                    <div className="social-desktop">
                        <a href="https://www.instagram.com/reux_production?igsh=MTJqN3M3d2Fka2Jq" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
                        {isLoggedIn ? (
                            <Link to="/admin" title="Admin Dashboard"><User size={20} /></Link>
                        ) : (
                            <Link to="/login" title="Admin Login"><LogIn size={20} /></Link>
                        )}
                    </div>
                    <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
}
