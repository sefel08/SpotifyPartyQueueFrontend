import React, { useEffect } from 'react';
import styles from './HostView.module.css';

import { useHost } from './HostContext';

import spotifyIcon from '../assets/spotify_icon.png';

const HostView = () => {
    
    const { fetchingHostData, partyUsers, fetchPartyUsers, removePartyUser, skipTrack } = useHost();

    useEffect(() => {
        fetchPartyUsers();
    }, []);

    if (fetchingHostData) {
        return (<div className={styles.hostView}>
            <p>Loading host view...</p>
        </div>);
    }

    return (
        <div className={styles.hostView}>
            <header className={styles.header}>
                <h1 className={styles.title}>Host View</h1>
                <p className={styles.description}>Manage your party and its active users.</p>
            </header>

            <div className={styles.userList}>
                {partyUsers && partyUsers.length > 0 ? (
                    partyUsers.map((user) => (
                        <div key={user.userId} className={styles.userCard}>
                            <img 
                                src={user.profile.smallProfileImageUrl || spotifyIcon} 
                                alt={user.profile.displayName} 
                                className={styles.avatar}
                            />
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user.profile.displayName}</span>
                                <span className={styles.userStatus}>
                                    {user.profile.spotifyAuthorized ? 'Spotify Connected' : 'Guest'}
                                </span>
                            </div>
                            <button 
                                className={styles.removeBtn} 
                                onClick={() => removePartyUser(user.userId)}
                                aria-label={`Remove ${user.profile.displayName}`}
                            >
                                Kick
                            </button>
                        </div>
                    ))
                ) : (
                    <p className={styles.statusText}>No users in the party yet.</p>
                )}
            </div>

            <button className={styles.skipBtn} onClick={skipTrack}>
                Skip Current Track
            </button>
        </div>
    );
};

export default HostView;