import styles from "./UserCard.module.css";

import default_avatar from "../../../assets/profile_default.svg";

const UserCard = ({ user }) => {
    return (
        <div className={`${styles.userCard} ${user.spotifyAuthorized ? styles.authorized : ''}`}>
            <div className={styles.avatarWrapper}>
                <img className={styles.avatar} src={user.profileImageUrl || default_avatar} alt={user.displayName} />
            </div>
            <span className={styles.userName}>{user.displayName}</span>
        </div>
    );
};

export default UserCard;