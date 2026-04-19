import React, { useEffect, useState } from "react";
import { useParty } from "../../global/contexts/PartyContext";
import styles from "./PartyView.module.css";
import AddedTrack from "../components/AddedTrack/AddedTrack";
import UserCard from "../components/UserCard/UserCard";

const PartyView = () => {

    const { getPartyQueue, getPartyUsers } = useParty();

    const [currentSubView, setCurrentSubView] = useState('queue');
    
    const [partyQueue, setPartyQueue] = useState([]);
    const [partyUsers, setPartyUsers] = useState([]);

    useEffect(() => {
        Promise.all([getPartyQueue(), getPartyUsers()])
            .then(([queueData, usersData]) => {
                setPartyQueue(queueData);
                setPartyUsers(usersData);
                // setIsLoading(false);
            });
    }, []);


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
                        {partyQueue.map((item, index) => (
                            <AddedTrack key={index} track={item.track} profile={item.profile} />
                        ))}
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