import React from 'react';
import './Hero.css';

export default function Hero() {
    return (
        <section id="hero" className="hero">
            <div className="container hero-container">
                <div className="hero-text-side">
                    <h1 className="fade-in-up uppercase">REUX <span className="text-accent">PRODUCTION</span></h1>
                    <p className="subtitle fade-in-up delay-200">Capturing Moments, Creating Memories</p>
                    <div className="hero-actions fade-in-up delay-400">
                        <a href="#gallery" className="btn btn-accent">View Portfolio</a>
                        <a href="#contact" className="btn">Book Now</a>
                    </div>
                </div>

                <div className="hero-collage-side fade-in-up delay-600">
                    <div className="collage-container">
                        <div className="collage-item item-1">
                            <img src="/assets/hero1.jpg" alt="Photography 1" />
                        </div>
                        <div className="collage-item item-2">
                            <img src="/assets/hero2.jpg" alt="Photography 2" />
                        </div>
                        <div className="collage-item item-3">
                            <img src="/assets/hero3.jpg" alt="Photography 3" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="scroll-indicator">
                <div className="mouse"></div>
            </div>
        </section>
    );
}
