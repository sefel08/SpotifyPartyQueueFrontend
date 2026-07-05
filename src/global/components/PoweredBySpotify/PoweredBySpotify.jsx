import styles from './PoweredBySpotify.module.css';
import SpotifyLogo from '../../../assets/spotify_full_icon_green.png';

const PoweredBySpotify = () => {
    return (
        <div className={styles.spotifyLogoContainer}>
            <span className={styles.poweredByText}>Powered by</span>
            <img src={SpotifyLogo} alt="Spotify Logo" className={styles.spotifyLogo} />
        </div>
    )
}

export default PoweredBySpotify;