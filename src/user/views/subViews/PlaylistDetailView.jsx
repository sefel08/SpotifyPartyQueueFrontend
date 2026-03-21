import React, { useState, useEffect } from 'react';
import TrackCard from '../../../global/components/TrackCard/TrackCard';
import styles from './PlaylistDetailView.module.css';
import defaultImage from '../../../assets/spotify_icon.png';

const PlaylistDetailsView = ({ selectedPlaylist, onBack, onTrackClick }) => {
    
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`http://127.0.0.1:8080/api/spotify/playlist?playlistId=${selectedPlaylist.id}`, { 
            credentials: 'include' 
        })
            .then(res => res.json())
            .then(data => {
                setTracks(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd pobierania playlisty:", err);
                setLoading(false);
            });
    }, [selectedPlaylist.id]);

    
    if (loading) {
        return <div className={styles.loadingText}>Ładowanie utworów...</div>;
    }

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={onBack}>
                ⬅ Powrót
            </button>
            
            <div className={styles.header}>
                <img 
                    src={selectedPlaylist.imageUrl || defaultImage}
                    alt={selectedPlaylist.name} 
                    className={styles.playlistImage} 
                />
                <div className={styles.playlistInfo}>
                    <span className={styles.upperTitle}>PLAYLISTA</span>
                    <h1 className={styles.playlistName}>{selectedPlaylist.name}</h1>
                    <p className={styles.playlistStats}>{selectedPlaylist.totalTracks} utworów</p>
                </div>
            </div>

            <div className={styles.tracksList}>
                {tracks.map((track) => (
                    <TrackCard 
                        key={track.id} 
                        track={track} 
                        onClick={onTrackClick} 
                    />
                ))}
            </div>
        </div>
    );
};

export default PlaylistDetailsView;