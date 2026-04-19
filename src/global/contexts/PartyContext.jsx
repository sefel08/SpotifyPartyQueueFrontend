import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export const PartyContext = createContext();

export const PartyProvider = ({ children, changeView }) => {
    
    const { user } = useAuth();

    const [partyId, setPartyId] = useState('');
    const [joinPassword, setJoinPassword] = useState('1462');

    const createPartySessionAndJoin = () => {
        createPartySession().then(partyId => {
            joinPartySession(partyId);
        });
    };
    const createPartySession = () => {
        return fetch('http://127.0.0.1:8080/api/party', {
            method: 'POST',
            credentials: 'include',
        })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to create party session");
            return res.text(); 
        })
        .then((partyId) => {
            setPartyId(partyId);
            changeView('party');
            return partyId;
        })
        .catch((err) => {
            console.error("Failed to create party session:", err);
        });
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
    const getPartyQueue = () => {
        return fetch(`http://127.0.0.1:8080/api/party/partyQueue`, {
            method: 'GET',
            credentials: 'include'
        }).then( (res) => {
            if (res.ok) return res.json();
            return [];
        }).catch( err => {
            console.error("Failed to get party queue:", err) 
            return [];
        });
    };
    const getPartyUsers = () => {
        return fetch(`http://127.0.0.1:8080/api/party/users`, {
            method: 'GET',
            credentials: `include`
        }).then( (res) => {
            if (res.ok) return res.json();
            return [];
        }).catch( err => {
            console.error("Failed to get party users:", err) 
            return [];
        });
    }

    return (
        <PartyContext.Provider value={{ partyId, createPartySession, joinPartySession, createPartySessionAndJoin, getPartyQueue, getPartyUsers }}>
            {children}
        </PartyContext.Provider>
    );
};

export const useParty = () => {
    return useContext(PartyContext);
}