import styles from './SubViewsStyle.module.css';

import { useUser } from '../../contexts/UserContext';

import TrackContainerCard from '../../../global/components/TrackContainerCard/TrackContainerCard';

import defaultImage from '../../../assets/spotify_icon.png';


const ArtistView = () => {

    const { selectedArtist, selectedArtistAlbums, fetchingArtistAlbums, setViewItem, goBackInViewHistory } = useUser();

    return (
        <>
            <button className={styles.backButton} onClick={goBackInViewHistory}>⬅</button>
            <div className={styles.container}>
                <div className={styles.playlistDataWrapper}>
                    <img 
                        src={selectedArtist.largeImageUrl || defaultImage}
                        alt={selectedArtist.name} 
                        className={`${styles.playlistImage} ${styles.capsule}`} 
                    />
                    <div className={styles.playlistInfo}>
                        <span className={styles.upperTitle}>Artysta</span>
                        <h1 className={styles.playlistName}>{selectedArtist.name}</h1>
                    </div>
                </div>

                <hr style={{ marginBottom: '20px', marginTop: '0', width: '100%' }}/>

                <div className={styles.list}>
                    {fetchingArtistAlbums ? (
                        <p>Ładowanie albumów...</p>
                    ) : (
                        selectedArtistAlbums && selectedArtistAlbums.length > 0 ? (
                            selectedArtistAlbums.map(album => (
                                <TrackContainerCard key={album.id} container={album} onClick={() => setViewItem(album, 'container')} />
                            ))
                        ) : (
                            <p>Brak albumów dla wybranego artysty.</p>
                        )
                    )}
                </div>
            </div>
        </>
    )
}

export default ArtistView;