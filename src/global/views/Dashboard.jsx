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
import { a } from 'framer-motion/client';

const Dashboard = () => {
  
  const { authorized, loadingAuth, userRole } = useAuth();
  const { loadingParty, partyId } = useParty();

  const [clickedSomething, setClickedSomething] = useState(false);

  const [currentView, setCurrentView] = useState(null);
  const [viewResetTrigger, setViewResetTrigger] = useState(0);
  const [mustRejoinParty, setMustRejoinParty] = useState(false);

  // currentview status check
  useEffect(() => {
    if (loadingAuth) return;

    const avaibleViews = [];
    if (userRole.isPlayer) avaibleViews.push('player');
    if (userRole.isUser) avaibleViews.push('user');
    if (userRole.isHost) avaibleViews.push('host');

    setCurrentView(avaibleViews[0] || null);
    if (avaibleViews.length === 0) setMustRejoinParty(true);
    else setMustRejoinParty(false);
  }, [loadingAuth]);

  const resetView = () => {
    setCurrentView(null);
    localStorage.removeItem('currentView');
  }
  const handleViewChange = (view) => {
    if (view === currentView) {
      setViewResetTrigger(prev => prev + 1); // trigger reset if same view is selected
    } else {
      setCurrentView(view);
      localStorage.setItem('currentView', view);
    }
  }

  if (loadingAuth || loadingParty) {
    return <div className={styles.loading}>Ładowanie...</div>;
  }

  if ((!authorized || !partyId) || mustRejoinParty) {
    return <SelectView />;
  }

  // Make sure user clicks something to disable auto-play block in browsers
  if (userRole.isPlayer && !clickedSomething) {
    return (
      <div style={{ width: '100%', height: '100%', fontSize: '4rem', display: 'flex', alignItems: 'center', textAlign: 'center' }} onClick={() => setClickedSomething(true)}>
        Kliknij w ekran, aby uruchomić odtwarzacz Spotify
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>

      <UserProvider>
        <PlayerProvider isPlayer={userRole.isPlayer}>
          <PlayerPlaybackProvider isPlayer={userRole.isPlayer}>

            {
              userRole.isPlayer && <SpotifySDKContainer setClickedSomething={setClickedSomething} />
            }

            {currentView === 'player' ? (
              <PlayerView />
            ) : currentView === 'user' ? (
              <UserView goBackToViewSelection={resetView} resetTrigger={viewResetTrigger} />
            ) : currentView === 'party' ? (
              <PartyView />
            ) : (
              <p>Something went wrong</p>
            )}

          </PlayerPlaybackProvider>
        </PlayerProvider>
      </UserProvider>
      
      <Navbar changeView={handleViewChange} />

    </div>
  );
};

export default Dashboard;