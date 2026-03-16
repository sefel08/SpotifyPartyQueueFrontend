import React, { useState } from 'react';
import PlayerView from './views/PlayerView';
import UserView from './views/UserView';
import SelectView from './views/SelectView';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState(null);

  return (
    <>
      {currentView === 'player' ? (
        <PlayerView />
      ) : currentView === 'user' ? (
        <UserView />
      ) : (
        <SelectView setCurrentView={setCurrentView} />
      )}
    </>
  );
};

export default Dashboard;