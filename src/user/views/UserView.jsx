import React, { useState } from 'react';
import { useAuth } from '../../global/contexts/AuthContext';
import UserProfile from '../../global/components/UserProfile/UserProfile';
import Sidebar from '../components/Sidebar/Sidebar';
import MainBox from '../components/Mainbox/MainBox';
import Queuebar from '../../global/components/Queuebar/Queuebar';
import styles from './UserView.module.css';
import default_avatar_image from '../../assets/spotify_icon.png';
import Navbar from '../../global/components/Navbar/Navbar';

const UserView = ({ goBackToViewSelection }) => {
    const { user, authorized, login } = useAuth();
    
    const [currentView, setCurrentView] = useState('home');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isQueueOpen, setQueueOpen] = useState(false);
    
    const [selectedPlaylist, setSelectedPlaylistData] = useState(null);

    //queue
    const [queue, setQueue] = useState([]);

    const handlePlaylistSelect = (playlistData) => {
        setSelectedPlaylistData(playlistData);
        setCurrentView('playlist');
    };

    return (
        <div className={styles.container}>
            
            {/* Header */}
            <header className={styles.header}>
                <button className={styles.triggerBtn} onClick={() => setSidebarOpen(true)}>☰</button>
                <button className={styles.headerButton} onClick={() => setCurrentView('home')}>Home</button>
                <button className={styles.headerButton} onClick={() => setCurrentView('library')}>Biblioteka</button>
                <button className={styles.headerButton} onClick={() => setCurrentView('search')}>Search</button>
                {/* <button className={styles.triggerBtn} onClick={() => setSidebarOpen(true)}>☷</button> */}
            </header>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <MainBox currentView={currentView} selectedPlaylist={selectedPlaylist} setView={setCurrentView} />
                <button className={styles.showQueueBtn} onClick={() => setQueueOpen(true)}>Pokaż kolejkę</button>
            </main>

            <Navbar tabs={["Player", "Home", "Settings", "Party"]}/>

            {/* Hidden Items */}

            {/* Sidebar wysuwany od boku */}
            <nav className={`${styles.sidebarNav} ${isSidebarOpen ? styles.active : ''}`}>
                <Sidebar onPlaylistSelect={(p) => { handlePlaylistSelect(p); setSidebarOpen(false); }} onGoBack={goBackToViewSelection} />
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