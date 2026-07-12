import { useEffect, useState, useRef, use } from 'react';
import { useAuth } from '../../global/contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePlayerPlaybackActions } from '../contexts/PlayerPlaybackContext';
import { usePlayerPlaybackData } from '../contexts/PlayerPlaybackContext';
import { requestWakeLock, releaseWakeLock } from '../../global/wakeLock.js';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SpotifySDKContainer = ({ setClickedSomething }) => {
    const { spotifyUserToken, refreshSpotifyToken } = useAuth();
    const tokenRef = useRef(spotifyUserToken);

    const { setCurrentTrack } = usePlayer();
    const { setProgressMs, setIsPlaying, setVolume } = usePlayerPlaybackActions();
    
    const { volume } = usePlayerPlaybackData();
    const volumeRef = useRef(volume);

    const playerInstance = useRef(null);
    const isPlayerReady = useRef(false); // player on backend is ready and can accept playNext requests
    const currentDeviceId = useRef(null);
    
    const playerState = useRef('waitingForNewTrack'); // to prevent multiple playNext requests when song ends
    
    const lastTrackId = useRef(null);
    const cleanupMade = useRef(false);

    // update volume
    useEffect(() => {
        volumeRef.current = volume;
        if (playerInstance.current) {
            playerInstance.current.setVolume(volume);
        }
    }, [volume]);

    // set wake lock when player is playing
    useEffect(() => {
        requestWakeLock();

        return () => {
            releaseWakeLock();
        }
    }, []);

    // browser player methods
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
            volume: volumeRef.current
        });

        const p = playerInstance.current;

        p.addListener('ready', handleReady);
        p.addListener('player_state_changed', handlePlayerStateChanged);

        p.connect();

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', cleanupPlayer);
    };
    const clearPlayer = () => {
        console.log("Fully clearing Spotify player...");

        window.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', cleanupPlayer);

        if (playerInstance.current) {
            try {
                playerInstance.current.removeListener('ready', handleReady);
                playerInstance.current.removeListener('player_state_changed', handlePlayerStateChanged);
                playerInstance.current.disconnect();
            } catch (err) {
                console.error("Error while disconnecting Spotify player:", err);
            }

            playerInstance.current = null;
        }

        if (window.onSpotifyWebPlaybackSDKReady) {
            window.onSpotifyWebPlaybackSDKReady = null;
        }

        const script = document.getElementById('spotify-sdk');
        if (script) {
            script.remove();
        }

        document.querySelectorAll('iframe[src*="https://sdk.scdn.co/embedded/index.html"]').forEach(iframe => iframe.remove());

        currentDeviceId.current = null;
        isPlayerReady.current = false;
        lastTrackId.current = null;
        playerState.current = 'waitingForNewTrack';
        cleanupMade.current = false;
    };

    // SDK listeners
    const handleReady = ({ device_id }) => {
        currentDeviceId.current = device_id;
        console.log('Spotify Player is ready with device ID:', device_id);
        console.log('Setting initial volume to:', volumeRef.current);
        playerInstance.current.setVolume(volumeRef.current);
        setupPlayer(device_id);
    };
    const handlePlayerStateChanged = async (state) => {
        if (!state) return;

        const currentTrack = state.track_window.current_track;
        const { paused, position, duration } = state;

        // update contexts
        setIsPlaying(!paused);
        // if track changed, update track info in context
        if (currentTrack.id !== lastTrackId.current) {
            if (currentTrack.id !== '4jaXxB0DJ6X4PdjMK8XVfu') { // filter out one second of silence track that I insert on force to skip
                setCurrentTrack({
                    title: currentTrack.name,
                    artists: currentTrack.artists,
                    albumCover: currentTrack.album.images[0]?.url,
                    durationMs: duration
                });
            } else {
                setCurrentTrack(null);
            }
            lastTrackId.current = currentTrack.id;
            return;
        } else {
            // if song wasn't changed, just update progress
            setProgressMs(position);
            if (playerState.current === 'waitingForNewTrack' && position > 0) {
                playerState.current = 'playing';
            }
        }

        // check if song ended
        if (playerState.current === 'playing' && (paused && position === 0)) {
            console.log("Song ended");
            playerState.current = 'waitingForNewTrack';
            await handleSongEndedOnBackend();
            return;
        }
    }

    // backend player methods
    const setupPlayer = (deviceId) => {
        console.log("Setting up player on backend");
        fetch(`${API_BASE_URL}/api/player/setup`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId })
            }).then(res => {
                if (!res.ok) {
                    throw new Error(`Player setup failed with status ${res.status}`);
                }
            }).then(() => {
                isPlayerReady.current = true;
                cleanupMade.current = false; // reset cleanup flag on new setup
                handleSongEndedOnBackend(); // request next track on setup
            }).catch(err => {
                console.error("Error during player setup:", err);
            });
    };
    const cleanupPlayer = () => {
        if (cleanupMade.current) return; // cleanup already done, skip
        if (!currentDeviceId.current) return; // no player/device to clean up

        console.log("Cleaning up player...");

        isPlayerReady.current = false;
        fetch(`${API_BASE_URL}/api/player/cleanup`, {
            method: 'POST',
            credentials: 'include',
            keepalive: true,
        }).then(res => {
            if (!res.ok) {
                throw new Error(`Player cleanup failed with status ${res.status}`);
            } else {
                cleanupMade.current = true;
            }
        }).catch(err => {
            console.error("Error during player cleanup:", err);
        });
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

    // event handlers
    const handleVisibilityChange = () => {
        if (!playerInstance.current) return;
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (document.visibilityState === 'hidden' && isMobile) {
            console.log("Non-desktop environment hidden - cleaning up player...");
            cleanupPlayer();
            playerInstance.current.disconnect();
            setCurrentTrack(null);
            setIsPlaying(false);
            setProgressMs(0);
        } else if (document.visibilityState === 'visible' && isMobile) {
            console.log("Non-desktop environment visible - reinitializing player...");
            playerInstance.current.connect();
            requestWakeLock();
        }
    };

    // initialize player except when token is only being refreshed
    useEffect(() => {
        if (!spotifyUserToken) return;
        if (playerInstance.current) return;

        createPlayer();

        return () => {
            clearPlayer();
        };
    }, [spotifyUserToken !== null]);

    // remap spotify token to ref to avoid issues with stale closures in player event handlers
    useEffect(() => {
        console.log("Spotify token updated, refreshing token ref");
        tokenRef.current = spotifyUserToken;
    }, [spotifyUserToken]);

    return null;
};

export default SpotifySDKContainer;