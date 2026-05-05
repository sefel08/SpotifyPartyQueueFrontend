import { small } from 'framer-motion/client';
import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();
    
export const AuthProvider = ({ children }) => {
    const [authorized, setAuth] = useState(false);
    const [spotifyAuthorized, setSpotifyAuth] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [hasHostPermissions, setHasHostPermissions] = useState(false);
    const [user, setUser] = useState({ displayName: '', imageUrl: '', smallImageUrl: '' });
    const [userRole, setUserRole] = useState({ isUser: false, isPlayer: false, isHost: false });

    const [spotifyUserToken, setSpotifyUserToken] = useState(null);

    const [loadingAuth, setLoadingAuth] = useState(true);

    const refreshStatus = async () => {
        setLoadingAuth(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/status`, { credentials: 'include' });
            const data = await res.json();
            
            setAuth(data.isLoggedIn);

            if (data.isLoggedIn) {
                setSpotifyAuth(data.isSpotifyAuthenticated);
                setUser({
                    displayName: data.displayName,
                    imageUrl: data.imageUrl,
                    smallImageUrl: data.imageUrlSmall
                });
                setIsPremium(data.isPremium);
                setHasHostPermissions(data.hasHostPermissions);
                setUserRole({
                    isUser: data.isUser,
                    isPlayer: data.isPlayer,
                    isHost: data.isHost
                });
            } else {
                setSpotifyAuth(false);
                setUser({ displayName: '', imageUrl: '', smallImageUrl: '' });
                setIsPremium(false);
                setHasHostPermissions(false);
                setUserRole({ isUser: false, isPlayer: false, isHost: false });
            }

        } catch (err) {
            console.error("Sesja wygasła lub błąd połączenia");
        } finally {
            console.log("Auth status refreshed");
            setLoadingAuth(false);
        }

    };
    const login = (asHost = false) => {
        const currentUrl = window.location.href;
        const isNonStandard = currentUrl !== 'http://127.0.0.1:5173/';
        if (isNonStandard) {
            localStorage.setItem('postLoginRedirect', currentUrl);
        }
        const endpoint = asHost ? 'spotify-host' : 'spotify';
        window.location.href = `${API_BASE_URL}/oauth2/authorization/${endpoint}`;
    };
    const loginAsGuest = (displayName) => {
        return fetch(`${API_BASE_URL}/api/user/login-as-guest`, {
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

    const refreshSpotifyToken = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/spotify-token`, { credentials: 'include' });
            const data = await res.json();
            
            const newToken = data.spotifyUserToken;
            if (!newToken) {
                console.warn("No Spotify token received during refresh");
                if (data.needsReauth) {
                    console.warn("Spotify token expired and re-authentication is required");
                    login();
                } else {
                    console.error("Unexpected response during Spotify token refresh");
                    setSpotifyAuth(false);
                    setSpotifyUserToken(null);
                }
            }

            setSpotifyUserToken(newToken);

        } catch (err) {
            console.error("Error refreshing Spotify token:", err);
        }
    };

    useEffect(() => {
        refreshStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ authorized, spotifyAuthorized, loadingAuth, user, login, refreshStatus, loginAsGuest, spotifyUserToken, isPremium, hasHostPermissions, refreshSpotifyToken, userRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);