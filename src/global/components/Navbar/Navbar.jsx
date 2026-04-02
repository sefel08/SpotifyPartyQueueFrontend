import React, { useState } from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ tabs, changeView }) => {
    
    return (
        <nav className={styles.navbar}>
            <ul className={styles.navList}>
                {tabs.map((tab, index) => (
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