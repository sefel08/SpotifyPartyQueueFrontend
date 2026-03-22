import React, { useState } from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ tabs }) => {
    
    return (
        <nav className={styles.navbar}>
            <ul className={styles.navList}>
                {tabs.map((tab, index) => (
                    <li key={index} className={styles.navItem}>
                        <button className={styles.navButton}>{tab}</button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Navbar;