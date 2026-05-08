import styles from './SelectSubView.module.css';

const SelectOptionGroup = ({ mainTitle, options, onSelect }) => {
    return (
        <div className={styles.container}>
            {mainTitle && <h1 className={styles.mainTitle}>{mainTitle}</h1>}
            <div className={styles.cardWrapper}>
                {options && options.map((option) => (
                    <button 
                        key={option.id} 
                        className={styles.card} 
                        onClick={() => onSelect(option.id)}
                    >
                        {option.icon && <div className={styles.icon}>{option.icon}</div>}
                        <div className={styles.textWrapper}>
                            <div className={styles.title}>{option.title}</div>
                            {option.description && (
                                <div className={styles.description}>{option.description}</div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SelectOptionGroup;