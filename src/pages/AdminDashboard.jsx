import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import manifest from '../assets-manifest.json';
import '../styles/Admin.css';

export default function AdminDashboard() {
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const navigate = useNavigate();

    // Get categories from manifest keys
    const categories = ['ALL', ...Object.keys(manifest).filter(k => Array.isArray(manifest[k]))];

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    // Get images for selected category
    const displayedImages = useMemo(() => {
        if (selectedCategory === 'ALL') {
            let allImages = [];
            Object.keys(manifest).forEach(category => {
                if (Array.isArray(manifest[category])) {
                    manifest[category].forEach(src => {
                        allImages.push({ src, category });
                    });
                }
            });
            return allImages;
        }

        return manifest[selectedCategory]?.map(src => ({ src, category: selectedCategory })) || [];
    }, [selectedCategory]);

    return (
        <div className="admin-container">
            <header className="dashboard-header">
                <h2>Admin Dashboard</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>{sessionStorage.getItem('userEmail')}</span>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="info-card">
                    <h3>📸 Photo Management</h3>
                    <p>To add new photos to your portfolio:</p>
                    <ol style={{ textAlign: 'left', marginTop: '1rem' }}>
                        <li>Copy your photos to the appropriate folder in <code>public/assets/</code></li>
                        <li>Run <code>npm run update-assets</code> in your terminal</li>
                        <li>Refresh this page to see the updated count</li>
                    </ol>
                </div>

                <div className="stats-card">
                    <h3>Current Photos</h3>
                    <div className="category-selector">
                        <label>View Category:</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat} ({cat === 'ALL' ? displayedImages.length : manifest[cat]?.length || 0})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="photo-grid">
                        {displayedImages.map((img, idx) => (
                            <div key={idx} className="photo-thumbnail">
                                <img src={img.src} alt={img.category} />
                                <span className="photo-category">{img.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
