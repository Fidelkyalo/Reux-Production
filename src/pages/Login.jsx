import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Lock } from 'lucide-react';
import { supabase, isConfigured } from '../conf/supabase';
import '../styles/Admin.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!isConfigured || !supabase) {
            setError('System configuration error: Database not connected. Please restart the dev server to load the new .env file.');
            return;
        }

        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                setError(authError.message);
                console.error(authError);
            } else if (data.session) {
                navigate('/admin');
            }
        } catch (err) {
            setError('An unexpected error occurred during login.');
            console.error(err);
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
