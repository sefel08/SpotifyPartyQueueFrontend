import React, { useState, useEffect } from 'react';
import styles from './NewPlayerView.module.css';

import TrackProgressBar from '../components/TrackProgressBar/TrackProgressBar';
import QRModalContent from '../components/QRModalContent';

import { useAuth } from '../../global/contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { usePlayerPlaybackActions, usePlayerPlaybackData } from '../contexts/PlayerPlaybackContext';
import { useParty } from '../../global/contexts/PartyContext';

import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';

import spotify_logo from '../../assets/spotify_full_icon_green.png';
import album_placeholder from '../../assets/music_album_icon.svg';
import options_icon from '../../assets/options_icon.svg';
import speaker_icon from '../../assets/speaker_icon.svg';
import equalizer_icon from '../../assets/equalizer_icon.svg';
import leave_icon from '../../assets/leave_icon.svg';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const NewPlayerView = ({ onlyPlayer }) => {
    
    const { loadingAuth } = useAuth();
    const { currentTrack } = usePlayer();
    const { progressMs, progressPercent, joinPassword, volume } = usePlayerPlaybackData();
    const { setVolume } = usePlayerPlaybackActions();
    const { partyId, leavePartySession } = useParty();

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
    const [showOptions, setShowOptions] = useState(false);
    const [activeOption, setActiveOption] = useState(null);

    const handleOptionClick = (option) => {
        if (activeOption === option) {
            setActiveOption(null);
        } else {
            setActiveOption(option);
        }
    };

    if (loadingAuth) {
        return <div className={styles.loadingContainer}>Loading...</div>;
    }

    return (
        <div className={styles.mainContainer}>
            <section className={styles.topSection}>
                <img src={spotify_logo} alt="Spotify Logo" className={styles.spotifyLogo} />
                <div className={styles.mobileQRWrapper}>
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
                            QR Code
                        </motion.button>
                        ) : (
                        <motion.div
                            key="qr-modal"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.1 }}
                            className={styles.modal}
                        >
                            <QRModalContent partyId={partyId} joinPassword={joinPassword} onClose={() => setShowQR(false)} />
                        </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className={styles.tvQRWrapper}>
                    <QRModalContent partyId={partyId} joinPassword={joinPassword} onClose={() => {}} />
                </div>
            </section>
            <section className={styles.middleSection}>
                <img src={currentTrack ? currentTrack.albumCover || album_placeholder : album_placeholder}
                     alt="Album Cover"
                     className={styles.albumImage}
                     style={currentTrack ? { boxShadow: '0 0 150px var(--spotify-strong-border)' } : {}}
                />
                <div className={styles.trackInfo}>
                    <h2 className={styles.trackTitle}>{currentTrack ? currentTrack.title : 'No Track Playing'}</h2>
                    <p className={styles.trackArtist}>{currentTrack ? currentTrack.artists.map(artist => artist.name).join(', ') : 'Unknown Artist'}</p>
                </div>
                <TrackProgressBar />
            </section>
            <section className={`${styles.bottomSection} ${styles.bottomSectionMobile} ${!onlyPlayer ? styles.bottomSectionRounded : ''}`}>
                <AnimatePresence>
                    {showOptions && (
                        <motion.div
                            key="options-panel"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            transition={{ duration: 0.2, delay: showOptions ? 0.10 : 0 }}
                            className={styles.optionsPanel}
                        >
                            <button className={styles.optionsButton} onClick={() => handleOptionClick('leave')}>
                                <img src={leave_icon} alt="Leave" className={styles.optionButtonImg} />
                            </button>
                            <button className={styles.optionsButton} >
                                <img src={speaker_icon} alt="Volume" className={styles.optionButtonImg} onClick={() => handleOptionClick('volume')} />
                                <AnimatePresence>
                                {activeOption === 'volume' && (
                                    <motion.div
                                        key="volume-control"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.1 }}
                                        className={styles.controlBox}
                                    >
                                        <input type="range" min="0" max="100" className={styles.volumeSlider} value={volume*100} onChange={(e) => setVolume(parseInt(e.target.value) / 100)} />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </button>
                            <button className={styles.optionsButton} >
                                <img src={equalizer_icon} alt="Resolution" className={styles.optionButtonImg} onClick={() => handleOptionClick('resolution')} />
                                <AnimatePresence>
                                {activeOption === 'resolution' && (
                                    <motion.div
                                        key="resolution-control"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.1 }}
                                        className={styles.controlBox}
                                    >
                                        <select className={styles.resolutionSelect} >
                                            <option value="auto">Automatic</option>
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="veryHigh">Very High</option>
                                            <option value="lossless">Lossless</option>
                                        </select>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {activeOption === 'leave' && (
                    <motion.div
                        key="leave-modal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.1 }}
                        className={`${styles.modal} ${!onlyPlayer ? styles.modalCut : ''}`}
                    >
                        <p className={styles.modalHeader}>Do you want to leave the party?</p>
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={leavePartySession}
                        className={styles.playerButton}
                        style={{ marginTop: '20px', backgroundColor: 'var(--spotify-red)', color: 'white' }}
                        >
                        Leave
                        </motion.button>
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setActiveOption(null)}
                        className={styles.playerButton}
                        style={{ marginTop: '10px' }}
                        >
                        Back
                        </motion.button>
                    </motion.div>)}
                </AnimatePresence>

                <motion.button
                    className={styles.optionsButton + ' ' + styles.mainOptionsButton}
                    initial={{ borderRadius: '50%' }}
                    animate={
                        !showOptions ? { borderRadius: '50%' } : { borderRadius: '0', borderTopRightRadius: '50%', borderBottomRightRadius: '50%' }
                    }
                    transition={{ duration: 0.08, delay: showOptions ? 0 : 0.20 }}
                    src={options_icon} alt="Options" 
                    onClick={() => { setShowOptions(!showOptions); setActiveOption(null); }}
                >
                    <img src={options_icon} alt="Options" className={styles.optionButtonImg} />
                </motion.button>
            </section>
            <section className={`${styles.bottomSection} ${styles.bottomSectionDesktop} ${!onlyPlayer ? styles.bottomSectionRounded : ''}`}>
                <button className={`${styles.optionsButton} ${!onlyPlayer ? styles.bottomSectionRounded : ''}`} onClick={() => handleOptionClick('leave')}>
                    <img src={leave_icon} alt="Leave" className={styles.optionButtonImg} />
                </button>
                <AnimatePresence>
                    {activeOption === 'leave' && (
                    <motion.div
                        key="leave-modal"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.1 }}
                        className={`${styles.modal} ${!onlyPlayer ? styles.modalCut : ''}`}
                    >
                        <p className={styles.modalHeader}>Do you want to leave the party?</p>
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={leavePartySession}
                        className={styles.playerButton}
                        style={{ marginTop: '20px', backgroundColor: 'var(--spotify-red)', color: 'white' }}
                        >
                        Leave
                        </motion.button>
                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setActiveOption(null)}
                        className={styles.playerButton}
                        style={{ marginTop: '10px' }}
                        >
                        Back
                        </motion.button>
                    </motion.div>)}
                </AnimatePresence>
                <button className={styles.optionsButton} onClick={() => handleOptionClick('volume')}>
                    <img src={speaker_icon} alt="Volume" className={styles.optionButtonImg} />
                </button>
                <AnimatePresence>
                    {activeOption === 'volume' && (
                        <motion.div
                            key="volume-control"
                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 10,  x: '-50%' }}
                            transition={{ duration: 0.1 }}
                            className={styles.controlBox}
                        >
                            <input type="range" min="0" max="100" className={styles.volumeSlider} value={volume*100} onChange={(e) => setVolume(parseInt(e.target.value) / 100)} />
                        </motion.div>
                    )}
                </AnimatePresence>
                <button className={styles.optionsButton} onClick={() => handleOptionClick('resolution')}>
                    <img src={equalizer_icon} alt="Resolution" className={styles.optionButtonImg} />
                </button>
                <AnimatePresence>
                    {activeOption === 'resolution' && (
                        <motion.div
                            key="resolution-control"
                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 10,  x: '-50%' }}
                            transition={{ duration: 0.1 }}
                            className={styles.controlBox}
                        >
                            <select className={styles.resolutionSelect} >
                                <option value="auto">Automatic</option>
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="veryHigh">Very High</option>
                                <option value="lossless">Lossless</option>
                            </select>
                        </motion.div>
                    )}
                </AnimatePresence>
                
            </section>
        </div>
    );
}


export default NewPlayerView;