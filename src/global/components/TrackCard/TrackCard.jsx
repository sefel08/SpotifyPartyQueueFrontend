import React, { useCallback } from 'react';
import styles from './TrackCard.module.css';

import { useTrackFlyTrigger } from '../../../user/contexts/TrackCardFlyingContext';
import { useUser } from '../../../user/contexts/UserContext';
import { motion } from 'framer-motion';

import spotify_icon from "../../../assets/spotify_icon_black.png";

const TrackCard = ({ isOpen, onClick, track, queueItemId, listUniqueId, options, squared }) => {
  
  const { setSelectedArtistFromId } = useUser();
  const triggerFlyingTrack = useTrackFlyTrigger();

  const handleOpenInSpotify = useCallback(() => {
      window.open(track.uri, '_blank');
  }, [track.uri]);
  const handleOptionClick = useCallback((optionOnClickMethod, shouldFly, e) => {
    if (shouldFly && triggerFlyingTrack) {
      const cardElement = e.currentTarget.closest('.' + styles.trackCardContainer);
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect();
        triggerFlyingTrack({
          track: track,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
    }
    optionOnClickMethod(track, queueItemId);
    onClick(listUniqueId);
  }, [track, queueItemId, listUniqueId, onClick, triggerFlyingTrack]);

  const getOptionStyle = (optIndex, option, isSpotifyRedirect) => {
    const baseStyle = isSpotifyRedirect ? { backgroundColor: 'var(--spotify-green)' } : { backgroundColor: option.color || 'var(--spotify-green)' };
    
    if (options && options.length !== 0) {
      return optIndex === options.length - 1 && !isSpotifyRedirect ? { ...baseStyle, borderBottomRightRadius: '4px', borderTopRightRadius: '4px' } : baseStyle;
    } else {
      return { ...baseStyle, borderBottomRightRadius: '4px', borderTopRightRadius: '4px' };
    }

    return baseStyle;
  }

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <div className={styles.trackCardContainer} >
      <motion.div layout className={styles.trackCard + (squared ? ' ' + styles.squared : '')} onClick={() => onClick(listUniqueId)}>
        <img 
          src={track.smallImageUrl || spotify_icon} 
          alt={track.name} 
          className={styles.albumImage + (squared ? ' ' + styles.squared : '')} 
        />
        
        <div className={styles.trackDetails}>
          <span className={styles.trackName}>{track.name}</span>
          {track.artists && track.artists.length > 0 ? (
            <div className={styles.artistsWrapper}>
              {track.artists.map((artist, index) => (
                <span key={index} className={styles.trackArtists} onClick={() => setSelectedArtistFromId(artist.id)}>
                  {artist.name}
                </span>
              ))}
            </div>
          ) : (
            <div className={styles.artistsWrapper}>
              <span className={styles.trackArtists}>Unknown Artist</span>
            </div>
          )}
        </div>

        <div className={styles.trackMeta}>
          <span className={styles.duration}>{formatTime(track.durationMs)}</span>
        </div>
      </motion.div>

      <motion.div 
        className={styles.optionsContainer}
        initial={{ clipPath: 'inset(0% 0% 0% 100%)' }}
        animate={{ clipPath: isOpen ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 100%)' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={styles.optionsButton}
          style={getOptionStyle(0, null, true)}
          onClick={(e) => handleOptionClick(handleOpenInSpotify, false, e)}
        >
          <img src={spotify_icon} alt="Open in Spotify" className={styles.optionIcon} />  
        </button>

        {options && options.map((option, optIndex) => (
            <button 
              key={optIndex}
              className={styles.optionsButton}
              style={getOptionStyle(optIndex, option, false)}
              onClick={(e) => handleOptionClick(option.onClick, option.shouldFly, e)}
            >
              <img src={option.icon} alt={option.label} className={styles.optionIcon} />  
            </button>
          ))
        }
      </motion.div>

    </div>
  );
};

export default React.memo(TrackCard);