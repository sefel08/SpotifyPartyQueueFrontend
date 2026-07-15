import React, {useRef, useState} from 'react'
import style from './MainBox.module.css';

import { useUser } from '../../contexts/UserContext';

import SearchView from '../../views/subViews/SearchView';
import HomeView from '../../views/subViews/HomeView';
import LibraryView from '../../views/subViews/LibraryView';
import TrackContainerView from '../../views/subViews/TrackContainerView';

const MainBox = ({ currentView, setView }) => {

    const { selectedTrackContainer, setSelectedTrackContainer } = useUser();
    const mainBoxRef = useRef(null);

    return (
        <div className={style.mainContentArea} ref={mainBoxRef}>
            
            {selectedTrackContainer ? (
                <TrackContainerView onBack={() => setSelectedTrackContainer(null)} />
            ) : currentView === 'search' ? (
                <SearchView scrollRef={mainBoxRef} />
            ) : currentView === 'home' ? (
                <HomeView setView={setView} />
            ) : currentView === 'library' ? (
                <LibraryView />
            ) : (
                <div className={style.emptyView}>
                    Select a view from the top menu
                </div>
            )}
        </div>
    );
};

export default MainBox;