import React, { useState, useEffect } from 'react';
import styles from './PlayerView.module.css';
import { useAuth } from '../../global/contexts/AuthContext';
import image from '../../assets/spotify_icon.png';
import Navbar from '../../global/components/Navbar/Navbar';

const PlayerView = () => {
  const { authorized, loading, login, user } = useAuth();
  const [partyId, setPartyId] = useState(null);

  // --- MOCKOWE DANE (Do zastąpienia logiką z backendu/Spotify API) ---
  const [currentTrack, setCurrentTrack] = useState({
      title: "Blinding Lights",
      artist: "The Weeknd",
      albumCover: "https://i.scdn.co/image/ab67616d00001e02a0bddede36c718a8f58b33ae",
      durationMs: 200000, // 3:20
  });
  const [progressMs, setProgressMs] = useState(34000);

  const [partyCode, setPartyCode] = useState("ROCK-WAVE-99");
  const [joinPassword, setJoinPassword] = useState('1462');

  const progressPercent = (progressMs / currentTrack.durationMs) * 100;

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // useEffect(() => {
  //   if (loading) return;
  //   if (!authorized) login();
  //   else if (!partyId) {
  //     fetch('http://127.0.0.1:8080/api/party/create', { method: 'POST', credentials: 'include'})
  //       .then(response => {
  //         if (!response.ok) {
  //           throw new Error('Serwer zwrócił błąd: ' + response.status);
  //         }
  //       })
  //       .then(setPartyId(user.spotifyId));
  //   }
  // }, [authorized, loading]);

  // if (!authorized) {
  //   return <div>Przekierowywanie do logowania...</div>;
  // }

  return (
    <div className={styles.playerViewContainer}>
      
      {/* JOIN BOX */}
      <div className={styles.joinPanel}>
        <div className={styles.qrContainer}>
          <img src={image} alt="QR Code" className={styles.qrImage} />
        </div>
        
        <div className={styles.textCodes}>
          <div className={styles.codeGroup}>
            <p className={styles.codeLabel}>KOD IMPREZY</p>
            <p className={styles.partyCode}>{partyCode}</p>
          </div>
          
          <div className={styles.codeGroup}>
            <p className={styles.codeLabel}>HASŁO (PIN)</p>
            <p className={styles.joinPassword}>{joinPassword}</p>
          </div>
        </div>
      </div>

      {/* MAIN PLAYER */}
      <div className={styles.centralPlayer}>
        
        <img 
          src={currentTrack.albumCover} 
          alt="Album Cover" 
          className={styles.albumCover} 
        />

        <div className={styles.trackInfo}>
          <h1 className={styles.trackTitle}>{currentTrack.title}</h1>
          <h2 className={styles.trackArtist}>{currentTrack.artist}</h2>
        </div>

        <div className={styles.playbackBar}>
          <span className={styles.timeLabel}>{formatTime(progressMs)}</span>
          
          <div className={styles.progressBarBg}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          <span className={styles.timeLabel}>{formatTime(currentTrack.durationMs)}</span>
        </div>

      </div>

      {/* NAV PANEL */}
      {true ? (
        <Navbar tabs={['Kolejka', 'Widok użytkownika']} />
      ) : null }

    </div>
  );
};

export default PlayerView;