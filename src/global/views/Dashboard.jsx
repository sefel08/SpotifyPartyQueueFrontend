import React, { useState, useEffect, use, useRef } from 'react';
import styles from './Dashboard.module.css';

import { TrackCardFlyingProvider } from '../../user/contexts/TrackCardFlyingContext';
import { UserProvider } from '../../user/contexts/UserContext';
import { PlayerProvider } from '../../player/contexts/PlayerContext';
import { PlayerPlaybackProvider } from '../../player/contexts/PlayerPlaybackContext';
import { PartyProvider } from '../contexts/PartyContext';

import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';

import EulaView from './EulaView/EulaView';
import SelectView from './SelectView';
import UserView from '../../user/views/UserView';
import PartyView from '../../user/views/PartyView';
import NewPlayerView from '../../player/views/NewPlayerView';
import Navbar from '../components/Navbar/Navbar';
import SpotifySDKContainer from '../../player/components/SpotifySDKContainer';

import restartIcon from '../../assets/restart_icon.svg';
import TrackCard from '../components/TrackCard/TrackCard';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL

const Dashboard = () => {
  
  const { authorized, loadingAuth, userRole, wantToLogin, setWantToLogin, login } = useAuth();
  const { loadingParty, partyId } = useParty();

  const [eulaAccepted, setEulaAccepted] = useState(() => localStorage.getItem('acceptedEula') === 'true' );

  const wasInSelect = useRef(false);
  const [clickedSomething, setClickedSomething] = useState(false);

  const [currentView, setCurrentView] = useState(null);
  const [viewResetTrigger, setViewResetTrigger] = useState(0);
  const [mustRejoinParty, setMustRejoinParty] = useState(false);

  const [selectViewRestartTrigger, setSelectViewRestartTrigger] = useState(0);

  const hasMoreThanOneRole = useRef(false);

  // Currentview status check
  useEffect(() => {
    if (loadingAuth) return;

    const avaibleViews = [];
    if (userRole.isPlayer) avaibleViews.push('player');
    if (userRole.isUser) avaibleViews.push('user');
    if (userRole.isHost) avaibleViews.push('host');

    setCurrentView(avaibleViews[0] || null);
    if (avaibleViews.length === 0) {
      setMustRejoinParty(true);
    } else {
      setMustRejoinParty(false);
    }

    hasMoreThanOneRole.current = avaibleViews.length > 1;
  }, [loadingAuth]);
  // Check if user is in select view
  useEffect(() => {
    if (loadingAuth || loadingParty) return;    
    if ((!authorized || !partyId) || mustRejoinParty) {
      wasInSelect.current = true;
    }
  }, [loadingAuth, loadingParty, authorized, partyId, mustRejoinParty]);

  const handleViewChange = (view) => {
    if (view === currentView) {
      setViewResetTrigger(prev => prev + 1); // trigger reset if same view is selected
    } else {
      setCurrentView(view);
      localStorage.setItem('currentView', view);
    }
  }

  return (
    <UserProvider>
      <PlayerProvider isPlayer={userRole.isPlayer}>
        <PlayerPlaybackProvider isPlayer={userRole.isPlayer}>
          <TrackCardFlyingProvider>

            <div className={styles.dashboard}>
            
            {wantToLogin && (
            <div className={styles.beforeLoginModal}>
              <h1 className={styles.dashboardHeader}>Uwaga</h1>
              <p className={styles.dashboardDescription}>
                Aplikacja jest w trybie demo/developerskim, jeżeli chcesz zalogować się do Spotify poproś mnie (sefla), żeby dodał cię na listę osób upoważnionych do zalogowania. Maksymalna ilość osób upoważnionych to 5, więc jak nie potrzebujesz dostępu do swoich playlist spotify to zaloguj się jako gość.
              </p>
              <button className={styles.dashboardButton} onClick={login}>
                Zostałem dodany i kontynuuję
              </button>
              <button className={styles.dashboardButton} onClick={() => setWantToLogin(false)}>
                Powrót
              </button>
            </div>
            )}

            {new URLSearchParams(window.location.search).get('loginError') ? (
              ( /* login error handling */
                <>
                <h1 className={styles.dashboardHeader}>Błąd logowania</h1>
                <p className={styles.dashboardDescription}>
                  Nie udało się zalogować do Spotify. Upewnij się, że masz aktywne połączenie z internetem i spróbuj ponownie.
                </p>
                <button className={styles.dashboardButton} onClick={() => window.location.href = FRONTEND_URL}>
                  Spróbuj ponownie
                </button>
                </>
              )
            ) : (loadingAuth || loadingParty) ? (
              ( /* loading state */
                <div className={styles.loading}>Ładowanie...</div>
              )
            ) : (!eulaAccepted) ? (
              ( /* EULA acceptance view */
                <EulaView onAccept={() => {
                  setEulaAccepted(true);
                  localStorage.setItem('acceptedEula', 'true');
                }} />
              )
            ) : ((!authorized || !partyId) || mustRejoinParty) ? (
              ( /* Select view */
                <>
                  <button className={styles.selectViewRestartButton}
                    onClick={() => {
                      localStorage.removeItem('operation');
                      setSelectViewRestartTrigger(prev => prev + 1);
                    }}
                  >
                    <img src={restartIcon} alt="Restart" className={styles.selectViewRestartButtonicon}/>
                  </button>
                  <SelectView key={selectViewRestartTrigger} />
                </>
              )
            ) : (userRole.isPlayer && !wasInSelect.current && !clickedSomething) ? (    
              ( /* Make sure user clicks something to disable auto-play block in browsers */
                <div 
                  style={{ width: '100%', flex: 1, fontSize: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
                  onClick={() => {
                    setClickedSomething(true)
                    sessionStorage.setItem('clickedSomething', 'true');
                  }}
                >
                  Kliknij w ekran, aby uruchomić odtwarzacz Spotify
                </div>
              )
            ) : (
              ( /* Main Dashboard */
                <>    
                  {
                    userRole.isPlayer && <SpotifySDKContainer setClickedSomething={setClickedSomething} />
                  }
                  {currentView === 'player' ? (
                    <NewPlayerView onlyPlayer={userRole.isPlayer && !userRole.isUser && !userRole.isHost} />
                  ) : currentView === 'user' ? (
                    <UserView resetTrigger={viewResetTrigger} />
                  ) : currentView === 'party' ? (
                    <PartyView />
                  ) : currentView === 'host' ? (
                    <p style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>Work in progress</p>
                  ) : (
                    <p style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>Something went wrong</p>
                  )}
                  <Navbar changeView={handleViewChange} />
                </>
              )
            )}

            </div>

          </TrackCardFlyingProvider>
        </PlayerPlaybackProvider>
      </PlayerProvider>
    </UserProvider>
  );
};

export default Dashboard;