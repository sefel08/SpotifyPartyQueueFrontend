import React, { useState, useEffect } from 'react';
import styles from './PlayerView.module.css';
import { useAuth } from '../../global/contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { useParty } from '../../global/contexts/PartyContext';
import image from '../../assets/Wlaz_Normal.png';
import Navbar from '../../global/components/Navbar/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const PlayerView = () => {
  const { loadingAuth } = useAuth();
  const { currentTrack, progressMs, progressPercent } = usePlayer();
  const { partyId, joinPassword } = useParty();

  const [joinPanelVisible, setJoinPanelVisible] = useState(true);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loadingAuth) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className={styles.playerViewContainer}>
      
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
                <img src={image} alt="QR Code" className={styles.qrImage} />
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

    </div>
  );
};

export default PlayerView;