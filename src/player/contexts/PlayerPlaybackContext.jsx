import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { usePlayer } from "./PlayerContext";

export const PlayerPlaybackDataContext = createContext();
export const PlayerPlaybackActionsContext = createContext();

export const PlayerPlaybackProvider = ({ children, isPlayer }) => {

    if (!isPlayer) {
        return <>{children}</>;
    }

    const { currentTrack } = usePlayer();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progressMs, setProgressMs] = useState(0);

    const [joinPassword, setJoinPassword] = useState('1462');

    useEffect(() => {
        if (!isPlayer || !isPlaying) return;

        const interval = setInterval(() => {
            setProgressMs(prev => {
                if (currentTrack?.durationMs && prev >= currentTrack.durationMs) {
                    return currentTrack.durationMs;
                }
                return prev + 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlayer, isPlaying, currentTrack?.durationMs]);

    const progressPercent = currentTrack?.durationMs > 0 ? (progressMs / currentTrack.durationMs) * 100 : 0;


    const actions = useMemo(() => ({ setProgressMs, setIsPlaying }), []);

    return (
        <PlayerPlaybackActionsContext.Provider value={actions}>
            <PlayerPlaybackDataContext.Provider value={{ progressMs, progressPercent, isPlaying, joinPassword }}>
                    {children}
            </PlayerPlaybackDataContext.Provider>
        </PlayerPlaybackActionsContext.Provider>
    );
};

export const usePlayerPlaybackData = () => useContext(PlayerPlaybackDataContext);
export const usePlayerPlaybackActions = () => useContext(PlayerPlaybackActionsContext);