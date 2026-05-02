import React, { useState, useEffect, use } from 'react';
import styles from './Dashboard.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import SelectView from './SelectView';
import PlayerView from '../../player/views/PlayerView';
import UserView from '../../user/views/UserView';
import PartyView from '../../user/views/PartyView';
import { UserProvider } from '../../user/contexts/UserContext';
import { PlayerProvider } from '../../player/contexts/PlayerContext';
import { PlayerPlaybackProvider } from '../../player/contexts/PlayerPlaybackContext';
import { PartyProvider } from '../contexts/PartyContext';
import Navbar from '../components/Navbar/Navbar';
import SpotifySDKContainer from '../../player/components/SpotifySDKContainer';

const Dashboard = () => {
  
  const { authorized, loadingAuth } = useAuth();
  const { loadingParty, partyId } = useParty();

  const [clickedSomething, setClickedSomething] = useState(false);

  const [isPlayer, setIsPlayer] = useState(() => localStorage.getItem('isPlayer') === 'true');
  const [currentView, setCurrentView] = useState(() => localStorage.getItem('currentView') || null);
  const [navbarTabs, setNavbarTabs] = useState(() => {
    const savedTabs = localStorage.getItem('navbarTabs');
    return savedTabs ? JSON.parse(savedTabs) : [];
  });

  const resetView = () => {
    setCurrentView(null);
    localStorage.removeItem('currentView');
  }
  const handleSetIsPlayer = (val) => {
    //set that user clicked something because it is redirect from select view
    setClickedSomething(true);
    setIsPlayer(val);
    localStorage.setItem('isPlayer', val);
  };
  const handleViewChange = (view) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  }
  const handleTabsChange = (tabs) => {
    localStorage.setItem('navbarTabs', JSON.stringify(tabs));
    setNavbarTabs(tabs);
  }

  if (loadingAuth || loadingParty) {
    return <div className={styles.loading}>Ładowanie...</div>;
  }

  if (!authorized || !partyId) {
    return <SelectView setNavbarTabs={handleTabsChange} setIsPlayer={handleSetIsPlayer} setCurrentView={handleViewChange} />;
  }

  // Make sure user clicks something to disable auto-play block in browsers
  if (!clickedSomething && isPlayer) {
    return (
      <div style={{ width: '100%', height: '100%', fontSize: '4rem' }} onClick={() => setClickedSomething(true)}>
        Kliknij w ekran, aby uruchomić odtwarzacz Spotify
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>

      <UserProvider>
        <PlayerProvider isPlayer={isPlayer}>
          <PlayerPlaybackProvider isPlayer={isPlayer}>

            {
              isPlayer && <SpotifySDKContainer setClickedSomething={setClickedSomething} />
            }

            {currentView === 'player' ? (
              <PlayerView />
            ) : currentView === 'user' ? (
              <UserView goBackToViewSelection={resetView} />
            ) : currentView === 'party' ? (
              <PartyView />
            ) : (
              <p>Something went wrong</p>
            )}

          </PlayerPlaybackProvider>
        </PlayerProvider>
      </UserProvider>
      
      {navbarTabs.length > 0 &&
        <Navbar tabs={navbarTabs} changeView={handleViewChange} />
      }

    </div>
  );
};

export default Dashboard;