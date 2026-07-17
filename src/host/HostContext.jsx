import { createContext, useContext, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const HostContext = createContext();

export const HostProvider = ({ children }) => {

    const [fetchingHostData, setFetchingHostData] = useState(false);
    const [partyUsers, setPartyUsers] = useState([]);

    const fetchPartyUsers = async () => {
        await setFetchingHostData(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/party/host/users`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            setPartyUsers(data);
        } catch (error) {
            console.error('Error fetching party users:', error);
        } finally {
            setFetchingHostData(false);
        }
    };
    const removePartyUser = (userId) => {
        fetch(`${API_BASE_URL}/api/party/host/users`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Failed to remove party user');
            } else {
                fetchPartyUsers(); // Refresh the list of party users after removal
            }
        }).catch((error) => {
            console.error('Error removing party user:', error);
        });
    };
    const skipTrack = () => {
        fetch(`${API_BASE_URL}/api/party/host/skip`, {
            method: 'POST',
            credentials: 'include',
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Failed to skip track');
            }
            return response.json();
        }).then((data) => {
            console.log(data.message); // Log the success message from the server
        }).catch((error) => {
            console.error('Error skipping track:', error);
        });
    };

    return (
        <HostContext.Provider value={{ fetchingHostData, partyUsers, fetchPartyUsers, removePartyUser, skipTrack }}>
            {children}
        </HostContext.Provider>
    );
}

export const useHost = () => {
    const context = useContext(HostContext);
    if (!context) {
        throw new Error('useHost must be used within a HostProvider');
    }
    return context;
};