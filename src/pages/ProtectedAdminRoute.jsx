import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../conf/supabase';

export default function ProtectedAdminRoute({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isLoggedIn === null) return <div className="admin-container">Loading...</div>;

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
