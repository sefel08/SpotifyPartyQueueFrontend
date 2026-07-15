import React, { useState, useEffect, useCallback } from 'react';
import styles from './SubViewsStyle.module.css';

import { useUser } from '../../contexts/UserContext';

import SearchBox from '../../components/SearchBox/SearchBox';
import TrackContainerCard from '../../../global/components/TrackContainerCard/TrackContainerCard';
import TrackList from '../../../global/components/TrackList';

import addToQueueIcon from '../../../assets/add_to_queue_icon.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SearchView = ({ scrollRef }) => {

    const { addToQueue, setSearchQuery, searchQuery, searchResults, setSearchResults, queryForResults, setQueryForResults, setSelectedTrackContainer } = useUser();

    const searchTracks = async (query) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/spotify/search?query=${encodeURIComponent(query)}`, {
                credentials: 'include',
            });
            
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
            console.error("Failed to search tracks:", error);
        }
    };

    const handleTrackAddToQueue = useCallback((track) => {
        addToQueue(track.id);
    }, [addToQueue]);

    useEffect(() => {
        if (searchQuery) {
            searchTracks(searchQuery);
            setQueryForResults(searchQuery);
            setSearchQuery('');
        }
    }, [searchQuery]);

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Szukaj piosenek</h1>
            
            <SearchBox onSearch={setSearchQuery} />

            {searchResults && queryForResults && (
                searchResults.tracks?.length === 0 && searchResults.albums?.length === 0 ? (
                    <h2 className={styles.subHeader}>Brak wyników dla "{queryForResults}"</h2>
                ) : (
                    <>
                        <h2 className={styles.subHeader}>Wyniki dla "{queryForResults}"</h2>
                        <div className={styles.list}>
                            <TrackList 
                                data={searchResults.tracks || []}
                                options={[{ label: 'Add to Queue', icon: addToQueueIcon, color: 'var(--spotify-green)', onClick: handleTrackAddToQueue, shouldFly: true }]}
                            />
                            {searchResults.albums && searchResults.albums.length > 0 && (
                                <>
                                    <h2 style={{ margin: '0.5rem 0' }} className={styles.subHeader}>Albumy</h2>
                                    {searchResults.albums.map(album => (
                                        <TrackContainerCard key={album.id} container={album} onClick={() => setSelectedTrackContainer(album)} />
                                    ))}
                                </>
                            )}
                        </div>
                    </>
                )
            )}

        </div>
    );
};

export default SearchView;