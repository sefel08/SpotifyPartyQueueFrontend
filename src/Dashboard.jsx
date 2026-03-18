import React, { useState, useEffect } from 'react';
import PlayerView from './views/PlayerView';
import UserView from './views/UserView';
import SelectView from './views/SelectView';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('currentView') || null;
  });

  const resetView = () => {
    setCurrentView(null);
    localStorage.removeItem('currentView');
  }
  const handleViewChange = (view) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  }

  useEffect(() => {
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
      setCurrentView(savedView);
    }
  }, []);

  return (
    <>
      {currentView === 'player' ? (
        <PlayerView />
      ) : currentView === 'user' ? (
        <UserView goBackToViewSelection={resetView} />
      ) : (
        <SelectView setCurrentView={handleViewChange} />
      )}
    </>
  );
};

export default Dashboard;