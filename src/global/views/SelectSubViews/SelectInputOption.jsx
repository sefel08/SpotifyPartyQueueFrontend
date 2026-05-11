import { useState } from 'react';
import styles from './SelectSubView.module.css';

const SelectInputOption = ({ 
    mainTitle, 
    description, 
    placeholder = 'Wpisz...', 
    onSubmit,
    submitLabel = 'Dalej',
    inputType = 'text',
    validation = null 
}) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (validation) {
            const validationError = validation(inputValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        setError('');
        onSubmit(inputValue);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                {mainTitle && <h1 className={styles.mainTitle}>{mainTitle}</h1>}
                {description && <p className={styles.inputDescription}>{description}</p>}
                <input
                    type={inputType}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className={styles.inputField}
                />
                {error && <p className={styles.errorMessage}>{error}</p>}
                <button 
                    onClick={handleSubmit}
                    className={styles.submitButton}
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

export default SelectInputOption;
