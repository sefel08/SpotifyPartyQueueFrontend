import { useEffect, useState } from 'react';

import { useAuth } from '../../global/contexts/AuthContext';

const SpotifySDKContainer = () => {

    const { spotifyUserToken } = useAuth();

    const [player, setPlayer] = useState(undefined);

    useEffect(() => {
        if (!spotifyUserToken) return;

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
        const token = spotifyUserToken;
        const newPlayer = new window.Spotify.Player({
            name: 'Party Player for Spotify',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });

        setPlayer(newPlayer);

        newPlayer.addListener('ready', ({ device_id }) => {
            console.log('Gotowy do grania na ID:', device_id);
            
            //test
            fetch(`http://127.0.0.1:8080/api/player`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ deviceId: device_id })
            });
        });

        newPlayer.connect();
        };

        return () => {
        if (player) player.disconnect();
        };
    }, [spotifyUserToken]);

    return null;
};

export default SpotifySDKContainer;