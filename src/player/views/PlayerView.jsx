import React, { useState, useEffect } from 'react';
import styles from './PlayerView.module.css';
import { useAuth } from '../../global/contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePlayerPlaybackData } from '../contexts/PlayerPlaybackContext';
import { useParty } from '../../global/contexts/PartyContext';
import Navbar from '../../global/components/Navbar/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import album_placeholder from '../../assets/music_album_icon.svg';
import QRCode from 'qrcode';

const PlayerView = ({ rounded }) => {
  const { loadingAuth } = useAuth();
  const { currentTrack } = usePlayer();
  const { progressMs, progressPercent, joinPassword } = usePlayerPlaybackData();
  const { partyId } = useParty();

  const [joinPanelVisible, setJoinPanelVisible] = useState(false);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    if (!partyId) return;
    QRCode.toDataURL(`127.0.0.1?partyId=${partyId}`, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 256
    })
    .then(url => setQrDataUrl(url))
    .catch(err => console.error('Błąd generowania QR kodu:', err));
  }, [partyId]);


  return (
    <div className={styles.playerViewContainer} style={{borderRadius: rounded ? '0 0 20px 20px' : '0'}}>

      {/* MAIN PLAYER */}
      <div className={styles.centralPlayer}>
        
        <img 
          src={currentTrack ? currentTrack.albumCover || album_placeholder : album_placeholder} 
          alt="Album Cover" 
          className={styles.albumCover} 
        />

        <div className={styles.trackInfo}>
          <h1 className={styles.trackTitle}>{currentTrack ? currentTrack.title : "Brak odtwarzanego utworu"}</h1>
          <h2 className={styles.trackArtist}>
            {currentTrack ? currentTrack.artists.map(artist => artist.name).join(", ") : ""}
          </h2>
        </div>

        <div className={styles.playbackBar}>
          <span className={styles.timeLabel}>{formatTime(progressMs)}</span>
          <div className={styles.progressBarBg}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className={styles.timeLabel}>{formatTime(currentTrack ? currentTrack.durationMs : 0)}</span>
        </div>

      </div>

      {/* JOIN BOX */}
      <motion.div 
        layout
        initial={false}
        animate={{ 
          borderRadius: joinPanelVisible ? "15px" : "30px", 
        }}
        transition={{ 
          type: "tween", 
          ease: "easeInOut", 
          duration: 0.3 
        }}
        className={`${styles.joinPanel} ${!joinPanelVisible ? styles.joinPanelHidden : ''}`}
      >
        <AnimatePresence mode="wait">
          
          {!joinPanelVisible ? (
            // Show Button
            <motion.button
              key="show"
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.showButton}
              onClick={() => setJoinPanelVisible(true)}
            >
              Pokaż kod
            </motion.button>
          ) : (
            // Info panel
            <motion.div
              key="content"
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
            >
              <div className={styles.qrContainer}>
                <img 
                  src={qrDataUrl}
                  alt="QR Code" 
                  className={styles.qrImage}
                />
              </div>
              
              <div className={styles.textCodes}>
                <div className={styles.codeGroup}>
                  <p className={styles.codeLabel}>KOD IMPREZY</p>
                  <p className={styles.partyCode}>{partyId}</p>
                </div>
                <div className={styles.codeGroup}>
                  <p className={styles.codeLabel}>HASŁO (PIN)</p>
                  <p className={styles.joinPassword}>{joinPassword}</p>
                </div>
              </div>

              <button 
                className={styles.hideButton} 
                onClick={() => setJoinPanelVisible(false)}
              >
                Ukryj
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

    </div>
  );
};

export default PlayerView;