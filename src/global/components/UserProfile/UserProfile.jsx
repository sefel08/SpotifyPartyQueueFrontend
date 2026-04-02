import React from 'react';
import styles from './UserProfile.module.css';
import default_avatar_image from '../../../assets/spotify_icon.png';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => { 
    
    const { user, authorized, login } = useAuth();

    return (
        <div 
        className={`${styles.profileCard} ${!authorized ? styles.loginPointer : ''}`} 
        onClick={!authorized ? login : undefined}
        >
        {authorized && user ? (
            <>
            <img className={styles.avatar} src={(user.image_url === 'None') ? default_avatar_image : user.image_url} alt={user.name} />
            <span className={styles.username}>{user.name}</span>
            </>
        ) : (
            <>
            <img className={styles.avatar} src={default_avatar_image} alt="Zaloguj się" />
            <span className={styles.username}>Zaloguj się</span>
            </>
        )}
        </div>
    );
};

export default UserProfile;