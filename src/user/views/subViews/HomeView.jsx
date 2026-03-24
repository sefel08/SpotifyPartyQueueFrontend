import React from 'react';
import styles from './SubViewsStyle.module.css';

const HomeView = ({ userName = "Użytkowniku" }) => {
    const quickPicks = ["Daily Mix 1", "Odkryj w tym tygodniu", "Polskie Hity", "Chillout"];

    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Dzień dobry, {userName}</h1>
            
            <div className={styles.grid}>
                {quickPicks.map((item, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardImagePlaceholder}></div>
                        <span className={styles.cardTitle}>{item}</span>
                    </div>
                ))}
            </div>

            <h2 className={styles.subHeader}>Wybrane dla Ciebie</h2>
            <p style={{color: '#b3b3b3', marginBottom: '1rem'}}>Twoje osobiste zestawienie utworów.</p>
        </div>
    );
};

export default HomeView;