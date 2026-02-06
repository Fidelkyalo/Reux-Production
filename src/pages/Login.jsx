import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import '../styles/Admin.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const AUTH_EMAIL = 'reuxproduction@gmail.com';
    const AUTH_PASSCODE = 'reuxproduction26';

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simple local credential check
        if (email === AUTH_EMAIL && password === AUTH_PASSCODE) {
            // Store session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userEmail', email);
            navigate('/admin');
        } else {
            setError('Invalid credentials. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="admin-container">
            <Link to="/" className="back-link">
                <ChevronLeft size={20} />
                Back to Website
            </Link>

            <div className="login-card fade-in">
                <div className="lock-icon">
                    <Lock size={32} />
                </div>
                <h2>Admin access</h2>
                <p className="login-subtitle">Enter your credentials to manage your gallery</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Passcode</label>
                        <input
                            type="password"
                            placeholder="Enter passcode"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
