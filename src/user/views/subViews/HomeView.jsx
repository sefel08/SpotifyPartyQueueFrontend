import React from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import PlaylistCard from '../../../global/components/PlaylistCard/PlaylistCard';
import PlaylistContainer from '../../../global/components/PlaylistContainer/PlaylistContainer';
import styles from './SubViewsStyle.module.css';

const HomeView = ({ userName = "Użytkowniku", changeToSearchView, setSearchQuery, userPlaylists, onPlaylistSelect }) => {

    const handleSearch = (query) => {
        setSearchQuery(query);
        changeToSearchView();
    }

    return (
        <div className={styles.container}>
            
            <SearchBox onSearch={handleSearch} />
            
            <h1 className={styles.header}>Dzień dobry, {userName}</h1>
            
            <PlaylistContainer style={ { marginBottom: '1rem' } }>
                {userPlaylists.map((playlist) => (
                    <PlaylistCard playlist={playlist} onClick={() => onPlaylistSelect(playlist)} variant={"compact"} />
                ))}
            </PlaylistContainer>

            <h2 className={styles.subHeader}>Wybrane dla Ciebie</h2>
            <p style={{color: '#b3b3b3', marginBottom: '1rem'}}>Twoje osobiste zestawienie utworów.</p>
        </div>
    );
};

export default HomeView;