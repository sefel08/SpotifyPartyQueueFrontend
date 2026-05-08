import { useEffect, useState } from 'react';
import styles from './SelectView.module.css';
import Slider from '../components/Slider/Slider';
import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';
import SelectOptionGroup from './SelectSubViews/SelectOptionGroup';

const SelectView = () => {

    const { spotifyAuthorized, login, loginAsGuest } = useAuth();
    const { createPartySession, joinPartySession, createPartySessionAndJoin } = useParty();

    // global states
    const [processing, setProcessing] = useState(false);
    const [acceptedCookies, setAcceptedCookies] = useState(() => localStorage.getItem('acceptedCookies') === 'true' );
    const [selectedView, setSelectedView] = useState(null);
    
    // player view states
    const [hostOption, setHostOption] = useState(null);
    const [anotherView, setAnotherView] = useState(null);
    const [voteToSkipOption, setVoteToSkipOption] = useState(null);
    const [specifiedPercentage, setSpecifiedPercentage] = useState(-1);
    const [specifiedNumber, setSpecifiedNumber] = useState(-1);

    // user view states
    const [isGuest, setIsGuest] = useState(false);
    const [nickname, setNickname] = useState(() => localStorage.getItem('nickname') || '' );
    const [nicknameSubmitted, setNicknameSubmitted] = useState(false);
    const [enteredPartyId, setEnteredPartyId] = useState('');
    const [autoJoinTry, setAutoJoinTry] = useState(0); // 0 dont try 1 try, 2 tried

    // get search params to check if user is joining a party through invite link
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const invitePartyId = params.get('partyId');
        if (invitePartyId) {
            setSelectedView('user');
            setEnteredPartyId(invitePartyId);
            setAutoJoinTry(1);
        }
        setIsGuest(false);
        setNicknameSubmitted(false);
    }, []);
    //auto join
    useEffect(() => {
        if ((selectedView === 'user' && enteredPartyId && (spotifyAuthorized || (isGuest && nicknameSubmitted))) && autoJoinTry === 1) {
            setAutoJoinTry(2);
            handleParty();
        }
    }, [selectedView, enteredPartyId]);

    const handleParty = async () => {
        if (!acceptedCookies) {
            alert("Musisz zaakceptować pliki cookie, aby korzystać z tej aplikacji.");
            return;
        }

        if (processing) return;
        setProcessing(true);

        const isUser = selectedView === 'user' || (selectedView === 'player' && anotherView === 'both');
        const isPlayer = selectedView === 'player';
        const isHost = false;
        
        if (selectedView === 'player') {

            const partySettings = {
                voteToSkip: !!voteToSkipOption,
                percentVoting: voteToSkipOption === 'specifiedPercentage',
                voteThreshold: voteToSkipOption === 'specifiedPercentage' ? specifiedPercentage / 100 : voteToSkipOption === 'specifiedNumber' ? specifiedNumber : 0,
            };
            await createPartySessionAndJoin(partySettings, isUser, isPlayer, isHost);
        
        } else if (selectedView === 'user') {

            localStorage.setItem('enteredPartyId', enteredPartyId);
            if (isGuest) {
                await loginAsGuest(nickname);
            }
            await joinPartySession(enteredPartyId, isUser, isPlayer, isHost);

        }

        setProcessing(false);
    }
    const handleNicknameSubmit = () => {
        if (nickname.trim().length < 3) {
            alert("Nick musi mieć co najmniej 3 znaki.");
            return;
        }

        localStorage.setItem('nickname', nickname);
        setNicknameSubmitted(true);
        
        // If user came from invite link, automatically join the party after submitting nickname
        if (enteredPartyId) {
            handleParty();
        }
    }

    // cookie consent
    if (!acceptedCookies) {
        return (<SelectOptionGroup 
            options={[
                { id: 'accept', title: 'Akceptuję pliki cookie', description: 'Ta aplikacja używa plików cookie do poprawnego działania. Kontynuując, zgadzasz się na naszą politykę prywatności.', icon: '🍪' },
                { id: 'decline', title: 'Odrzucam pliki cookie', description: 'Nie możesz korzystać z tej aplikacji bez akceptacji plików cookie.', icon: '🚫' },
            ]}
            onSelect={(id) => {
                if (id === 'accept') {
                    setAcceptedCookies(true);
                    localStorage.setItem('acceptedCookies', 'true');
                } else if (id === 'decline') {
                    alert('Musisz zaakceptować pliki cookie, aby korzystać z tej aplikacji.');
                }
            }} 
        />);
    }

    // primary view select
    if (!selectedView) {
        return (
            <div className={styles.container}>
                <div className={styles.cardWrapper}>
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
            </div>
        );
    }

    // player view
    if (selectedView === 'player') {

        if (!spotifyAuthorized) {
            return (
                <div className={styles.container}>
                    <div className={styles.cardWrapper}>
                        <button className={styles.card} onClick={() => login(true)}>
                            <div className={styles.icon}>🔓</div>
                            <div className={styles.title}>Zaloguj się</div>
                            <div className={styles.description}>Zaloguj się przez Spotify, aby stworzyć pokój.</div>
                        </button>
                    </div>
                </div>
            );
        }

        if (!hostOption) {
            return (
                <div className={styles.container}>
                    <div className={styles.cardWrapper}>
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
                </div>
            );
        }

        //TODO add remote host connection logic
        if (hostOption === 'remote') {

        }

        if (!anotherView) {
            return (
                <div className={styles.container}>
                    <div className={styles.cardWrapper}>
                        <button className={styles.card} onClick={() => setAnotherView('both')}>
                            <div className={styles.icon}>📻🎧</div>
                            <div className={styles.title}>Player i User</div>
                            <div className={styles.description}>Zostań wlaścicielem pokoju i dołącz jednocześnie z tego urządzenia.</div>
                        </button>
                        <button className={styles.card} onClick={() => setAnotherView('none')}>
                            <div className={styles.icon}>📻</div>
                            <div className={styles.title}>Tylko Player</div>
                            <div className={styles.description}>Tylko stwórz pokój</div>
                        </button>
                    </div>
                </div>
            );
        }

        if (!voteToSkipOption) {
            return (
                <div className={styles.container}>
                    <div className={styles.cardWrapper}>
                        <button className={styles.card} onClick={() => setVoteToSkipOption('yes')}>
                            <div className={styles.icon}>✅</div>
                            <div className={styles.title}>Vote to skip</div>
                            <div className={styles.description}>Zezwól innym użytkownikom na głosowanie aby pomijać utwory.</div>
                        </button>
                        <button className={styles.card} onClick={() => setVoteToSkipOption('no')}>
                            <div className={styles.icon}>❌</div>
                            <div className={styles.title}>Brak głosowania</div>
                            <div className={styles.description}>Nie zezwalaj innym użytkownikom na głosowanie nad pomijaniem utworów.</div>
                        </button>
                    </div>
                </div>
            );
        }

        if (voteToSkipOption === 'yes') {
            return (
                <div className={styles.container}>
                    <div className={styles.cardWrapper}>
                        <button className={styles.card} onClick={() => { 
                                setVoteToSkipOption('specifiedPercentage');
                                setSpecifiedPercentage(50);
                            }}>
                            <div className={styles.icon}>👥</div>
                            <div className={styles.title}>Więcej niż połowa</div>
                            <div className={styles.description}>Utwór zostanie pominięty jeśli więcej niż połowa użytkowników zagłosuje za pominięciem.</div>
                        </button>
                        <button className={styles.card} onClick={() => setVoteToSkipOption('specifiedPercentage')}>
                            <div className={styles.icon}>📊</div>
                            <div className={styles.title}>Określony procent</div>
                            <div className={styles.description}>Utwór zostanie pominięty jeśli określony procent użytkowników zagłosuje za pominięciem.</div>
                        </button>
                        <button className={styles.card} onClick={() => setVoteToSkipOption('specifiedNumber')}>
                            <div className={styles.icon}>🔢</div>
                            <div className={styles.title}>Określona liczba</div>
                            <div className={styles.description}>Utwór zostanie pominięty, gdy zagłosują określona liczba użytkowników.</div>
                        </button>
                    </div>
                </div>
            );
        }

        if (voteToSkipOption === 'specifiedPercentage' && specifiedPercentage === -1) {
            return (
                <div className={styles.container}>
                    <div className={styles.inputCard}>
                        <Slider
                            title="Procent użytkowników potrzebny do pominięcia utworu"
                            min={0}
                            max={100}
                            step={1}
                            unit="%"
                            initialValue={50}
                            onConfirm={(value) => setSpecifiedPercentage(value)}
                        />
                    </div>
                </div>
            );
        }
        if (voteToSkipOption === 'specifiedNumber' && specifiedNumber === -1) {
            return (
                <div className={styles.container}>
                    <div className={styles.inputCard}>
                        <Slider
                            title="Liczba użytkowników potrzebna do pominięcia utworu"
                            min={1}
                            max={100}
                            step={1}
                            unit=""
                            initialValue={50}
                            onConfirm={(value) => setSpecifiedNumber(value)}
                        />
                    </div>
                </div>
            );
        }

        // if all options selected show create button
        return (
            <div className={styles.container}>
                <div className={styles.inputCard}>
                    <div className={styles.icon}>✅</div>
                    <h2 className={styles.title}>Wszystko gotowe!</h2>
                    <p className={styles.description}>Kliknij poniższy przycisk, aby stworzyć pokój i rozpocząć imprezę!</p>
                    <button className={styles.primaryButton} onClick={handleParty} disabled={processing}>
                        Stwórz pokój
                    </button>
                </div>
            </div>
        );
    }
    
    // user view
    if (selectedView === 'user') {
        
        if (!spotifyAuthorized && !isGuest) {
            return (
                <div className={styles.container}>
                    <div className={styles.cardWrapper}>
                        <button className={styles.card} onClick={() => login()}>
                            <div className={styles.icon}>♕</div>
                            <div className={styles.title}>Zaloguj się</div>
                            <div className={styles.description}>Zaloguj się na swoje konto Spotify aby uzyskać dostęp do swoich playlist.</div>
                        </button>
                        <button className={styles.card} onClick={() => setIsGuest(true)}>
                            <div className={styles.icon}>♙</div>
                            <div className={styles.title}>Gość</div>
                            <div className={styles.description}>Kontynuuj jako gość bez logowania się na konto Spotify.</div>
                        </button>
                    </div>
                </div>
            );
        }

        if (isGuest && !nicknameSubmitted) {
            return (
                <div className={styles.container}>
                    <div className={styles.inputCard}>
                        <div className={styles.icon}>👤</div>
                        <h2 className={styles.title}>Podaj swój nick</h2>
                        <p className={styles.description}>
                            Twój nick będzie widoczny dla innych przy dodawaniu piosenek do kolejki.
                        </p>
                        
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                className={styles.inputBox}
                                placeholder="Wpisz swój nick..."
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNicknameSubmit()}
                                maxLength={20}
                            />
                            <span className={styles.charCount}>{nickname.length}/20</span>
                        </div>

                        <button 
                            className={styles.primaryButton} 
                            onClick={handleNicknameSubmit}
                            disabled={nickname.trim().length < 3}
                        >
                            Dołącz do imprezy
                        </button>
                    </div>
                </div>
            );
        }

        if (spotifyAuthorized || nicknameSubmitted) {
            return (
                <div className={styles.container}>
                    <div className={styles.inputCard}>
                        <div className={styles.icon}></div>
                        <h2 className={styles.title}>Wprowadź kod pokoju</h2>
                        <p className={styles.description}>
                            Wpisz kod z odtwarzacza poniżej, aby dołączyć do imprezy.
                        </p>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                className={styles.inputBox}
                                placeholder="Wpisz kod pokoju..."
                                value={enteredPartyId}
                                onChange={(e) => setEnteredPartyId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleParty()}
                            />
                        </div>

                        <button 
                            className={styles.primaryButton} 
                            onClick={handleParty}
                            disabled={enteredPartyId.trim().length === 0 || processing}
                        >
                            Dołącz do imprezy
                        </button>
                    </div>
                </div>
            );
        }

    }

    return (
        <div className={styles.container}>
            <h1>Something went wrong</h1>
        </div>
    )
};

export default SelectView;