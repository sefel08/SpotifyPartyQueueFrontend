import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import UserProfile from '../../../global/components/UserProfile/UserProfile';

const Sidebar = ({ onGoBack }) => {

  return (
    <div className={styles.sidebarContainer}>
      
      <UserProfile />

      <div className={styles.footer}>
        <button className={styles.backButton} onClick={onGoBack}>
          ← Zmień widok
        </button>
      </div>

    </div>
  );
};

export default Sidebar;