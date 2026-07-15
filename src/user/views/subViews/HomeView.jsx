import React from 'react';
import styles from './SubViewsStyle.module.css';

import { useAuth } from '../../../global/contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

import SearchBox from '../../components/SearchBox/SearchBox';
import TrackContainerCard from '../../../global/components/TrackContainerCard/TrackContainerCard';
import PlaylistContainer from '../../../global/components/PlaylistContainer/PlaylistContainer';

const HomeView = ({ setView }) => {

    const { user } = useAuth();
    const { setSearchQuery, searchQuery, searchResults, setSearchResults, queryForResults, setQueryForResults, userPlaylists, setSelectedTrackContainer } = useUser();

    const handleSearch = (query) => {
        setSearchQuery(query);
        setView('search');
    }

    return (
        <div className={styles.container}>
            
            <SearchBox onSearch={handleSearch} />
            
            <h1 className={styles.header}>Dzień dobry, {user.displayName || "Użytkowniku"}</h1>
            
            <PlaylistContainer style={ { marginBottom: '1rem' } }>
                {userPlaylists.map((playlist) => (
                    <TrackContainerCard key={playlist.id} container={playlist} onClick={() => setSelectedTrackContainer(playlist)} variant={"compact"} />
                ))}
            </PlaylistContainer>

            <h2 className={styles.subHeader}>Wybrane dla Ciebie</h2>
            <p style={{color: 'var(--spotify-light-gray)', marginBottom: '1rem'}}>Twoje osobiste zestawienie utworów.</p>
        </div>
    );
};

export default HomeView;