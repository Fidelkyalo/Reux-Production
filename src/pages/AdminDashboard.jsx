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
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 24;

    // Upload state
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadCategories, setUploadCategories] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]); // For batch deletion

    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialImages();
    }, []);

    const fetchInitialImages = async () => {
        setLoading(true);
        setPage(0);
        const { data, error } = await supabase
            .from('portfolio_images')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(PAGE_SIZE);

        if (error) {
            console.error("Error fetching images:", error);
        } else if (data) {
            setImages(data);
            setHasMore(data.length === PAGE_SIZE);
            const allCats = data.flatMap(img => img.categories || []);
            const uniqueCats = [...new Set(allCats)];
            setCategories(['ALL', ...uniqueCats]);
        }
        setLoading(false);
    };

    const fetchMoreImages = async () => {
        const nextPage = page + 1;
        setLoading(true);
        const { data, error } = await supabase
            .from('portfolio_images')
            .select('*')
            .order('created_at', { ascending: false })
            .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);

        if (error) {
            console.error("Error fetching more images:", error);
        } else if (data) {
            setImages(prev => [...prev, ...data]);
            setPage(nextPage);
            setHasMore(data.length === PAGE_SIZE);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1600;
                    const MAX_HEIGHT = 1600;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                // Create a new file from the blob
                                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                                    type: 'image/webp',
                                    lastModified: Date.now(),
                                });
                                resolve(compressedFile);
                            } else {
                                reject(new Error('Canvas to Blob conversion failed'));
                            }
                        },
                        'image/webp',
                        0.8 // 80% quality for excellent balance
                    );
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleUpload = async (e) => {
        if (e) e.preventDefault();
        if (uploadFiles.length === 0 || uploadCategories.length === 0) {
            setUploadMessage('Please select files and at least one category.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setUploadMessage(`Processing ${uploadFiles.length} photos...`);

        try {
            for (let i = 0; i < uploadFiles.length; i++) {
                let file = uploadFiles[i];
                const progress = Math.round(((i) / uploadFiles.length) * 100);
                setUploadProgress(progress);
                setUploadMessage(`Optimizing & Uploading ${i + 1}/${uploadFiles.length}: ${file.name}`);

                // 0. Compress Image Client-Side
                try {
                    file = await compressImage(file);
                } catch (err) {
                    console.error("Compression failed for", file.name, err);
                    // Fallback to original if compression fails
                }

                // 1. Upload to Storage
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
                const filePath = `${uploadCategories[0].toLowerCase().replace(/\s+/g, '-')}/${fileName}`;

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
                        { image_url: publicUrl, categories: uploadCategories }
                    ]);

                if (dbError) throw dbError;
            }

            setUploadProgress(100);
            setUploadMessage(`Successfully uploaded ${uploadFiles.length} photos to ${uploadCategories.join(', ')}!`);
            setUploadFiles([]);
            setUploadCategories([]);

            // Re-fetch gallery
            fetchInitialImages();

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

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === displayedImages.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(displayedImages.map(img => img.id));
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected images? This cannot be undone.`)) return;

        setUploading(true);
        setUploadMessage(`Starting deletion of ${selectedIds.length} images...`);
        console.log("Starting bulk delete for IDs:", selectedIds);

        try {
            const imagesToDelete = images.filter(img => selectedIds.includes(img.id));
            console.log("Found images in state:", imagesToDelete.length);

            // 1. Prepare Storage paths with more robust parsing
            const storagePaths = imagesToDelete.map(img => {
                try {
                    const url = new URL(img.image_url);
                    // Extract path after /portfolio-assets/
                    // Handle various URL formats (public vs private/relative)
                    const parts = url.pathname.split('portfolio-assets/');
                    if (parts.length < 2) {
                        console.warn("Could not find portfolio-assets in URL:", img.image_url);
                        return null;
                    }
                    return parts[1];
                } catch (e) {
                    console.error("URL Parsing failed for:", img.image_url, e);
                    return null;
                }
            }).filter(p => p !== null);

            console.log("Resolved storage paths:", storagePaths);

            if (storagePaths.length > 0) {
                setUploadMessage(`Removing ${storagePaths.length} files from storage...`);
                // Use the storage client directly to remove
                const { data, error: storageError } = await supabase.storage
                    .from('portfolio-assets')
                    .remove(storagePaths);

                if (storageError) {
                    console.error("Supabase Storage Delete Error:", storageError);
                    // We continue anyway to try and clear the DB records
                } else {
                    console.log("Storage delete success:", data);
                }
            }

            // 2. Delete from Database
            setUploadMessage(`Clearing ${selectedIds.length} database records...`);
            const { error: dbError } = await supabase
                .from('portfolio_images')
                .delete()
                .in('id', selectedIds);

            if (dbError) {
                console.error("Supabase Database Delete Error:", dbError);
                throw new Error(`Database Error: ${dbError.message}`);
            }

            console.log("Database delete success");
            setUploadMessage(`Successfully deleted ${selectedIds.length} images.`);
            setSelectedIds([]);
            await fetchInitialImages();

            setTimeout(() => setUploadMessage(''), 3000);
        } catch (error) {
            console.error("Final Deletion Fail:", error);
            setUploadMessage(`Delete Failed: ${error.message}`);
            alert(`Delete Failed: ${error.message}. Check console for details.`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, imageUrl) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            // 1. Delete from DB first
            const { error: dbError } = await supabase.from('portfolio_images').delete().eq('id', id);
            if (dbError) throw dbError;

            // 2. Extract path and delete from storage
            try {
                const url = new URL(imageUrl);
                const parts = url.pathname.split('portfolio-assets/');
                if (parts.length === 2) {
                    await supabase.storage.from('portfolio-assets').remove([parts[1]]);
                }
            } catch (e) {
                console.error("Storage delete fail (non-fatal):", e);
            }

            fetchInitialImages();
        } catch (error) {
            console.error('Delete Error:', error);
            alert(`Failed to delete image: ${error.message}`);
        }
    };

    const displayedImages = useMemo(() => {
        if (selectedCategory === 'ALL') return images;
        return images.filter(img => (img.categories || []).includes(selectedCategory));
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
                                    <p><strong>{uploadFiles.length}</strong> photos selected ready for {uploadCategories.length > 0 ? uploadCategories.join(', ') : '...'}</p>
                                    <div className="preview-actions">
                                        <button type="button" onClick={(e) => { e.stopPropagation(); clearFiles(); }} className="btn-small btn-outline">Clear All</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>2. Select Categories (Select all that apply):</label>
                            <div className="category-chips">
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`chip ${uploadCategories.includes(cat) ? 'active' : ''}`}
                                        onClick={() => {
                                            setUploadCategories(prev =>
                                                prev.includes(cat)
                                                    ? prev.filter(c => c !== cat)
                                                    : [...prev, cat]
                                            );
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
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
                            disabled={uploading || uploadFiles.length === 0 || uploadCategories.length === 0}
                            className="btn-primary upload-submit-btn"
                        >
                            {uploading ? 'Processing Batch...' : `Start Upload (${uploadFiles.length} Photos)`}
                        </button>

                        {!uploading && uploadFiles.length > 0 && uploadCategories.length === 0 && (
                            <p style={{ color: '#d4af37', fontSize: '0.85rem', textAlign: 'center', marginTop: '-1rem' }}>
                                💡 Tip: Select at least one category above to enable the upload button.
                            </p>
                        )}
                    </form>
                </div>

                <div className="stats-card fade-in">
                    <div className="management-toolbar">
                        <h3>🖼️ Manage Portfolio ({images.length} total)</h3>
                        <div className="batch-actions">
                            <button
                                onClick={toggleSelectAll}
                                className="btn-small btn-outline"
                            >
                                {selectedIds.length === displayedImages.length && displayedImages.length > 0 ? 'Deselect All' : 'Select All'}
                            </button>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="btn-small btn-delete-batch"
                                >
                                    Delete Selected ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading images...</p>
                    ) : (
                        <>
                            <div className="category-selector">
                                <label>Filter View:</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat} ({cat === 'ALL' ? images.length : images.filter(i => (i.categories || []).includes(cat)).length})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="photo-grid">
                                {displayedImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className={`photo-thumbnail ${selectedIds.includes(img.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSelection(img.id)}
                                        style={{ position: 'relative' }}
                                    >
                                        <div className="selection-overlay">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(img.id)}
                                                readOnly
                                            />
                                        </div>
                                        <img src={`${img.image_url}?width=300&quality=50`} alt="Portfolio" />
                                        <span className="photo-category">{(img.categories || []).join(', ')}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(img.id, img.image_url); }}
                                            className="individual-delete-btn"
                                            title="Delete Image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {displayedImages.length === 0 && <p>No images found in this category.</p>}
                            </div>

                            {hasMore && (
                                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                                    <button
                                        onClick={fetchMoreImages}
                                        className="btn-primary"
                                        style={{ width: 'auto', padding: '0.8rem 3rem' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Load More Photos'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
