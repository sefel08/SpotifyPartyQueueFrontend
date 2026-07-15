import React from 'react';
import style from './TrackContainerCard.module.css';

const TrackContainerCard = ({ container, onClick, variant }) => {
  
  const cardClass = `${style.playlistCard} ${variant === 'compact' ? style.compact : ''}`;

  return (
    <div className={cardClass} onClick={() => onClick?.(container)}>
      <img src={container.imageUrl} alt={container.name} className={style.image} />
      <div className={style.textContainer}>
        <h3 className={style.name}>{container.name}</h3>
          {variant !== 'compact' && (
            <p className={style.tracksCount}>{container.totalTracks} tracks</p>
          )}
      </div>
    </div>
  );
};

export default TrackContainerCard;