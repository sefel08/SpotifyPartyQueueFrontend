import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import MainBox from '../components/Mainbox/MainBox';
import Queuebar from '../../global/components/Queuebar/Queuebar';
import styles from './UserView.module.css';

const UserView = ({ goBackToViewSelection }) => {
    const [currentView, setCurrentView] = useState('search'); // 'search' lub 'playlist'
    const [selectedPlaylist, setSelectedPlaylistData] = useState(null);

    //queue
    const [queue, setQueue] = useState([]);

    const handlePlaylistSelect = (playlistData) => {
        setSelectedPlaylistData(playlistData);
        setCurrentView('playlist');
    };

    return (
        <div className={styles.container}>
            <nav className={styles.sidebarNav}>
                <Sidebar onPlaylistSelect={handlePlaylistSelect} onGoBack={goBackToViewSelection} />
            </nav>

            <main className={styles.mainContent}>
                <MainBox currentView={currentView} selectedPlaylist={selectedPlaylist} setView={setCurrentView} />
            </main>

            <aside className={styles.queueNav}>
                <Queuebar queue={queue} />
            </aside>
        </div>
    );
}

export default UserView;