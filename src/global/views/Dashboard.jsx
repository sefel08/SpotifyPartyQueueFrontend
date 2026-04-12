import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '../contexts/AuthContext';
import SelectView from './SelectView';
import PlayerView from '../../player/views/PlayerView';
import UserView from '../../user/views/UserView';
import { UserProvider } from '../../user/contexts/UserContext';
import { PlayerProvider } from '../../player/contexts/PlayerContext';
import { PartyProvider } from '../contexts/PartyContext';
import Navbar from '../components/Navbar/Navbar';

const Dashboard = () => {
  
  const { authorized, loadingAuth } = useAuth();

  const [currentView, setCurrentView] = useState(() => localStorage.getItem('currentView') || null);
  const [navbarTabs, setNavbarTabs] = useState(() => {
    const savedTabs = localStorage.getItem('navbarTabs');
    return savedTabs ? JSON.parse(savedTabs) : [];
  });

  const resetView = () => {
    setCurrentView(null);
    localStorage.removeItem('currentView');
  }
  const handleViewChange = (view) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  }
  const handleTabsChange = (tabs) => {
    localStorage.setItem('navbarTabs', JSON.stringify(tabs));
    setNavbarTabs(tabs);
  }

  if (loadingAuth) {
    return <div className={styles.loading}>Ładowanie...</div>;
  }

  return (
    <div className={styles.dashboard}>

      <PartyProvider changeView={handleViewChange}>
        {
        !authorized ? (
            <SelectView setNavbarTabs={handleTabsChange} />
        ) : currentView === 'player' ? (
          <PlayerProvider>
            <PlayerView />
          </PlayerProvider>
        ) : currentView === 'user' ? (
          <UserProvider>
            <UserView goBackToViewSelection={resetView} />
          </UserProvider>
        ) : 
            <SelectView setNavbarTabs={handleTabsChange} />
        }
      </PartyProvider>
      
      {navbarTabs.length > 0 &&
        <Navbar tabs={navbarTabs} changeView={handleViewChange} />
      }

    </div>
  );
};

export default Dashboard;