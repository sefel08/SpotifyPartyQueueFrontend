import React, {useState} from 'react'
import SearchView from './SearchView';
import PlaylistDetailView from './PlaylistDetailView';

const MainBox = ({ currentView, selectedPlaylist, setView }) => {
    return (
        <div className="main-content-area">
            {currentView === 'search' ? (
                <SearchView onTrackClick={() => {}}/>
            ) : (
                <PlaylistDetailView 
                    selectedPlaylist={selectedPlaylist} 
                    onBack={() => setView('search')}
                    onTrackClick={() => {}} 
                />
            )}
        </div>
    );
};

export default MainBox;