import React, { useEffect, useState } from 'react';
import styles from './Navbar.module.css';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ changeView }) => {

    const { loadingAuth, userRole } = useAuth();

    
    const tabs = [];
    if (userRole) {
        if (userRole.isPlayer) tabs.push({ name: 'Player', value: 'player' });
        if (userRole.isUser) {
            tabs.push({ name: 'User', value: 'user' });
            tabs.push({ name: 'Party', value: 'party' });
        }
        if (userRole.isHost) tabs.push({ name: 'Host', value: 'host' });
    }
    const finalTabs = tabs.length > 1 ? tabs : [];


    if (loadingAuth) return null;
    if (finalTabs.length === 0) return null;

    return (
        <nav className={styles.navbar}>
            <ul className={styles.navList}>
                {finalTabs.map((tab, index) => (
                    <li key={index} className={styles.navItem}>
                        <button className={styles.navButton} onClick={() => changeView(tab.value)}>
                            {tab.name}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Navbar;