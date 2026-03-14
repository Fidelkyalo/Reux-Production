import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../conf/supabase';
import './Gallery.css';

const PREDEFINED_CATEGORIES = [
    'WEDDINGS',
    'NATURE',
    'STUDIO',
    'ENTERTEINMENT',
    'GRADUATION',
    'PROPOSAL',
    'RURACIO',
    'SHOOT',
    'WORK',
    'Open Air',
    'LIVE RECORDING'
];

export default function Gallery() {
    const [filter, setFilter] = useState('ALL');
    const [allImages, setAllImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ['ALL', ...PREDEFINED_CATEGORIES];

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('portfolio_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching images:", error);
        } else if (data) {
            const formattedImages = data.map(img => ({
                src: img.image_url,
                category: img.category
            }));

            // Shuffle images
            formattedImages.sort(() => 0.5 - Math.random());
            setAllImages(formattedImages);
        }
        setLoading(false);
    };

    const filteredImages = useMemo(() => {
        if (filter === 'ALL') return allImages;
        return allImages.filter(img => img.category === filter);
    }, [filter, allImages]);

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
                {loading ? (
                    <div className="text-center" style={{ padding: '2rem' }}>Loading gallery...</div>
                ) : filteredImages.length === 0 ? (
                    <div className="text-center" style={{ padding: '2rem' }}>No images found in this category.</div>
                ) : (
                    <div className="gallery-grid">
                        {filteredImages.map((img, idx) => (
                            <div key={idx} className="gallery-item">
                                <img src={img.src} alt={img.category} loading="lazy" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

