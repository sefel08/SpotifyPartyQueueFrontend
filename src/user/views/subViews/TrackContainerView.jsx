import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SubViewsStyle.module.css';

import { useUser } from '../../contexts/UserContext';

import TrackList from '../../../global/components/TrackList';

import defaultImage from '../../../assets/spotify_icon.png';
import addToQueueIcon from '../../../assets/add_to_queue_icon.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const TrackContainerView = ({ onBack }) => {
    
    const { selectedTrackContainer, addToQueue, goBackInViewHistory } = useUser();

    const TRACKS_RETURN_LIMIT = 50; // backend returns 50 tracks per request
    const [tracks, setTracks] = useState([]);
    const [offset, setOffset] = useState(0);
    const downloadingRef = useRef(false); // to prevent multiple simultaneous downloads
    const [loadingData, setLoadingData] = useState(false);

    const sentinelRef = useRef(null);


    const downloadContainerItems = useCallback(async () => {
        if (downloadingRef.current) return; // already loading
        if (offset > selectedTrackContainer.totalTracks) return; // all tracks loaded

        downloadingRef.current = true;
        setLoadingData(true);

        try {
            const endpoint = selectedTrackContainer.type === 'PLAYLIST' ? 'playlist' : 'album';
            const res = await fetch(`${API_BASE_URL}/api/spotify/${endpoint}?${endpoint}Id=${selectedTrackContainer.id}&offset=${offset}`, { 
                credentials: 'include'
            });
            
            if (!res.ok) throw new Error(`Status: ${res.status}`);
            
            const data = await res.json();
            setTracks(prevTracks => [...prevTracks, ...data]);
            setOffset(prevOffset => prevOffset + TRACKS_RETURN_LIMIT);
        } catch (err) {
            console.error("Błąd pobierania:", err);
        } finally {
            downloadingRef.current = false;
            setLoadingData(false);
        }
    }, [selectedTrackContainer.id, offset]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    downloadContainerItems();
                }
            },
            { threshold: 0.1 } // active when 10% of the sentinel is visible
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [downloadContainerItems]);

    const handleTrackClick = React.useCallback((track, index) => {
        addToQueue(track.id);
    }, [addToQueue]);

    return (
        <>
            <button className={styles.backButton} onClick={goBackInViewHistory}>⬅</button>
            <div className={styles.container}>
                <div className={styles.playlistDataWrapper}>
                    <img 
                        src={selectedTrackContainer.largeImageUrl || defaultImage}
                        alt={selectedTrackContainer.name} 
                        className={styles.playlistImage} 
                    />
                    <div className={styles.playlistInfo}>
                        <span className={styles.upperTitle}>{selectedTrackContainer.type === 'PLAYLIST' ? 'Playlista' : 'Album'}</span>
                        <h1 className={styles.playlistName}>{selectedTrackContainer.name}</h1>
                        <p className={styles.playlistStats}>{selectedTrackContainer.totalTracks} utworów</p>
                    </div>
                </div>

                <hr style={{ marginBottom: '20px', marginTop: '0', width: '100%' }}/>

                <div className={styles.list}>
                    <TrackList 
                        data={tracks} 
                        options={[{ label: 'Add to Queue', icon: addToQueueIcon, color: 'var(--spotify-green)', onClick: handleTrackClick, shouldFly: true }]} 
                    />

                    {tracks.length === 0 && !loadingData && (
                        <p style={{ fontSize: '1.5rem', color: 'var(--spotify-light-gray)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Brak utworów do wyświetlenia</p>
                    )}
                    
                    <div ref={sentinelRef} style={{ height: '2rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: '10px', fontSize: '1.5rem', color: 'var(--spotify-light-gray)' }}>
                        {loadingData && 'Ładowanie utworów...'}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TrackContainerView;