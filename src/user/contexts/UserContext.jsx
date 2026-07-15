import { createContext, useContext, useState, useEffect } from 'react';

import { useAuth } from '../../global/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const { spotifyAuthorized, loadingAuth } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [queryForResults, setQueryForResults] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const [userPlaylists, setUserPlaylists] = useState([]);
    
    const [selectedTrackContainer, setSelectedTrackContainer] = useState(null);

    const [queue, setQueue] = useState([]);

    // Fetch user playlists when authorized state changes
    useEffect(() => {

        if(loadingAuth || !spotifyAuthorized) {
            setUserPlaylists([]);
            return;
        }
        
        fetch(`${API_BASE_URL}/api/spotify/user-playlists`, {
            credentials: 'include',
        })
        .then(res => {
            if (res.status != 200) {
                console.log("Could not fetch playlists.");
                return [];
            }
            return res.json();
        })
        .then(data => {
            setUserPlaylists(data);
        })
        .catch(err => console.error("Failed to fetch playlists:", err));

    }, [spotifyAuthorized, loadingAuth]);

    const refreshUserQueue = () => {
        fetch(`${API_BASE_URL}/api/party/queue`, {
            credentials: 'include',
        })
        .then((res) => { if(!res.ok) return []; return res.json(); })
        .then(data => {
            if (queue.length === 0 && data.length === 0) {
                return;
            }
            setQueue(data);
        })
        .catch(err => console.error("Błąd", err));
    };
    const addToQueue = (trackId) => {
        fetch(`${API_BASE_URL}/api/party/queue`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackId })
        }).then(() => refreshUserQueue());
    };
    const removeFromQueue = (queueItemId) => {
        fetch(`${API_BASE_URL}/api/party/queue`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ queueItemId })
        }).then(() => refreshUserQueue());
    };

    return (
        <UserContext.Provider value={{ 
            searchResults, setSearchResults, 
            searchQuery, setSearchQuery, 
            queryForResults, setQueryForResults, 
            userPlaylists, refreshUserQueue,
            selectedTrackContainer, setSelectedTrackContainer,
            queue, addToQueue, removeFromQueue,
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);