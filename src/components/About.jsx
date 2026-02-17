
import React, { useState, useEffect } from 'react';
import manifest from '../assets-manifest.json';
import './About.css';

export default function About() {
    const [profileImg, setProfileImg] = useState('');

    useEffect(() => {
        setProfileImg('/assets/profile.jpg');
    }, []);

    return (
        <section id="about" className="section about-section">
            <div className="container about-content">
                <div className="about-image">
                    {profileImg && <img src={profileImg} alt="Photographer Profile" />}
                    <div className="frame"></div>
                </div>
                <div className="about-text">
                    <h2>About The Artist</h2>
                    <p className="lead">Passionate about capturing the raw beauty of life through the lens.</p>
                    <p>
                        At REUX PRODUCTION, we believe that every moment has a story to tell.
                        With years of experience in wedding, nature, and event photography,
                        we strive to create timeless visuals that you will cherish forever.
                    </p>
                    <p>
                        Our approach is a blend of documentary realism and cinematic flair, ensuring that
                        each shot is both authentic and breathtaking.
                    </p>
                    <div className="stats">
                        <div className="stat-item">
                            <span className="number">500+</span>
                            <span className="label">Events Covered</span>
                        </div>
                        <div className="stat-item">
                            <span className="number">100%</span>
                            <span className="label">Client Satisfaction</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
