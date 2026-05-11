import { useState } from 'react';
import styles from './SelectSubView.module.css';

const SelectCheckboxOption = ({ 
    mainTitle, 
    description,
    options,
    onSubmit,
    submitLabel = 'Akceptuj',
    minSelection = 0,
    maxSelection = null 
}) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [error, setError] = useState('');

    const handleCardClick = (id) => {
        setSelectedIds(prev => {
            const isSelected = prev.includes(id);
            
            // Check max selection limit
            if (!isSelected && maxSelection !== null && prev.length >= maxSelection) {
                setError(`Możesz wybrać maksymalnie ${maxSelection} opcji`);
                return prev;
            }
            
            setError('');
            
            if (isSelected) {
                return prev.filter(selectedId => selectedId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSubmit = () => {
        if (selectedIds.length < minSelection) {
            setError(`Musisz wybrać co najmniej ${minSelection} opcji`);
            return;
        }
        
        onSubmit(selectedIds);
    };

    return (
        <div className={styles.container}>
            <div className={styles.checkboxWrapper}>
                {mainTitle && <h1 className={styles.mainTitle}>{mainTitle}</h1>}
                {description && <p className={styles.checkboxDescription}>{description}</p>}
                
                <div className={styles.cardWrapper}>
                    {options && options.map((option) => (
                        <button 
                            key={option.id} 
                            className={`${styles.card} ${selectedIds.includes(option.id) ? styles.cardSelected : ''}`}
                            onClick={() => handleCardClick(option.id)}
                        >
                            {selectedIds.includes(option.id) && (
                                <div className={styles.checkbox}>✓</div>
                            )}
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
                
                {error && <p className={styles.errorMessage}>{error}</p>}
                
                <button 
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    disabled={selectedIds.length < minSelection}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

export default SelectCheckboxOption;
