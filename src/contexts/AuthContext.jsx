import { createContext, use, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authorized, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({ spotifyId: '', name: '', email: '', image_url: '' });

    const refreshStatus = async () => {
        if(authorized) return;
        
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:8080/api/status', { credentials: 'include' });
            const data = await res.json();
            
            setAuth(data.isLoggedIn);
            
            if (data.isLoggedIn) {
                setUser({
                    spotifyId: data.spotifyId,
                    name: data.name,
                    email: data.email,
                    image_url: data.image_url
                });
            }
        } catch (err) {
            console.error("Sesja wygasła lub błąd połączenia");
        } finally {
            setLoading(false);
        }
    };
    const login = () => {
        window.location.href = 'http://127.0.0.1:8080/oauth2/authorization/spotify';
    };

    useEffect(() => {
        refreshStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ authorized, loading, user, login, refreshStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);