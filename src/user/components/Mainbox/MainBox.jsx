import React, {useState} from 'react'
import SearchView from '../../views/subViews/SearchView';
import HomeView from '../../views/subViews/HomeView';
import LibraryView from '../../views/subViews/LibraryView';
import PlaylistDetailView from '../../views/subViews/PlaylistDetailView';

const MainBox = ({ currentView, selectedPlaylist, setView }) => {
    return (
        <div className="main-content-area">
            {currentView === 'search' ? (
                <SearchView onTrackClick={() => {}}/>
            ) : currentView === 'home' ? (
                <HomeView userName="Użytkowniku"/>
            ) : currentView === 'library' ? (
                <LibraryView savedTracks={[]} onTrackClick={() => {}}/>
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