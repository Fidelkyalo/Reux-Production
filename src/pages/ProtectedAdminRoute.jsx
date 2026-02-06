import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedAdminRoute({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    useEffect(() => {
        const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const email = sessionStorage.getItem('userEmail');

        if (loggedIn && email === 'reuxproduction@gmail.com') {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    if (isLoggedIn === null) return <div className="admin-container">Loading...</div>;

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
