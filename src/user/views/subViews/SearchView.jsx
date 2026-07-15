import React, { useState, useEffect, useCallback } from 'react';
import styles from './SubViewsStyle.module.css';

import { useUser } from '../../contexts/UserContext';

import SearchBox from '../../components/SearchBox/SearchBox';
import TrackContainerCard from '../../../global/components/TrackContainerCard/TrackContainerCard';
import ArtistCard from '../../../global/components/ArtistCard/ArtistCard';
import TrackList from '../../../global/components/TrackList';

import addToQueueIcon from '../../../assets/add_to_queue_icon.svg';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SearchView = ({ scrollRef }) => {

    const { addToQueue, searchQuery, searchForResults, searchResults, searchPinnedResults, setViewItem } = useUser();

    const handleTrackAddToQueue = useCallback((track) => {
        addToQueue(track.id);
    }, [addToQueue]);

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Szukaj piosenek</h1>
            
            <SearchBox onSearch={(query) => {
                searchForResults(query);
                if (scrollRef && scrollRef.current) {
                    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }} />

            {searchResults && searchQuery && (
                searchResults.tracks?.length === 0 && searchResults.albums?.length === 0 ? (
                    <h2 className={styles.subHeader}>Brak wyników dla "{searchQuery}"</h2>
                ) : (
                    <>
                        <h2 className={styles.subHeader}>Wyniki dla "{searchQuery}"</h2>
                        <div className={styles.list}>
                            {/* Display pinned search results first*/}
                            {searchPinnedResults.albums && searchPinnedResults.albums.length > 0 && (
                                <>
                                    {searchPinnedResults.albums.map(album => (
                                        <TrackContainerCard key={album.id} container={album} onClick={() => setViewItem(album, 'container')} />
                                    ))}
                                </>
                            )}
                            {searchPinnedResults.artists && searchPinnedResults.artists.length > 0 && (
                                <>
                                    {searchPinnedResults.artists.map(artist => (
                                        <ArtistCard key={artist.id} artist={artist} onClick={() => setViewItem(artist, 'artist')} />
                                    ))}
                                </>
                            )}

                            {/* Display regular search results */}
                            <TrackList 
                                data={searchResults.tracks || []}
                                options={[{ label: 'Add to Queue', icon: addToQueueIcon, color: 'var(--spotify-green)', onClick: handleTrackAddToQueue, shouldFly: true }]}
                            />
                            {searchResults.albums && searchResults.albums.length > 0 && (
                                <>
                                    <h2 style={{ margin: '0.5rem 0' }} className={styles.subHeader}>Albumy</h2>
                                    {searchResults.albums.map(album => (
                                        <TrackContainerCard key={album.id} container={album} onClick={() => setViewItem(album, 'container')} />
                                    ))}
                                </>
                            )}
                            {searchResults.artists && searchResults.artists.length > 0 && (
                                <>
                                    <h2 style={{ margin: '0.5rem 0' }} className={styles.subHeader}>Artyści</h2>
                                    {searchResults.artists.map(artist => (
                                        <ArtistCard key={artist.id} artist={artist} onClick={() => setViewItem(artist, 'artist')} />
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