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
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadCategory, setUploadCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

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
        if (e) e.preventDefault();
        if (uploadFiles.length === 0 || !uploadCategory.trim()) {
            setUploadMessage('Please select files and select a category.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadMessage(`Processing ${uploadFiles.length} photos...`);

        try {
            for (let i = 0; i < uploadFiles.length; i++) {
                const file = uploadFiles[i];
                const progress = Math.round(((i) / uploadFiles.length) * 100);
                setUploadProgress(progress);
                setUploadMessage(`Uploading ${i + 1}/${uploadFiles.length}: ${file.name}`);

                // 1. Upload to Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${uploadCategory.toLowerCase().replace(/\s+/g, '-')}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('portfolio-assets')
                    .upload(filePath, file, { upsert: true });

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
            }

            setUploadProgress(100);
            setUploadMessage(`Successfully uploaded ${uploadFiles.length} photos to ${uploadCategory}!`);
            setUploadFiles([]);
            setUploadCategory('');

            // Re-fetch gallery
            fetchImages();

            // Clear success message after 5 seconds
            setTimeout(() => setUploadMessage(''), 5000);

        } catch (error) {
            console.error('Upload Error:', error);
            setUploadMessage(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            setUploadFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index) => {
        setUploadFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
        setUploadFiles([]);
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
                <div className="info-card fade-in">
                    <h3>🚀 Bulk Photo Management</h3>
                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Drag and drop your images below. You can upload 100+ photos at once, though we recommend batches of ~200 for best stability.
                    </p>

                    <form onSubmit={handleUpload} onDragEnter={handleDrag} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>1. Select Portfolio Category:</label>
                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
                            >
                                <option value="" disabled>Choose category for this batch...</option>
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div
                            className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploadFiles.length > 0 ? 'has-files' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input
                                id="file-input"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setUploadFiles(prev => [...prev, ...Array.from(e.target.files)])}
                                multiple
                                style={{ display: 'none' }}
                            />

                            {uploadFiles.length === 0 ? (
                                <div className="upload-prompt">
                                    <div className="upload-icon">📁</div>
                                    <p>Drag photos here or <span>click to browse</span></p>
                                    <small>Supports JPG, PNG, WEBP</small>
                                </div>
                            ) : (
                                <div className="file-preview-list">
                                    <p><strong>{uploadFiles.length}</strong> photos selected ready for {uploadCategory || '...'}</p>
                                    <div className="preview-actions">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); clearFiles(); }} className="btn-small btn-outline">Clear All</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {uploading && (
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <div className="progress-stats">
                                    <span>{uploadProgress}%</span>
                                </div>
                            </div>
                        )}

                        {uploadMessage && (
                            <div className={`status-message ${uploadMessage.includes('failed') ? 'error' : 'success'}`}>
                                {uploading && <span className="spinner">⏳</span>} {uploadMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading || uploadFiles.length === 0 || !uploadCategory}
                            className="btn-primary upload-submit-btn"
                        >
                            {uploading ? 'Processing Batch...' : `Start Upload (${uploadFiles.length} Photos)`}
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
