import { createContext, useContext, useEffect, useState } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {

    const [currentTrack, setCurrentTrack] = useState({
        title: "Blinding Lights",
        artist: "The Weeknd, Mata, Gverilla, Beteo, Kuba Knap",
        albumCover: "https://i.scdn.co/image/ab67616d00001e02a0bddede36c718a8f58b33ae",
        durationMs: 200000, // 3:20
    });
    const [progressMs, setProgressMs] = useState(34000);
    const progressPercent = (progressMs / currentTrack.durationMs) * 100;

    return (
        <PlayerContext.Provider value={{ currentTrack, progressMs, progressPercent }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);