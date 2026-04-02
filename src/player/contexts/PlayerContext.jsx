import { createContext, useContext, useEffect, useState } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {

    return (
        <PlayerContext.Provider value={{  }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => useContext(PlayerContext);