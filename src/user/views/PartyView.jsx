import React, { useEffect, useState } from "react";
import { useParty } from "../../global/contexts/PartyContext";
import styles from "./PartyView.module.css";
import AddedTrack from "../components/AddedTrack/AddedTrack";
import UserCard from "../components/UserCard/UserCard";
import { usePartySelector } from "../../global/components/usePartySelector";

const PartyView = () => {

    const { getPartyQueue, getPartyUsers } = useParty();

    const [currentSubView, setCurrentSubView] = useState('queue');

    const queueVersion = usePartySelector(state => state.partyQueueVersion);
    const usersVersion = usePartySelector(state => state.partyUsersVersion);
    const [partyQueueInfo, setPartyQueueInfo] = useState({ queue: [], currentlyPlaying: null });
    const [partyUsers, setPartyUsers] = useState([]);

    useEffect(() => {
        getPartyQueue().then(queueData => setPartyQueueInfo(queueData));
    }, [queueVersion]);
    useEffect(() => {
        getPartyUsers().then(usersData => setPartyUsers(usersData));
    }, [usersVersion]);

    return (
        <div className={styles.container}>
        
            {/* Header */}
            <header className={styles.header}>
                <button className={`${styles.headerButton} ${currentSubView === 'queue' ? styles.activeHeaderButton : ''}`} onClick={() => setCurrentSubView('queue')}>Queue</button>
                <button className={`${styles.headerButton} ${currentSubView === 'users' ? styles.activeHeaderButton : ''}`} onClick={() => setCurrentSubView('users')}>Użytkownicy</button>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {currentSubView === 'queue' ? (
                    <div className={styles.addedTrackList}>
                        {partyQueueInfo.currentlyPlaying && (
                        <div className={styles.currentlyPlaying}>
                            <h3 className={styles.mainContentHeader}>Currently Playing</h3>
                            {partyQueueInfo.currentlyPlaying && (
                                <AddedTrack track={partyQueueInfo.currentlyPlaying.track} profile={partyQueueInfo.currentlyPlaying.profile} withoutUnderline={true} />
                            )}
                        </div>
                        )}
                        {partyQueueInfo.queue.length > 0 ?
                        (<>
                            <hr style={{ marginBottom: '1vh', marginBottom: '1dvh', marginTop: '0', width: '100%' }}/>
                            {partyQueueInfo.queue.map((item, index) => (
                                <AddedTrack key={index} track={item.track} profile={item.profile} />
                            ))}
                        </>) : (<>
                            <h3 className={styles.mainContentHeader}>Queue is empty</h3>
                        </>)}
                    </div>
                ) : (
                    <div className={styles.userGrid}>
                        {partyUsers.map((user, index) => (
                            <UserCard key={index} user={user} />
                        ))}
                    </div>
                )}
            </main>

        </div>
    )
}

export default PartyView;