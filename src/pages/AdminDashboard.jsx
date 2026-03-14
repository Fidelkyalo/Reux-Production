import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../conf/supabase';
import '../styles/Admin.css';

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

export default function AdminDashboard() {
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState(['ALL']);
    const [loading, setLoading] = useState(true);

    // Upload state
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    const navigate = useNavigate();

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
            setImages(data);
            const uniqueCats = [...new Set(data.map(img => img.category))];
            setCategories(['ALL', ...uniqueCats]);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadCategory.trim()) {
            setUploadMessage('Please select a file and enter a category.');
            return;
        }

        setUploading(true);
        setUploadMessage('');

        try {
            // 1. Upload to Storage
            const fileExt = uploadFile.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${uploadCategory.toLowerCase().replace(/\s+/g, '-')}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolio-assets')
                .upload(filePath, uploadFile, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('portfolio-assets')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('portfolio_images')
                .insert([
                    { image_url: publicUrl, category: uploadCategory.trim() }
                ]);

            if (dbError) throw dbError;

            setUploadMessage('Upload successful!');
            setUploadFile(null);
            setUploadCategory('');

            // Re-fetch gallery
            fetchImages();

        } catch (error) {
            console.error('Upload Error:', error);
            setUploadMessage(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, imageUrl) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            // Delete from DB
            await supabase.from('portfolio_images').delete().eq('id', id);

            // Extract the path from the publicUrl to delete from storage
            const pathParts = imageUrl.split('/portfolio-assets/');
            if (pathParts.length === 2) {
                await supabase.storage.from('portfolio-assets').remove([pathParts[1]]);
            }

            fetchImages();
        } catch (error) {
            console.error('Delete Error:', error);
            alert("Failed to delete image");
        }
    };

    const displayedImages = useMemo(() => {
        if (selectedCategory === 'ALL') return images;
        return images.filter(img => img.category === selectedCategory);
    }, [selectedCategory, images]);

    return (
        <div className="admin-container">
            <header className="dashboard-header">
                <h2>Admin Dashboard</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="info-card">
                    <h3>📸 Upload New Photo</h3>
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category Name:</label>
                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#333', color: 'white' }}
                            >
                                <option value="" disabled>Select a category</option>
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Image:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                required
                                style={{ width: '100%' }}
                            />
                        </div>
                        {uploadMessage && <div style={{ color: uploadMessage.includes('failed') ? 'red' : 'green' }}>{uploadMessage}</div>}
                        <button type="submit" disabled={uploading} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                            {uploading ? 'Uploading...' : 'Upload Photo'}
                        </button>
                    </form>
                </div>

                <div className="stats-card">
                    <h3>Current Photos Managed by Supabase</h3>

                    {loading ? (
                        <p>Loading images...</p>
                    ) : (
                        <>
                            <div className="category-selector">
                                <label>View Category:</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat} ({cat === 'ALL' ? images.length : images.filter(i => i.category === cat).length})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="photo-grid">
                                {displayedImages.map((img) => (
                                    <div key={img.id} className="photo-thumbnail" style={{ position: 'relative' }}>
                                        <img src={img.image_url} alt={img.category} />
                                        <span className="photo-category">{img.category}</span>
                                        <button
                                            onClick={() => handleDelete(img.id, img.image_url)}
                                            style={{
                                                position: 'absolute', top: 5, right: 5,
                                                background: 'rgba(255, 0, 0, 0.8)', color: 'white', border: 'none',
                                                borderRadius: '50%', width: 25, height: 25, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 'bold'
                                            }}
                                            title="Delete Image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {displayedImages.length === 0 && <p>No images found in this category.</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
