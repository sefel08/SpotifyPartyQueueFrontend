import styles from './SelectView.module.css';

const SelectView = ({ setCurrentView }) => {

    return (
        <div className={styles.container}>
            <button 
                className={styles.card} 
                onClick={() => setCurrentView('player')}
            >
                <div className={styles.icon}>📻</div>
                <div className={styles.title}>Player</div>
                <div className={styles.description}>
                    Uruchom odtwarzacz i udostępniaj muzykę innym.
                </div>
            </button>

            <button 
                className={styles.card} 
                onClick={() => setCurrentView('user')}
            >
                <div className={styles.icon}>🎧</div>
                <div className={styles.title}>User</div>
                <div className={styles.description}>
                    Dołącz do aktywnego odtwarzacza i słuchaj razem.
                </div>
            </button>
        </div>
    );
};

export default SelectView;