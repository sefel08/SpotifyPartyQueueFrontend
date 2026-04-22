import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const PartyContext = createContext();

export const PartyProvider = ({ children, changeView }) => {
    
    const { user, loadingAuth } = useAuth();

    const [partyId, setPartyId] = useState('');
    const [joinPassword, setJoinPassword] = useState('1462');
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        if (loadingAuth) return;

        // fetch party status for current user
        fetch(`${API_BASE_URL}/api/party/status`, {
            method: 'GET',
            credentials: 'include',
            redirect: 'manual'
        }).then( (res) => {
            if (res.ok) return res.json();
        }).then( (data) => {
            if (!data) return;
            if (data.inParty) {
                setPartyId(data.partyId);
                setIsHost(data.isHost);
            }
        }).catch( err => {
            console.error("Failed to fetch party status:", err);
        });

    }, [loadingAuth]);

    const createPartySessionAndJoin = () => {
        createPartySession().then(partyId => {
            joinPartySession(partyId);
        });
    };
    const createPartySession = () => {
        return fetch(`${API_BASE_URL}/api/party`, {
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
        fetch(`${API_BASE_URL}/api/party/join?partyId=${partyId}`, {
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
        return fetch(`${API_BASE_URL}/api/party/partyQueue`, {
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
        return fetch(`${API_BASE_URL}/api/party/users`, {
            method: 'GET',
            credentials: 'include'
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