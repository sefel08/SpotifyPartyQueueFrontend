import { createContext, useContext, useState, useEffect, useRef } from 'react';

import { useAuth } from '../../global/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const UserContext = createContext();

export const UserProvider = ({ children }) => {

    const { spotifyAuthorized, loadingAuth } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({tracks: [], albums: [], artists: []});
    const [searchPinnedResults, setSearchPinnedResults] = useState({albums: [], artists: []});

    const [userPlaylists, setUserPlaylists] = useState([]);
    
    const [selectedTrackContainer, setSelectedTrackContainer] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    
    const viewItemHistoryRef = useRef([]);

    const [fetchingArtistAlbums, setFetchingArtistAlbums] = useState(false);
    const [selectedArtistAlbums, setSelectedArtistAlbums] = useState([]);

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

    // Fetch selected artist albums when selectedArtist changes
    useEffect(() => {
        if (!selectedArtist || fetchingArtistAlbums) return;
        setFetchingArtistAlbums(true);
        fetch(`${API_BASE_URL}/api/spotify/artist-albums?artistId=${selectedArtist.id}`, {
            credentials: 'include',
        })
        .then(res => {
            if (res.status !== 200) {
                console.log("Could not fetch artist albums.");
                return [];
            }
            return res.json();
        })
        .then(data => {
            if (data)
                setSelectedArtistAlbums(data);
            setFetchingArtistAlbums(false);
        })
        .catch(err => console.error("Failed to fetch artist albums:", err));
    }, [selectedArtist]);

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
    const searchForResults = async (query) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/spotify/search?query=${encodeURIComponent(query)}`, {
                credentials: 'include',
            });
            
            if (res.status !== 200) {
                console.log('error while searching tracks: ', res.status);
                return;
            }

            const data = await res.json();
            
            const newSearchResults = {tracks: data.tracks, albums: [], artists: []};
            const newPinnedResults = {albums: [], artists: []};
            
            for (const album of data.albums) {
                if (album.name.toLowerCase() === query.toLowerCase()) {
                    newPinnedResults.albums.push(album);
                } else {
                    newSearchResults.albums.push(album);
                }
            }
            for (const artist of data.artists) {
                if (artist.name.toLowerCase() === query.toLowerCase()) {
                    newPinnedResults.artists.push(artist);
                } else {
                    newSearchResults.artists.push(artist);
                }
            }

            setSearchResults(newSearchResults);
            setSearchPinnedResults(newPinnedResults);
            setSearchQuery(query);

        } catch (error) {
            console.error("Failed to search tracks:", error);
        }
    }
    const setSelectedArtistFromId = (artistId) => {
        fetch(`${API_BASE_URL}/api/spotify/artist?artistId=${artistId}`, {
            credentials: 'include',
        }).then(res => {
            if (res.status !== 200) {
                console.log("Could not fetch artist.");
                return null;
            }
            return res.json();
        }).then(artistData => {
            setSelectedArtist(artistData);
        }).catch(err => console.error("Failed to fetch artist:", err));
    }

    const setViewItem = (item, type) => {
        viewItemHistoryRef.current = [...viewItemHistoryRef.current, { item, type }];
        setSelectedTrackContainer(null);
        setSelectedArtist(null);
        if (type === 'container') {
            setSelectedTrackContainer(item);
        } else if (type === 'artist') {
            setSelectedArtist(item);
        }
    }
    const goBackInViewHistory = () => {
        setSelectedTrackContainer(null);
        setSelectedArtist(null);
        if (viewItemHistoryRef.current.length === 0) {
            return;
        }
        viewItemHistoryRef.current.pop();
        if (viewItemHistoryRef.current.length === 0) {
            return; 
        }
        const previousItem = viewItemHistoryRef.current[viewItemHistoryRef.current.length - 1];
        if (previousItem.type === 'container') {
            setSelectedTrackContainer(previousItem.item);
        } else if (previousItem.type === 'artist') {
            setSelectedArtist(previousItem.item);
        }
    }
    const clearViewItems = () => {
        viewItemHistoryRef.current = [];
        setSelectedTrackContainer(null);
        setSelectedArtist(null);
    }

    return (
        <UserContext.Provider value={{ 
            searchResults,
            searchQuery, searchForResults,
            searchPinnedResults,
            userPlaylists, refreshUserQueue,
            selectedTrackContainer,
            selectedArtist,
            selectedArtistAlbums,
            queue, addToQueue, removeFromQueue,
            setSelectedArtistFromId,
            goBackInViewHistory,
            setViewItem, clearViewItems,
            fetchingArtistAlbums
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);