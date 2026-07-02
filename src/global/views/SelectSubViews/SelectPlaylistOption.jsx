import React from 'react';
import styles from './SelectSubView.module.css';
import PlaylistCard from '../../components/PlaylistCard/PlaylistCard';

import { useUser } from '../../../user/contexts/UserContext';

const SelectPlaylistOption = ({ 
    mainTitle, 
    onSelect,
    onSkip
}) => {

    const { userPlaylists } = useUser();
    const playlists = userPlaylists || [];

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                {mainTitle && <h1 className={styles.mainTitle}>{mainTitle}</h1>}
                
                <p className={styles.inputDescription}>
                    Wybierz playlistę, z której system wylosuje utwory, gdy w kolejce zabraknie piosenek dodanych przez gości.
                </p>

                <div className={styles.playlistsScrollContainer}>
                    {playlists && playlists.length > 0 ? (
                        playlists.map((playlist) => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                variant="normal"
                                onClick={() => onSelect(playlist.id)}
                            />
                        ))
                    ) : (
                        <p className={styles.noPlaylistsText}>Nie znaleziono żadnych playlist...</p>
                    )}
                </div>

                {onSkip && (
                    <button 
                        onClick={onSkip}
                        className={styles.submitButton}
                        style={{ marginTop: '20px', marginBottom: '0' }}
                    >
                        Pomiń ten krok
                    </button>
                )}
            </div>
        </div>
    );
}

export default SelectPlaylistOption;