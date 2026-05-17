import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Client } from '@stomp/stompjs';
import { partyStore } from '../stores/partyStore';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_URL;

export const PartyContext = createContext();

export const PartyProvider = ({ children }) => {
    
    const { user, loadingAuth, refreshStatus, refreshSpotifyToken } = useAuth();

    const [loadingParty, setLoadingParty] = useState(true);

    const [partyId, setPartyId] = useState('');
    
    const [votedToSkip, setVotedToSkip] = useState(false);
    const [isVotePending, setIsVotePending] = useState(false);

    useEffect(() => {
        if (loadingAuth) return;
        updateStatus();
    }, [loadingAuth]);

    // WebSocket connection for real-time updates
    useEffect(() => {
        if (!partyId) return;

        const client = new Client({
            brokerURL: `${WS_BASE_URL}/ws-party`,
            credentials: 'include',
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('Connected to Party WebSocket');

            client.subscribe(`/party/${partyId}`, (message) => {
                const messageData = JSON.parse(message.body);
                
                switch (messageData.type) {
                    case 'PARTY_QUEUE_CHANGED':
                        partyStore.notify('partyQueue');
                        break;
                    case 'PARTY_USERS_CHANGED':
                        partyStore.notify('partyUsers');
                        break;
                    case 'SKIP_VOTES_CHANGED':
                        const skipVotes = messageData.payload;
                        partyStore.notify('skipVotes', skipVotes);
                        if (skipVotes === 0) {
                            setVotedToSkip(prev => { 
                                if (prev === false) return prev;
                                return false 
                            });
                        }
                        break;
                }
            });

            client.subscribe('/user/messages', (message) => {
                const messageData = JSON.parse(message.body);

                switch (messageData.type) {
                    case 'REFRESH_STATUS':
                        console.log('Received REFRESH_STATUS message, refreshing auth status');
                        window.location.reload();
                        break;
                    case 'REFRESH_TOKEN':
                        console.log('Received REFRESH_TOKEN message, refreshing spotify token');
                        refreshSpotifyToken();
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
        }).then( (res) => {
            if (!res.ok) console.log("Cannot fetch party status. Log in to refresh.");
            else return res.json();
        }).then( (data) => {
            if (!data) return;
            if (data.inParty) {
                setPartyId(data.partyId);
            } else {
                setPartyId('');
            }
        }).catch( err => {
            console.error("Failed to fetch party status:", err);
        }).finally(() => setLoadingParty(false));
    };

    const createPartySessionAndJoin = (partySettings, asUser, asPlayer, asHost) => {
        createPartySession(partySettings).then(partyId => {
            joinPartySession(partyId, asUser, asPlayer, asHost);
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
    const joinPartySession = (partyId, asUser, asPlayer, asHost) => {
        fetch(`${API_BASE_URL}/api/party/join?partyId=${partyId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asParticipant: !!asUser, asPlayer: !!asPlayer, asHost: !!asHost })
        })
        .then( (res) => {
            if (!res.ok) throw new Error("Failed to join party session");
            return res.json();
        }).then( (data) => {
            if (data.success) {
                return;
            } else {
                alert(data.message);
            }
        }).then( () => {
            updateStatus();
            refreshStatus();
        })
        .catch( err => console.error("Failed to join party session:", err) );
    };
    const joinOwnPartySession = (asUser, asPlayer, asHost) => {
        fetch(`${API_BASE_URL}/api/party/joinOwn`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asParticipant: !!asUser, asPlayer: !!asPlayer, asHost: !!asHost })
        })
        .then( (res) => {
            if (!res.ok) throw new Error("Failed to join own party session");
            return res.json();
        }).then( (data) => {
            if (data.success) {
                return;
            } else {
                alert(data.message);
            }
        }).then( () => {
            updateStatus();
            refreshStatus();
        })
        .catch( err => console.error("Failed to join own party session:", err) );
    };
    const leavePartySession = () => {
        fetch(`${API_BASE_URL}/api/party/leave`, {
            method: 'POST',
            credentials: 'include'
        })
        .then( (res) => {
            if (!res.ok) throw new Error("Failed to leave party session");
            return res.json();
        }).then( (data) => {
            if (data.success) {
                return;
            } else {
                alert(data.message);
            }
        }).then( () => {
            updateStatus();
            refreshStatus();
        })
        .catch( err => console.error("Failed to leave party session:", err) );
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
        return fetch(`${API_BASE_URL}/api/party/skip`, {
            method: 'POST',
            credentials: 'include'
        }).then( (res) => {
            if (!res.ok) throw new Error("Failed to vote to skip");
            return res.json();
        })
    };
    const cancelSkipVote = () => {
        return fetch(`${API_BASE_URL}/api/party/skip`, {
            method: 'DELETE',
            credentials: 'include'
        }).then( (res) => {
            if (!res.ok) throw new Error("Failed to cancel skip vote");
            return res.json();
        })
    };
        
    const handleSkip = async () => {
        if (isVotePending) return;

        const previousVoteState = votedToSkip;
        
        // Optimistyic UI update
        setVotedToSkip(!previousVoteState);
        setIsVotePending(true);

        try {
            let result;
            if (previousVoteState) {
                result = await cancelSkipVote();
            } else {
                result = await voteToSkip();
            }

            switch (result) {
                case 1:
                    // successfully voted to skip
                    break;
                case -1:
                    // successfully skipped current track
                    setVotedToSkip(false);
                    break;
                case 0:
                default:
                    // something went wrong, revert the optimistic update
                    setVotedToSkip(previousVoteState);
                    break;
            }
        } catch (error) {
            // On error, revert the optimistic update and log the error
            console.error("Critical error while voting:", error);
            setVotedToSkip(previousVoteState);
        } finally {
            setIsVotePending(false);
        }
    };

    return (
        <PartyContext.Provider value={{ loadingParty, partyId, joinPartySession, createPartySessionAndJoin, getPartyQueue, getPartyUsers, votedToSkip, handleSkip, joinOwnPartySession, leavePartySession }}>
            {children}
        </PartyContext.Provider>
    );
};

export const useParty = () => {
    return useContext(PartyContext);
}