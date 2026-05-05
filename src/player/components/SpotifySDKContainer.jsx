import { useEffect, useState, useRef, use } from 'react';
import { useAuth } from '../../global/contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePlayerPlaybackActions } from '../contexts/PlayerPlaybackContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SpotifySDKContainer = ({ setClickedSomething }) => {
    const { spotifyUserToken, refreshSpotifyToken } = useAuth();
    const tokenRef = useRef(spotifyUserToken);

    const { setCurrentTrack } = usePlayer();
    const { setProgressMs, setIsPlaying } = usePlayerPlaybackActions();

    const playerInstance = useRef(null);
    const isPlayerReady = useRef(false);
    const currentDeviceId = useRef(null);
    const isFetchingNext = useRef(false);
    const lastTrackId = useRef(null);

    const createPlayer = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            initPlayer();
        };

        if (!document.getElementById('spotify-sdk')) {
            const script = document.createElement("script");
            script.id = 'spotify-sdk';
            script.src = "https://sdk.scdn.co/spotify-player.js";
            script.async = true;
            document.body.appendChild(script);
        }
    };
    const initPlayer = () => {
        console.log("Spotify player initializing...");

        playerInstance.current = new window.Spotify.Player({
            name: 'Party Player for Spotify',
            getOAuthToken: cb => { cb(tokenRef.current); },
            volume: 0.2
        });

        const p = playerInstance.current;
        p.addListener('ready', ({ device_id }) => {
            console.log('Player ready with ID:', device_id);
            currentDeviceId.current = device_id;
            
            fetch(`${API_BASE_URL}/api/player/setup`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId: device_id })
            }).then(() => {
                isPlayerReady.current = true;
                setTimeout(handleSongEndedOnBackend, 500);
            });
        });
        p.addListener('player_state_changed', state => {
            if (!state) return;

            const currentTrack = state.track_window.current_track;
            const { paused, position, duration } = state;

            // update contexts
            setIsPlaying(!paused);

            if (currentTrack.id !== lastTrackId.current) {
                // update track info in context
                setCurrentTrack({
                    title: currentTrack.name,
                    artists: currentTrack.artists,
                    albumCover: currentTrack.album.images[0]?.url,
                    durationMs: duration
                });
                
                lastTrackId.current = currentTrack.id;
                
                setTimeout(() => {
                    isFetchingNext.current = false;
                }, 3000);

                return;
            }
            if (paused && position === 0 && duration > 0 && !isFetchingNext.current) {
                console.log("Song ended");
                isFetchingNext.current = true;
                handleSongEndedOnBackend();
                return;
            }

            // if song wasn't changed, just update progress
            setProgressMs(position);
        });

        p.connect();

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleCleanup);
    };
    const handleCleanup = () => {
        if (!currentDeviceId.current) return;
        console.log("Non-desktop environment hidden - cleaning up player...");
        isPlayerReady.current = false;
        fetch(`${API_BASE_URL}/api/player/cleanup`, {
            method: 'POST',
            credentials: 'include',
            keepalive: true,
        });
    };
    // TODO fix this
    const handleVisibilityChange = () => {
        return;
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (document.visibilityState === 'hidden' && isMobile) {
            handleCleanup();
            playerInstance.current?.disconnect();
            setClickedSomething(false);
        }
    };
    const handleSongEndedOnBackend = async () => {
        if (!isPlayerReady.current) return;
        console.log("Requesting next track from backend...");
        fetch(`${API_BASE_URL}/api/player/playNext`, {
            method: 'POST',
            credentials: 'include',
        }).then( (res) => {
            if (!res.ok) {
                throw new Error(`Server responded with status ${res.status} on playNext request`);
                return null;
            }
            return res.json()
        }).then(data => {
            if (!data.played)   
                setCurrentTrack(null);
        }).catch(err => {
            console.error("Error fetching next track:", err);
        });
    };

    // remap spotify token to ref to avoid issues with stale closures in player event handlers
    useEffect(() => {
        tokenRef.current = spotifyUserToken;
    }, [spotifyUserToken]);

    // refresh token
    useEffect(() => {
        if (!spotifyUserToken) {
            refreshSpotifyToken();
            return;
        }

        const REFRESH_INTERVAL = 45 * 60 * 1000; // 45 minutes
        const refreshTimer = setTimeout(() => {
            refreshSpotifyToken();
        }, REFRESH_INTERVAL);

        return () => clearTimeout(refreshTimer);
    }, [spotifyUserToken]);

    // initialize player except when token is only being refreshed
    useEffect(() => {
        if (!spotifyUserToken) return;
        if (playerInstance.current) return;

        if (window.Spotify) {
            initPlayer();
        } else {
            createPlayer();
        }

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleCleanup);
            
            if (playerInstance.current) {
                playerInstance.current.disconnect();
                playerInstance.current = null;
            }
        };
    }, [spotifyUserToken !== null]);


    return null;
};

export default SpotifySDKContainer;