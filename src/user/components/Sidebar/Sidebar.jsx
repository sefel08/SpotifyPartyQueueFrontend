import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import UserProfile from '../../../global/components/UserProfile/UserProfile';
import { useParty } from '../../../global/contexts/PartyContext';
import { useAuth } from '../../../global/contexts/AuthContext';

const Sidebar = () => {

  const { logout, spotifyAuthorized } = useAuth();
  const { leavePartySession } = useParty();

  return (
    <div className={styles.sidebarContainer}>
      
      <UserProfile />

      <div className={styles.footer}>
        {spotifyAuthorized && (
          <button className={styles.backButton} onClick={logout}>
            ← Wyloguj się
          </button>
        )}
        <button className={styles.backButton} onClick={leavePartySession}>
          ← Opóść party
        </button>
      </div>

    </div>
  );
};

export default Sidebar;