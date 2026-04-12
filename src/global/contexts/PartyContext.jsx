import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export const PartyContext = createContext();

export const PartyProvider = ({ children, changeView }) => {
    
    const { user } = useAuth();

    const [partyId, setPartyId] = useState('');
    const [joinPassword, setJoinPassword] = useState('1462');

    const createPartySessionAndJoin = () => {
        createPartySession().then(() => {
            joinPartySession(user.spotifyId);
        });
    };
    const createPartySession = () => {
        return fetch('http://127.0.0.1:8080/api/party/create', {
            method: 'POST',
            credentials: 'include',
        })
        .then( (res) => {
            if (res.ok) {
                setPartyId(user.spotifyId);
                changeView('party');
            }
        })
        .catch( err => console.error("Failed to create party session:", err) );
    };
    const joinPartySession = (partyId) => {
        fetch(`http://127.0.0.1:8080/api/party/join?partyId=${partyId}`, {
            method: 'POST',
            credentials: 'include',
        })
        .then( (res) => {
            if (res.ok) {
                setPartyId(partyId);
                changeView('user');
            }
        })
        .catch( err => console.error("Failed to join party session:", err) );
    };

    return (
        <PartyContext.Provider value={{ partyId, createPartySession, joinPartySession, createPartySessionAndJoin }}>
            {children}
        </PartyContext.Provider>
    );
};

export const useParty = () => useContext(PartyContext);