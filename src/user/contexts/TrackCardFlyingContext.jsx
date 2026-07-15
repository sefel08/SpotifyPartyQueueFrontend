import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FlyingStateContext = createContext(null);
const FlyingDispatchContext = createContext(null);

export const TrackCardFlyingProvider = ({ children }) => {
  const [flyingTracks, setFlyingTracks] = useState([]);

  const triggerFlyingTrack = useCallback((trackData) => {
    setFlyingTracks((prev) => [
      ...prev,
      {
        ...trackData,
        flyingId: `${trackData.track.id}-${Date.now()}-${Math.random()}`
      }
    ]);
  }, []);

  const dispatchValue = useMemo(() => triggerFlyingTrack, [triggerFlyingTrack]);

  return (
    <FlyingDispatchContext.Provider value={dispatchValue}>
      <FlyingStateContext.Provider value={flyingTracks}>
        {children}
        <FlyingTrackRenderer setFlyingTracks={setFlyingTracks} />
      </FlyingStateContext.Provider>
    </FlyingDispatchContext.Provider>
  );
};

const FlyingTrackRenderer = ({ setFlyingTracks }) => {
  const flyingTracks = useContext(FlyingStateContext);

  const getAnimationTarget = (trackInstance) => {
    const target = document.getElementById('queue-button');
    const targetRect = target 
      ? target.getBoundingClientRect() 
      : { left: window.innerWidth / 2, top: window.innerHeight };

    const deltaX = (targetRect.left + (targetRect.width / 2) - 25) - trackInstance.x;
    const deltaY = targetRect.top - trackInstance.y;

    return {
      x: deltaX,
      y: deltaY,
      width: 40,
      height: 40,
      opacity: 0,
      borderRadius: '50%',
    };
  };
  const handleAnimationComplete = (flyingId) => {
    setFlyingTracks((prev) => prev.filter((t) => t.flyingId !== flyingId));
  };

  return (
    <AnimatePresence>
      {flyingTracks.map((trackInstance) => (
        <motion.div
          key={trackInstance.flyingId}
          style={{
            position: 'fixed',
            left: trackInstance.x,
            top: trackInstance.y,
            width: trackInstance.width,
            height: trackInstance.height,
            backgroundColor: 'var(--spotify-dark-gray)',
            borderRadius: '8px',
            border: '1px solid var(--spotify-gray)',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            gap: '12px',
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            x: 0,
            y: 0,
          }}
          initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          animate={getAnimationTarget(trackInstance)}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          onAnimationComplete={() => handleAnimationComplete(trackInstance.flyingId)}
        >
          <img 
            src={trackInstance.track.imageUrl} 
            alt="" 
            style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0 }} 
          />

          <motion.div 
            animate={{ opacity: 0, width: 0, display: 'none' }} 
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            <span style={{ color: 'var(--spotify-white)', fontSize: '14px', fontWeight: 'bold' }}>
              {trackInstance.track.name}
            </span>
            <span style={{ color: 'var(--spotify-light-gray)', fontSize: '12px' }}>
              {trackInstance.track.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
            </span>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export const useTrackFlyTrigger = () => {
  const context = useContext(FlyingDispatchContext);
  if (!context) {
    throw new Error('useTrackFlyTrigger must be used within a TrackCardFlyingProvider');
  }
  return context;
};

export const useTrackFlyState = () => {
  const context = useContext(FlyingStateContext);
  if (context === undefined) {
    throw new Error('useTrackFlyState must be used within a TrackCardFlyingProvider');
  }
  return context;
};