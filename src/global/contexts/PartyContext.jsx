import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Client } from '@stomp/stompjs';
import { partyStore } from '../stores/partyStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const PartyContext = createContext();

export const PartyProvider = ({ children }) => {
    
    const { user, loadingAuth } = useAuth();

    const [loadingParty, setLoadingParty] = useState(true);

    const [partyId, setPartyId] = useState('');
    const [joinPassword, setJoinPassword] = useState('1462');
    const [isHost, setIsHost] = useState(false);

    const [votedToSkip, setVotedToSkip] = useState(false);

    useEffect(() => {
        if (loadingAuth) return;
        updateStatus();
    }, [loadingAuth]);

    useEffect(() => {
        if (!partyId) return;

        const client = new Client({
            brokerURL: 'ws://127.0.0.1:8080/ws-party',
            credentials: 'include',
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Connected to Party WebSocket');

            client.subscribe(`/party/${partyId}`, (message) => {
                const event = JSON.parse(message.body);
                
                switch (event) {
                    case 'PARTY_QUEUE_CHANGED':
                        partyStore.notify('partyQueue');
                        break;
                    case 'PARTY_USERS_CHANGED':
                        partyStore.notify('partyUsers');
                        break;
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
        };

        client.activate();

        return () => {
            if (client.active) {
                client.deactivate();
                console.log('Disconnected from Party WebSocket');
            }
        };

    }, [partyId]);

    const updateStatus = () => {
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
        }).finally(() => setLoadingParty(false)
        ).catch( err => {
            console.error("Failed to fetch party status:", err);
        });
    };

    const createPartySessionAndJoin = (partySettings) => {
        createPartySession(partySettings).then(partyId => {
            joinPartySession(partyId);
        });
    };
    const createPartySession = (partySettings) => {
        return fetch(`${API_BASE_URL}/api/party`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(partySettings)
        })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to create party session");
            return res.text(); 
        })
        .then((partyId) => {
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
            if (!res.ok) throw new Error("Failed to join party session");
        }).then( () => {
            updateStatus();
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
    const voteToSkip = () => {
        fetch(`${API_BASE_URL}/api/party/skip`, {
            method: 'POST',
            credentials: 'include'
        }).then( (res) => {
            if (!res.ok) throw new Error("Failed to vote to skip");
            return res.json();
        }).then( (data) => {
            if (data === true)
                setVotedToSkip(true);
        }).catch( err => {
            console.error("Failed to vote to skip, error occurred:", err);
        });
    };
    const cancelSkipVote = () => {
        fetch(`${API_BASE_URL}/api/party/skip`, {
            method: 'DELETE',
            credentials: 'include'
        }).then( (res) => {
            if (!res.ok) throw new Error("Failed to cancel skip vote");
            return res.json();
        }).then((data) => {
            if (data === true)
                setVotedToSkip(false);
        }).catch( err => {
            console.error("Failed to cancel skip vote, error occurred:", err);
        });
    };

    return (
        <PartyContext.Provider value={{ loadingParty, partyId, joinPartySession, createPartySessionAndJoin, getPartyQueue, getPartyUsers, voteToSkip, cancelSkipVote, votedToSkip }}>
            {children}
        </PartyContext.Provider>
    );
};

export const useParty = () => {
    return useContext(PartyContext);
}