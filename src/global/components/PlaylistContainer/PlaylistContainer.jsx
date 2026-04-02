import React from "react";
import styles from "./PlaylistContainer.module.css";
import { useAuth } from '../../contexts/AuthContext';

const PlaylistContainer = ({ children, style }) => {
  const { authorized, login } = useAuth();

  return (
    <div className={`${styles.playlistContainer} ${authorized ? '' : styles.loggedOut}`} style={style} onClick={authorized ? undefined : login}>
      {(authorized) ? children :
        <>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.loggedOutCard}>
              <div className={styles.loggedOutCardImage} />
            </div>
          ))}

          <p className={styles.logOutMessage}>Log in to view your playlists</p>
        </>
      }
    </div>
  );
};

export default PlaylistContainer;