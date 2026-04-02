import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import SelectView from './SelectView';
import PlayerView from '../../player/views/PlayerView';
import UserView from '../../user/views/UserView';
import { UserProvider } from '../../user/contexts/UserContext';
import { PlayerProvider } from '../../player/contexts/PlayerContext';
import Navbar from '../components/Navbar/Navbar';

const Dashboard = () => {
  
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || null;
  });
  const [navbarTabs, setNavbarTabs] = useState([]);

  const resetView = () => {
    setCurrentView(null);
    localStorage.removeItem('currentView');
  }
  const handleViewChange = (view) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  }

  return (
    <div className={styles.dashboard}>

      {currentView === 'player' ? (
        <PlayerProvider>
          <PlayerView />
        </PlayerProvider>
      ) : currentView === 'user' ? (
        <UserProvider>
          <UserView goBackToViewSelection={resetView} />
        </UserProvider>
      ) : (
        <SelectView setCurrentView={handleViewChange} setNavbarTabs={setNavbarTabs} />
      )}
      
      {navbarTabs.length > 0 &&
        <Navbar tabs={navbarTabs} changeView={handleViewChange} />
      }

    </div>
  );
};

export default Dashboard;