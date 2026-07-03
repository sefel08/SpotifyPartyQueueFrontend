import React from 'react';
import styles from './Queuebar.module.css';
import TrackCard from '../TrackCard/TrackCard';
import { useUser } from '../../../user/contexts/UserContext';

const Queuebar = ({ queue = [] }) => {

    const { removeFromQueue } = useUser();

    return (
        <aside className={styles.container}>
            <div className={styles.scrollArea}>
                <h3 className={styles.title}>Kolejka</h3>
                {queue.length > 0 ? (
                    queue.map((track, index) => (
                        <TrackCard key={index} track={track} onClick={() => { removeFromQueue(index) }}/>
                    ))
                ) : (
                    <p style={{ color: 'var(--spotify-light-gray)', textAlign: 'center', fontSize: '1.25rem' }}>
                        Kolejka jest pusta
                    </p>
                )}
            </div>
        </aside>
    );
};

export default Queuebar;