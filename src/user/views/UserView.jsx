import React, { useEffect, useState } from 'react';

import { useAuth } from '../../global/contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useParty } from '../../global/contexts/PartyContext';

import Sidebar from '../components/Sidebar/Sidebar';
import MainBox from '../components/Mainbox/MainBox';
import Queuebar from '../../global/components/Queuebar/Queuebar';
import styles from './UserView.module.css';

const UserView = ({ goBackToViewSelection }) => {
    
    const { user, authorized, login } = useAuth();
    const { queue, refreshUserQueue } = useUser();
    const { voteToSkip, votedToSkip } = useParty();

    const [currentSubView, setCurrentSubView] = useState('home');
    const [lastView, setLastView] = useState('home');
    const handleViewChange = (view) => {
        setLastView(currentSubView);
        setCurrentSubView(view);
    };

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isQueueOpen, setQueueOpen] = useState(false);

    useEffect(() => {
        refreshUserQueue();
    }, []);

    return (
        <div className={styles.container}>
            
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.sidebarBtn} onClick={() => setSidebarOpen(true)}>☰</button>
                <button className={`${styles.headerButton} ${currentSubView === 'home' ? styles.activeHeaderButton : ''}`} onClick={() => setCurrentSubView('home')}>Home</button>
                <button className={`${styles.headerButton} ${currentSubView === 'library' ? styles.activeHeaderButton : ''}`} onClick={() => setCurrentSubView('library')}>Biblioteka</button>
                <button className={`${styles.headerButton} ${currentSubView === 'search' ? styles.activeHeaderButton : ''}`} onClick={() => setCurrentSubView('search')}>Search</button>
                //only for tests
                <button className={`${styles.headerButton} ${votedToSkip ? styles.activeHeaderButton : ''}`} onClick={voteToSkip}>Skip</button>
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <MainBox userName={user.name} currentView={currentSubView} lastView={lastView} setView={handleViewChange} />
                <button className={styles.showQueueBtn} onClick={() => setQueueOpen(true)}>Pokaż kolejkę</button>
            </main>


            {/* Hidden Items */}

            {/* Sidebar wysuwany od boku */}
            <nav className={`${styles.sidebarNav} ${isSidebarOpen ? styles.active : ''}`}>
                <Sidebar onGoBack={goBackToViewSelection} />
            </nav>

            {/* Queuebar wysuwany od dołu */}
            <aside className={`${styles.queueContainer} ${isQueueOpen ? styles.active : ''}`}>
                <div className={styles.queueTopBar} onClick={() => setQueueOpen(false)}>━</div>
                <Queuebar queue={queue} />
            </aside>

            {/* gray box behind */}
            <div 
                className={`${styles.overlay} ${(isSidebarOpen || isQueueOpen) ? styles.active : ''}`} 
                onClick={() => { setSidebarOpen(false); setQueueOpen(false); }}
            />
        </div>
    );
}

export default UserView;