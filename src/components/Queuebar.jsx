import React from 'react';
import styles from './Queuebar.module.css';

const Queuebar = ({ queue = [] }) => {
    return (
        <aside className={styles.container}>
            <h3 className={styles.title}>Kolejka</h3>
            
            <div className={styles.scrollArea}>
                {queue.length > 0 ? (
                    queue.map((track, index) => (
                        <div key={`${track.id}-${index}`} className={styles.trackCard}>
                            <img 
                                src={track.imageUrl || 'https://via.placeholder.com/45'} 
                                alt={track.name} 
                                className={styles.image} 
                            />
                            <div className={styles.info}>
                                <p className={styles.trackTitle}>{track.name}</p>
                                <p className={styles.trackArtist}>
                                    {track.artists && track.artists.join(', ')}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#b3b3b3', textAlign: 'center', fontSize: '14px' }}>
                        Kolejka jest pusta
                    </p>
                )}
            </div>
        </aside>
    );
};

export default Queuebar;