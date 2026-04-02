import React, { useState, useEffect } from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import TrackCard from '../../../global/components/TrackCard/TrackCard';
import styles from './SubViewsStyle.module.css';

const SearchView = ({ scrollRef, onTrackClick, setSearchQuery, searchQuery, searchResults, setSearchResults, queryForResults, setQueryForResults }) => {

    const searchTracks = async (query) => {
        try {
            const res = await fetch(`http://localhost:8080/api/spotify/search?query=${encodeURIComponent(query)}`);
            
            if (res.status !== 200) {
                console.log('error while searching tracks: ', res.status);
                return;
            }

            const data = await res.json();
            setSearchResults(data);

            if (scrollRef && scrollRef.current) {
                scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }

        } catch (error) {
            console.error("Błąd połączenia:", error);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            searchTracks(searchQuery);
            setQueryForResults(searchQuery);
            setSearchQuery('');
        }
    }, [searchQuery]);

    return (
        <div className={styles.container}>
            <h1 className={styles.header} style={{ marginBottom: '0.3rem' }}>Szukaj piosenek</h1>
            
            <SearchBox onSearch={setSearchQuery} />

            {searchResults.length > 0 && queryForResults && (
                <h2 className={styles.subHeader}>Wyniki dla "{queryForResults}"</h2>
            )}

            <div className={styles.list}>
                {searchResults.map((track) => (
                    <TrackCard key={track.id} track={track} onClick={onTrackClick} />
                ))}
            </div>
        </div>
    );
};

export default SearchView;