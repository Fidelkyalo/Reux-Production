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
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const PAGE_SIZE = 12; // Smaller initial batch for speed

    const categories = ['ALL', ...PREDEFINED_CATEGORIES];

    useEffect(() => {
        if (isConfigured) {
            fetchInitialImages();
        } else {
            setInitialLoading(false);
            setLoading(false);
        }
    }, [filter]);

    const fetchInitialImages = async () => {
        setInitialLoading(true);
        setPage(0);
        const { data, error } = await supabase
            .from('portfolio_images')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(PAGE_SIZE);

        if (data) {
            setAllImages(data);
            setHasMore(data.length === PAGE_SIZE);
        }
        setInitialLoading(false);
        setLoading(false);
    };

    const fetchImages = async () => {
        const nextPage = page + 1;
        setLoading(true);
        const { data, error } = await supabase
            .from('portfolio_images')
            .select('*')
            .order('created_at', { ascending: false })
            .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);

        if (data) {
            setAllImages(prev => [...prev, ...data]);
            setPage(nextPage);
            setHasMore(data.length === PAGE_SIZE);
        }
        setLoading(false);
    };

    const displayedImages = useMemo(() => {
        // Shuffling only the first batch for variety without lag
        return allImages.map(img => ({
            id: img.id,
            src: img.image_url,
            categories: img.categories || []
        }));
    }, [allImages]);

    const handleLoadMore = () => {
        fetchImages();
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
                {initialLoading ? (
                    <div className="gallery-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="skeleton"></div>
                        ))}
                    </div>
                ) : displayedImages.length === 0 ? (
                    <div className="text-center" style={{ padding: '2rem' }}>No images found in this category.</div>
                ) : (
                    <>
                        <div className="gallery-grid">
                            {displayedImages.map((img, idx) => (
                                <div key={idx} className="gallery-item fade-in">
                                    <ImageWithBlur
                                        src={`${img.src}`}
                                        alt="Gallery"
                                    />
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="load-more-container" style={{ textAlign: 'center', marginTop: '3rem' }}>
                                <button className="btn-accent" onClick={handleLoadMore} disabled={loading}>
                                    {loading ? 'Optimizing...' : 'Show More Masterpieces'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

function ImageWithBlur({ src, alt }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`blur-image-container ${isLoaded ? 'loaded' : ''}`}>
            {!isLoaded && <div className="skeleton"></div>}
            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
                style={{ opacity: isLoaded ? 1 : 0 }}
            />
        </div>
    );
}

