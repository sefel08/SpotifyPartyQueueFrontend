import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../global/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SpotifySDKContainer = () => {
    const { spotifyUserToken } = useAuth();

    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const playerInstance = useRef(null);
    const currentDeviceId = useRef(null);
    const isFetchingNext = useRef(false);
    const lastTrackId = useRef(null);

    const handleSongEndedOnBackend = async () => {
        console.log("Wysyłam prośbę o następny utwór...");
        fetch(`${API_BASE_URL}/api/player/playNext`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId: currentDeviceId.current, newTrackId: lastTrackId.current })
        });
    };

    useEffect(() => {
        if (!spotifyUserToken) return;

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = spotifyUserToken;
            
            playerInstance.current = new window.Spotify.Player({
                name: 'Party Player for Spotify',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            const p = playerInstance.current;

            p.addListener('ready', ({ device_id }) => {
                console.log('Player ready with ID:', device_id);
                currentDeviceId.current = device_id;
                setIsPlayerReady(true);
                
                fetch(`${API_BASE_URL}/api/player/setup`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        deviceId: device_id, 
                        playlistUri: "spotify:playlist:5lgUkd77vPhJaWQiE194XQ" 
                    })
                });
            });

            p.addListener('player_state_changed', state => {
                if (!state) return;

                const currentTrack = state.track_window.current_track;
                const { paused, position, duration } = state;

                if (currentTrack.id !== lastTrackId.current) {
                    lastTrackId.current = currentTrack.id;
                    
                    setTimeout(() => {
                        isFetchingNext.current = false;
                    }, 3000);

                    return;
                }

                if (paused && position === 0 && duration > 0 && !isFetchingNext.current) {
                    
                    console.log("Wykryto koniec piosenki (player zapauzowany na pozycji 0).");
                    
                    isFetchingNext.current = true;
                    handleSongEndedOnBackend();
                }
            });

            p.connect().then(success => {
                if (success) console.log("The Web Playback SDK successfully connected to Spotify!");
            });
        };

        return () => {
            if (playerInstance.current) {
                playerInstance.current.disconnect();
            }
            script.remove();
            window.onSpotifyWebPlaybackSDKReady = undefined;
        };
    }, [spotifyUserToken]);

    return null;
};

export default SpotifySDKContainer;