import React, {useState} from 'react'
import SearchView from '../../views/subViews/SearchView';
import PlaylistDetailView from '../../views/subViews/PlaylistDetailView';

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