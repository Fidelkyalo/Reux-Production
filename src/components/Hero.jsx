
import React, { useState, useEffect } from 'react';
import manifest from '../assets-manifest.json';
import './Hero.css';

export default function Hero() {
    const [bgImage, setBgImage] = useState('');

    useEffect(() => {
        // Pick a random image from WEDDINGS or NATURE for the hero
        const categories = ['WEDDINGS', 'NATURE', 'SHOOT'];
        const availableCategories = categories.filter(cat => manifest[cat] && manifest[cat].length > 0);

        if (availableCategories.length > 0) {
            const randomCat = availableCategories[Math.floor(Math.random() * availableCategories.length)];
            const images = manifest[randomCat];
            const randomImg = images[Math.floor(Math.random() * images.length)];
            setBgImage(randomImg);
        }
    }, []);

    return (
        <section id="hero" className="hero">
            <div className="hero-bg" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <div className="hero-overlay"></div>

            <div className="container hero-content">
                <h1 className="fade-in-up">REUX <span className="text-accent">PRODUCTION</span></h1>
                <p className="subtitle fade-in-up delay-200">Capturing Moments, Creating Memories</p>
                <div className="hero-actions fade-in-up delay-400">
                    <a href="#gallery" className="btn btn-accent">View Portfolio</a>
                    <a href="#contact" className="btn">Book Now</a>
                </div>
            </div>

            <div className="scroll-indicator">
                <div className="mouse"></div>
            </div>
        </section>
    );
}
