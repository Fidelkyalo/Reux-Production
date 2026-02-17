import React, { useState, useMemo } from 'react';
import manifest from '../assets-manifest.json';
import './Gallery.css';

export default function Gallery() {
    const [filter, setFilter] = useState('ALL');

    // Flatten manifest into a single array of images
    const allImages = useMemo(() => {
        let images = [];
        Object.keys(manifest).forEach(category => {
            if (Array.isArray(manifest[category])) {
                manifest[category].forEach(src => {
                    images.push({ src, category });
                });
            }
        });
        // Shuffle slightly for "ALL" view so it's not just blocks
        return images.sort(() => 0.5 - Math.random());
    }, []);

    const filteredImages = useMemo(() => {
        if (filter === 'ALL') return allImages;
        return allImages.filter(img => img.category === filter);
    }, [filter, allImages]);

    const categories = ['ALL', ...Object.keys(manifest).filter(k => Array.isArray(manifest[k]))];

    return (
        <section className="gallery" id="gallery">
            <div className="container">
                <h2 className="section-title">Gallery</h2>
                <div className="filter-buttons">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="gallery-grid">
                    {filteredImages.map((img, idx) => (
                        <div key={idx} className="gallery-item">
                            <img src={img.src} alt={img.category} loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
