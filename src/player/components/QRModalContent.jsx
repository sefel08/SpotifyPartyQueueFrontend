import React, { useState, useEffect, memo } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import styles from '../views/NewPlayerView.module.css';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

const QRModalContent = memo(({ partyId, joinPassword, onClose }) => {

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

    return (
        <>
            <img src={qrDataUrl ? qrDataUrl : null} alt="QR Code" className={styles.qrCode} />
            <p className={styles.modalHeader}>Party ID</p>
            <p className={styles.modalText}>{partyId}</p>
            <p className={styles.modalHeader}>Join Password</p>
            <p className={styles.modalText}>{joinPassword}</p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={onClose}
                className={styles.showQRButton + ' ' + styles.hideQRButton}
                style={{ marginTop: '20px' }}
            >
                Hide QR Code
            </motion.button>
        </>
    );
});

export default QRModalContent;