import { useState } from 'react';
import styles from './SelectView.module.css';

const SelectView = ({ setCurrentView, setNavbarTabs }) => {

    const [selectedView, setSelectedView] = useState(null);
    const [hostOption, setHostOption] = useState(null);
    const [isBothUserAndPlayerSelected, setIsBothUserAndPlayerSelected] = useState(false);

    // primary view select
    if (!selectedView) {
        return (
            <div className={styles.container}>
                <button className={styles.card} onClick={() => setSelectedView('player')}>
                    <div className={styles.icon}>📻</div>
                    <div className={styles.title}>Player</div>
                    <div className={styles.description}>Zarządzaj odtwarzaniem muzyki, kolejką i ustawieniami pokoju.</div>
                </button>
                <button className={styles.card} onClick={() => setSelectedView('user')}>
                    <div className={styles.icon}>🎧</div>
                    <div className={styles.title}>User</div>
                    <div className={styles.description}>Zarządzaj ustawieniami konta, preferencjami i historią odtwarzania.</div>
                </button>
            </div>
        );
    }

    // player view
    if (selectedView === 'player') {
        
        if (!hostOption) {
            return (
                <div className={styles.container}>
                    <button className={styles.card} onClick={() => setHostOption('remote')}>
                        <div className={styles.icon}>📱</div>
                        <div className={styles.title}>Host zdalny</div>
                        <div className={styles.description}>Stwórz pokój i zarządzaj nim z innego urządzenia.</div>
                    </button>
                    <button className={styles.card} onClick={() => setHostOption('local')}>
                        <div className={styles.icon}>📻</div>
                        <div className={styles.title}>Host na tym urządzeniu</div>
                        <div className={styles.description}>Stwórz pokój i zarządzaj nim z tego urządzenia.</div>
                    </button>
                    <button className={styles.card} onClick={() => setHostOption('none')}>
                        <div className={styles.icon}>🚫</div>
                        <div className={styles.title}>Bez hosta</div>
                        <div className={styles.description}>Stwórz pokój bez hosta.</div>
                    </button>
                </div>
            );
        }

        if (!isBothUserAndPlayerSelected) {
            return (
                <div className={styles.container}>
                    <button className={styles.card} onClick={() => setIsBothUserAndPlayerSelected(true)}>
                        <div className={styles.icon}>📻🎧</div>
                        <div className={styles.title}>Player i User</div>
                        <div className={styles.description}>Zostań wlaścicielem pokoju i dołącz jednocześnie z tego urządzenia.</div>
                    </button>
                    <button className={styles.card} onClick={() => setIsBothUserAndPlayerSelected(false)}>
                        <div className={styles.icon}>📻</div>
                        <div className={styles.title}>Tylko Player</div>
                        <div className={styles.description}>Tylko stwórz pokój</div>
                    </button>
                </div>
            );
        }


        
        return (
            <div className={styles.container}>
                <h2>Wybrałeś: {selectedView}. Czy to wszystko?</h2>
                <button onClick={() => setIsBothUserAndPlayerSelected(true)}>Tak, przejdź dalej</button>
                <button onClick={() => setSelectedView(null)}>Wróć</button>
            </div>
        );
    }


    return (
        <p>END</p>
    )
};

export default SelectView;