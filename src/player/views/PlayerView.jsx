import React, { useState, useEffect } from 'react';
import { useAuth } from '../../global/contexts/AuthContext';

const PlayerView = () => {
  const { authorized, loading, login, user } = useAuth();
  const [partyId, setPartyId] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!authorized) login();
    else if (!partyId) {
      fetch('http://127.0.0.1:8080/api/party/create', { method: 'POST', credentials: 'include'})
        .then(response => {
          if (!response.ok) {
            throw new Error('Serwer zwrócił błąd: ' + response.status);
          }
        })
        .then(setPartyId(user.spotifyId));
    }
  }, [authorized, loading]);

  if (!authorized) {
    return <div>Przekierowywanie do logowania...</div>;
  }

  return (
    <div>
      <h1>Player View</h1>
      <h2>Created Party with Id: {partyId}</h2>
    </div>
  );
};

export default PlayerView;