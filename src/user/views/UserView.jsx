import React, { use, useEffect, useState } from 'react';
import styles from './UserView.module.css';

import { useAuth } from '../../global/contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useParty } from '../../global/contexts/PartyContext';
import { usePartySelector } from '../../global/components/usePartySelector';

import PoweredBySpotify from '../../global/components/PoweredBySpotify/PoweredBySpotify';
import Sidebar from '../components/Sidebar/Sidebar';
import MainBox from '../components/Mainbox/MainBox';
import Queuebar from '../../global/components/Queuebar/Queuebar';

import SkipIcon from '../../assets/skip_icon.svg?react';

const UserView = ({ resetTrigger }) => {
    
    const { authorized, login } = useAuth();
    const { refreshUserQueue, clearViewItems } = useUser();
    
    const { votedToSkip, handleSkip } = useParty();
    const skipVotes = usePartySelector(state => state.skipVotes);
    const userQueueVersion = usePartySelector(state => state.userQueueVersion);

    const [currentSubView, setCurrentSubView] = useState('home');    

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isQueueOpen, setQueueOpen] = useState(false);

    useEffect(() => {
        refreshUserQueue();
    }, [userQueueVersion]);
    useEffect(() => {
        setCurrentSubView('home');
        clearViewItems();
    }, [resetTrigger]);

    return (
        <div className={styles.container}>
            
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.sidebarBtn} onClick={() => setSidebarOpen(true)}>☰</button>
                <button className={`${styles.headerButton} ${currentSubView === 'home' ? styles.activeHeaderButton : ''}`} onClick={() => { setCurrentSubView('home'); clearViewItems(); }}>Home</button>
                <button className={`${styles.headerButton} ${currentSubView === 'library' ? styles.activeHeaderButton : ''}`} onClick={() => { setCurrentSubView('library'); clearViewItems(); }}>Biblioteka</button>
                <button className={`${styles.headerButton} ${currentSubView === 'search' ? styles.activeHeaderButton : ''}`} onClick={() => { setCurrentSubView('search'); clearViewItems(); }}>Search</button>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <PoweredBySpotify />
                <MainBox currentView={currentSubView} setView={setCurrentSubView} />
                <button id={'queue-button'} className={styles.showQueueBtn} onClick={() => setQueueOpen(true)}>Pokaż kolejkę</button>
                <button className={`${styles.skipButton} ${votedToSkip ? styles.active : ''}`} onClick={handleSkip}>
                    <span className={`${styles.skipCount} ${votedToSkip ? styles.active : ''}`}>
                        {skipVotes !== 0 ? skipVotes : ''}
                    </span>
                    <SkipIcon alt="Skip" className={styles.skipIcon} />
                </button>
            </main>
        

            {/* Hidden Items */}

            {/* Sidebar wysuwany od boku */}
            <nav className={`${styles.sidebarNav} ${isSidebarOpen ? styles.active : ''}`}>
                <Sidebar />
            </nav>

            {/* Queuebar wysuwany od dołu */}
            <aside className={`${styles.queueContainer} ${isQueueOpen ? styles.active : ''}`}>
                <div className={styles.queueTopBar} onClick={() => setQueueOpen(false)}>━</div>
                <Queuebar />
            </aside>

            {/* gray overlay behind */}
            <div 
                className={`${styles.overlay} ${(isSidebarOpen || isQueueOpen) ? styles.active : ''}`} 
                onClick={() => { setSidebarOpen(false); setQueueOpen(false); }}
            />
            
        </div>
    );
}

export default UserView;