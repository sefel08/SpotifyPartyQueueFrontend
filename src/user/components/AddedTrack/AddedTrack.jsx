import TrackCard from "../../../global/components/TrackCard/TrackCard";
import styles from "./AddedTrack.module.css";

import default_avatar from "../../../assets/profile_default.svg";

const AddedTrack = ({ track, profile, withoutUnderline = false }) => {
    return (
        <div className={styles.addedCard}>
            <TrackCard track={track} squared={true} />
            <div className={`${styles.addedBy} ${!withoutUnderline && profile.spotifyAuthorized ? styles.authorized : ''}`}> 
                Dodane przez: 
                <span className={styles.profileName}>{profile.displayName}</span>
                <img 
                    src={profile.smallProfileImageUrl || default_avatar} 
                    className={styles.miniAvatar} 
                    alt={profile.displayName} 
                />
            </div>
        </div>
    );
};

export default AddedTrack;