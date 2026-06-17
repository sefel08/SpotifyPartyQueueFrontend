import React, { useState, useEffect } from 'react';
import styles from './NewPlayerView.module.css';

import { useAuth } from '../../global/contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePlayerPlaybackData } from '../contexts/PlayerPlaybackContext';
import { useParty } from '../../global/contexts/PartyContext';

import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

import spotify_logo from '../../assets/spotify_full_icon_green.png';
import album_placeholder from '../../assets/music_album_icon.svg';
import options_icon from '../../assets/options_icon.svg';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const NewPlayerView = () => {
    
    const { loadingAuth } = useAuth();
    const { currentTrack } = usePlayer();
    const { progressMs, progressPercent, joinPassword } = usePlayerPlaybackData();
    const { partyId } = useParty();

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    const [qrDataUrl, setQrDataUrl] = useState('');
    useEffect(() => {
    if (!partyId) return;
        QRCode.toDataURL(`${FRONTEND_URL}?partyId=${partyId}`, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 256
        })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Error while generating QR code:', err));
    }, [partyId]);

    const [showQR, setShowQR] = useState(false);

    if (loadingAuth) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    return (
        <div className={styles.mainContainer}>
            <section className={styles.topSection}>
                <img src={spotify_logo} alt="Spotify Logo" className={styles.spotifyLogo} />
                <AnimatePresence mode="popLayout">
                    {!showQR ? (
                    <motion.button
                        key="qr-button"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={() => setShowQR(true)}
                        className={styles.showQRButton}
                    >
                        Show QR Code
                    </motion.button>
                    ) : (
                    <motion.div
                        key="qr-modal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.1 }}
                        className={styles.qrModal}
                    >
                        <img src={qrDataUrl} alt="QR Code" className={styles.qrCode} />
                        <p className={styles.modalHeader}>Party ID</p>
                        <p className={styles.modalText}>{partyId}</p>
                        <p className={styles.modalHeader}>Join Password</p>
                        <p className={styles.modalText}>{joinPassword}</p>
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setShowQR(false)}
                        className={styles.showQRButton}
                        style={{ marginTop: '20px' }}
                        >
                        Hide QR Code
                        </motion.button>
                    </motion.div>
                    )}
                </AnimatePresence>
            </section>
            <section className={styles.middleSection}>
                <img src={currentTrack ? currentTrack.albumCover || album_placeholder : album_placeholder}
                     alt="Album Cover"
                     className={styles.albumImage}
                     style={currentTrack ? { boxShadow: '0 0 150px rgba(255, 255, 255, 0.3)' } : {}}
                />
                <div className={styles.trackInfo}>
                    <h2 className={styles.trackTitle}>{currentTrack ? currentTrack.title : 'No Track Playing'}</h2>
                    <p className={styles.trackArtist}>{currentTrack ? currentTrack.artists.map(artist => artist.name).join(', ') : 'Unknown Artist'}</p>
                </div>
                <div className={styles.progressBar} >
                    <span className={styles.timeLabel}>{formatTime(currentTrack ? (progressMs <= currentTrack.durationMs ? progressMs : currentTrack.durationMs) : 0)}</span>
                    <div className={styles.progressBarBg}>
                        <div 
                            className={styles.progressBarFill}
                            style={{ width: `${progressPercent}%` }}>
                        </div>
                    </div>
                    <span className={styles.timeLabel}>{formatTime(currentTrack ? currentTrack.durationMs : 0)}</span>
                </div>
            </section>
            <section className={styles.bottomSection}>
                <img 
                    className={styles.showOptionsButton}
                    src={options_icon} alt="Options" 
                />
            </section>
        </div>
    );
}


export default NewPlayerView;