import styles from './ArtistCard.module.css';

import defaultImage from '../../../assets/spotify_icon.png';

const ArtistCard = ({ artist, onClick }) => {
    return (
        <div className={styles.card} onClick={onClick}>
            <img src={artist.smallImageUrl || defaultImage} alt={artist.name} className={styles.image} />
            <h3 className={styles.name}>{artist.name}</h3>
        </div>
    );
};

export default ArtistCard;