import { useState } from 'react';
import styles from './SelectSubView.module.css';

const SelectSliderOption = ({ 
    mainTitle, 
    description, 
    min = 0,
    max = 100,
    step = 1,
    unit = '',
    initialValue,
    onSubmit,
    submitLabel = 'Dalej'
}) => {
    const [sliderValue, setSliderValue] = useState(initialValue ?? Math.floor((max + min) / 2));

    const handleSubmit = () => {
        onSubmit(Number(sliderValue));
    };

    return (
        <div className={styles.container}>
            <div className={styles.inputWrapper}>
                {mainTitle && <h1 className={styles.mainTitle}>{mainTitle}</h1>}
                {description && <p className={styles.inputDescription}>{description}</p>}
                
                <div className={styles.sliderDisplay}>
                    <span className={styles.sliderValue}>{sliderValue}</span>
                    {unit && <span className={styles.sliderUnit}>{unit}</span>}
                </div>

                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={sliderValue}
                    onChange={(e) => setSliderValue(e.target.value)}
                    className={styles.sliderInput}
                />

                <div className={styles.sliderRange}>
                    <span>{min}{unit}</span>
                    <span>{max}{unit}</span>
                </div>

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

export default SelectSliderOption;
