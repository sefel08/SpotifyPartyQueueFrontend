import { small } from 'framer-motion/client';
import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authorized, setAuth] = useState(false);
    const [spotifyAuthorized, setSpotifyAuth] = useState(false);
    const [user, setUser] = useState({ displayName: '', imageUrl: '', smallImageUrl: '' });

    const [loadingAuth, setLoadingAuth] = useState(true);

    const refreshStatus = async () => {
        if(authorized && spotifyAuthorized) return;

        setLoadingAuth(true);

        try {
            const res = await fetch('http://127.0.0.1:8080/api/status', { credentials: 'include' });
            const data = await res.json();
            
            setAuth(data.isLoggedIn);

            if (data.isLoggedIn) {
                setSpotifyAuth(data.isSpotifyAuthenticated);
                setUser({
                    displayName: data.displayName,
                    imageUrl: data.imageUrl,
                    smallImageUrl: data.imageUrlSmall
                });
            }
            
        } catch (err) {
            console.error("Sesja wygasła lub błąd połączenia");
        } finally {
            setLoadingAuth(false);
        }

    };
    const login = () => {
        window.location.href = 'http://127.0.0.1:8080/oauth2/authorization/spotify';
    };
    const loginAsGuest = (displayName) => {
        return fetch('http://127.0.0.1:8080/api/user/login-as-guest', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'Text/plain'
            },
            body: displayName
        }).then(
            () => refreshStatus()
        );
    };

    useEffect(() => {
        refreshStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ authorized, spotifyAuthorized, loadingAuth, user, login, refreshStatus, loginAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);