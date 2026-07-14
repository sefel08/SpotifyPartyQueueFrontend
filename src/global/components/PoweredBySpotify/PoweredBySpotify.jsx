import styles from './PoweredBySpotify.module.css';
import SpotifyLogo from '../../../assets/spotify_full_icon_green.png';

const PoweredBySpotify = () => {
    return (
        <div className={styles.spotifyLogoContainer}>
            <span className={styles.logoName}>FairQ Demo</span>
            <span className={styles.poweredByText}>powered by</span>
            <img src={SpotifyLogo} alt="Spotify Logo" className={styles.spotifyLogo} />
        </div>
    )
}

export default PoweredBySpotify;