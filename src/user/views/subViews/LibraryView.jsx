import React from 'react';
import TrackCard from '../../../global/components/TrackCard/TrackCard';
import styles from './SubViewsStyle.module.css';

const LibraryView = ({ savedTracks = [], onTrackClick }) => {
    return (
        <div className={styles.container}>
            <header className={styles.stickyHeader}>
                <h1 className={styles.header}>Twoja Biblioteka</h1>
                <div className={styles.filterBar}>
                    <button className={`${styles.chip} ${styles.activeChip}`}>Playlisty</button>
                    <button className={styles.chip}>Wykonawcy</button>
                    <button className={styles.chip}>Albumy</button>
                </div>
            </header>

            <div className={styles.list}>
                {savedTracks.length > 0 ? (
                    savedTracks.map((track) => (
                        <TrackCard key={track.id} track={track} onClick={onTrackClick} />
                    ))
                ) : (
                    <p className={styles.emptyMessage}>Twoja biblioteka jest jeszcze pusta. Dodaj jakieś utwory!</p>
                )}
            </div>
        </div>
    );
};

export default LibraryView;