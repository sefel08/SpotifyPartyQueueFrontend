import React, { useState } from 'react';
import TrackCard from './TrackCard';
import styles from './SearchView.module.css';

const SearchView = ({ onTrackClick }) => {
    const [inputText, setInputText] = useState('');
    const [tracks, setTracks] = useState([]);

    const searchTracks = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/spotify/search?query=${encodeURIComponent(inputText)}`);

            if (res.status !== 200) {
                console.log('error while searching tracks: ', res.status);
                return;
            }

            const data = await res.json();
            setTracks(data);

        } catch (error) {
            console.error("Błąd połączenia:", error);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Szukaj piosenek</h1>
            
            <div className={styles.searchBox}>
                <input
                    className={styles.input} 
                    placeholder="Co chcesz usłyszeć?"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchTracks()} 
                />
                <button className={styles.button} onClick={searchTracks}>
                    Szukaj
                </button>
            </div>

            <div className={styles.list}>
                {tracks.map((track) => (
                    <TrackCard key={track.id} track={track} onClick={onTrackClick} />
                ))}
            </div>
        </div>
    );
};

export default SearchView;