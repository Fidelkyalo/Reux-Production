import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isConfigured } from '../conf/supabase';
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
    const [displayLimit, setDisplayLimit] = useState(24);
    const [loading, setLoading] = useState(true);

    const categories = ['ALL', ...PREDEFINED_CATEGORIES];

    useEffect(() => {
        if (isConfigured) {
            fetchImages();
        } else {
            console.warn("Gallery: Supabase is not configured. Skipping fetch.");
            setLoading(false);
        }
    }, []);

    const fetchImages = async () => {
        if (!isConfigured) return;
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
                categories: img.categories || []
            }));

            // Shuffle images
            formattedImages.sort(() => 0.5 - Math.random());
            setAllImages(formattedImages);
        }
        setLoading(false);
    };

    const filteredImages = useMemo(() => {
        let filtered = filter === 'ALL'
            ? allImages
            : allImages.filter(img => img.categories.includes(filter));
        return filtered;
    }, [filter, allImages]);

    const displayedImages = useMemo(() => {
        return filteredImages.slice(0, displayLimit);
    }, [filteredImages, displayLimit]);

    const handleLoadMore = () => {
        setDisplayLimit(prev => prev + 24);
    };

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
                ) : displayedImages.length === 0 ? (
                    <div className="text-center" style={{ padding: '2rem' }}>No images found in this category.</div>
                ) : (
                    <>
                        <div className="gallery-grid">
                            {displayedImages.map((img, idx) => (
                                <div key={idx} className="gallery-item">
                                    <img
                                        src={`${img.src}?width=800&quality=75`}
                                        alt="Gallery"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>

                        {displayLimit < filteredImages.length && (
                            <div className="load-more-container" style={{ textAlign: 'center', marginTop: '3rem' }}>
                                <button className="btn-accent" onClick={handleLoadMore}>
                                    Load More Photos ({filteredImages.length - displayLimit} remaining)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

