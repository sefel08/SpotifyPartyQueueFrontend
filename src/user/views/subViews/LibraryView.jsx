import React from 'react';
import styles from './SubViewsStyle.module.css';

import { useAuth } from '../../../global/contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

import TrackContainerCard from '../../../global/components/TrackContainerCard/TrackContainerCard';
import UserProfile from '../../../global/components/UserProfile/UserProfile';

const LibraryView = () => {

    const { userPlaylists, setViewItem } = useUser();
    const { authorized, login } = useAuth();

    return (
        authorized ? (
        <div className={styles.container}>
            <header className={styles.libraryStickyHeader}>
                <h1 className={styles.header}>Twoja Biblioteka</h1>
                <div className={styles.filterBar}>
                    <button className={`${styles.chip} ${styles.activeChip}`}>Playlisty</button>
                    <button className={styles.chip}>Wykonawcy</button>
                    <button className={styles.chip}>Albumy</button>
                </div>
            </header>

            {/* playlist cards */}
            <div className={styles.list}>
                {userPlaylists.map(playlist => (
                    <TrackContainerCard key={playlist.id} container={playlist} onClick={() => setViewItem(playlist, 'container')} />
                ))}
            </div>
        </div>
        ) : (
        <div className={styles.container}>
            {/* <h1 className={styles.header}>Twoja Biblioteka</h1> */}
            <div style={{ marginTop: '1rem', width: '50%', maxWidth: '350px', alignSelf: 'center' }}>
                <UserProfile />
            </div>
            <p style={{ textAlign: 'center' }}>
                Aby zobaczyć swoją bibliotekę muzyczną.
            </p>
        </div>
        )
    )
};

export default LibraryView;