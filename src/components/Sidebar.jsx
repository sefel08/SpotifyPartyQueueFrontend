import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Sidebar.module.css';
import UserProfile from './UserProfile';

const Sidebar = ({ onPlaylistSelect, onGoBack }) => {
  const { authorized, user, login } = useAuth();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!authorized) {
      setPlaylists([]);
      return;
    }
    fetch('http://127.0.0.1:8080/api/spotify/user-playlists', {
      credentials: 'include',
    })
      .then(res => {
        if (res.status != 200) {
          console.log("Could not fetch playlists.");
          return [];
        }
        return res.json();
      })
      .then(data => {
        setPlaylists(data);
      })
      .catch(err => console.error("Błąd", err));
  }, [authorized]);

  return (
    <div className={styles.sidebarContainer}>
      
      <UserProfile user={user} authorized={authorized} login={login} />

      {/* playlist cards */}
      <div className={styles.grid}>
        {playlists.map(playlist => (
          <div 
            key={playlist.id} 
            className={styles.playlistCard} 
            onClick={() => onPlaylistSelect(playlist)}
          >
            <img 
              src={playlist.imageUrl} 
              alt={playlist.name} 
              className={styles.image} 
            />

            <div className={styles.textContainer}>
              <p className={styles.name}>{playlist.name}</p>
              <p className={styles.tracksCount}>{playlist.totalTracks} utworów</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.backButton} onClick={onGoBack}>
          ← Zmień widok
        </button>
      </div>

    </div>
  );
};

export default Sidebar;