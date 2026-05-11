import { useEffect, useState } from 'react';
import styles from './SelectView.module.css';

import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';

import SelectOptionGroup from './SelectSubViews/SelectOptionGroup';
import SelectInputOption from './SelectSubViews/SelectInputOption';
import SelectSliderOption from './SelectSubViews/SelectSliderOption';
import SelectCheckboxOption from './SelectSubViews/SelectCheckboxOption';
import { tr } from 'framer-motion/client';

const SelectView = () => {

    const { spotifyAuthorized, hasHostPermissions, isPremium, login, loginAsGuest } = useAuth();
    const { createPartySession, joinPartySession, createPartySessionAndJoin } = useParty();

    const [processing, setProcessing] = useState(false);

    // global states
    const [acceptedCookies, setAcceptedCookies] = useState(() => localStorage.getItem('acceptedCookies') === 'true' );
    const [operation, setOperation] = useState(null);
    const [joinAs, setJoinAs] = useState(null) // user / player / host
    
    // create states
    const [voteToSkipOption, setVoteToSkipOption] = useState(null);
    const [moreOrEqualOption, setMoreOrEqualOption] = useState(null);
    const [specifiedThreshold, setSpecifiedThreshold] = useState(-1);

    // join states
    const [isGuest, setIsGuest] = useState(false);
    const [nickname, setNickname] = useState(() => localStorage.getItem('nickname') || '' );
    const [enteredPartyId, setEnteredPartyId] = useState('');
    const [autoJoinTry, setAutoJoinTry] = useState(0); // 0 dont try 1 try, 2 tried

    // get search params to check if user is joining a party through invite link
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const invitePartyId = params.get('partyId');
        if (invitePartyId) {
            setOperation('join');
            setEnteredPartyId(invitePartyId);
            setJoinAs(['user']);
            setAutoJoinTry(1);
        }
    }, []);
    //auto join
    useEffect(() => {
        if ((operation === 'join' && enteredPartyId && joinAs.length !== 0 && (spotifyAuthorized || (isGuest && nickname.length > 3))) && autoJoinTry === 1) {
            setAutoJoinTry(2);
            handleParty();
        }
    }, [operation, joinAs, enteredPartyId, ]);

    const handleParty = async () => {
        if (!acceptedCookies) {
            alert("Musisz zaakceptować pliki cookie, aby korzystać z tej aplikacji.");
            return;
        }

        if (processing) return;
        setProcessing(true);

        const isUser = joinAs.includes('user');
        const isPlayer = joinAs.includes('player');
        const isHost = joinAs.includes('host');
        
        if (operation === 'create') {

            // if something goes wrong default is everyone can vote to skip
            const voteToSkip = !(voteToSkipOption === 'no');
            let percentVoting = false;
            let moreThanThreshold = true;
            let voteThreshold = 0;
            
            if (voteToSkipOption === 'everyone') {
                percentVoting = false;
                moreThanThreshold = true;
                voteThreshold = 0;
            }
            else if (voteToSkipOption === 'specifiedPercentage') {
                percentVoting = true;
                moreThanThreshold = moreOrEqualOption === 'more';
                voteThreshold = specifiedThreshold / 100;
            }
            else if (voteToSkipOption === 'specifiedNumber') {
                percentVoting = false;
                moreThanThreshold = moreOrEqualOption === 'more';
                voteThreshold = specifiedThreshold;
            }

            const partySettings = {
                voteToSkip,
                percentVoting,
                more: moreThanThreshold,
                voteThreshold,
            };
            await createPartySessionAndJoin(partySettings, isUser, isPlayer, isHost);
        
        } else if (operation === 'join') {

            localStorage.setItem('enteredPartyId', enteredPartyId);
            if (isGuest) {
                await loginAsGuest(nickname);
            }
            await joinPartySession(enteredPartyId, isUser, isPlayer, isHost);

        }

        setProcessing(false);
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

    // operation select
    if (!operation) {
        return (
            <SelectOptionGroup 
                options={[
                    { id: 'create', title: 'Utwórz party', description: 'Stwórz nowy pokój i zaproś znajomych.', icon: '🛠️' },
                    { id: 'join', title: 'Dołącz do party', description: 'Dołącz do istniejącego pokoju.', icon: '🎉' },
                ]}
                onSelect={(id) => {
                    setOperation(id);
                    if (id === 'join')
                        setJoinAs(['user']);
                }} 
            />
        );
    }

    if (operation === 'join') {
    
        // login or guest select
        if (!spotifyAuthorized && !isGuest) {
            return (<SelectOptionGroup 
                options={[
                    { id: 'login', title: 'Zaloguj się', description: 'Zaloguj się na swoje konto Spotify aby uzyskać dostęp do swoich playlist.', icon: '♕' },
                    { id: 'guest', title: 'Gość', description: 'Kontynuuj jako gość.', icon: '♙' },
                ]}
                onSelect={(id) => {
                    if (id === 'login') {
                        login();
                    } else if (id === 'guest') {
                        setIsGuest(true);
                    }
                }}
            />);
        }

        if (isGuest && !nickname) {
            return (
                <SelectInputOption
                    key="nickname-input"
                    mainTitle="Podaj swój nick"
                    description="Twój nick będzie widoczny dla innych przy dodawaniu piosenek do kolejki."
                    placeholder="Wpisz swój nick..."
                    submitLabel='Dalej'
                    validation={(value) => value.length < 3 ? "Minimum 3 znaki" : null}
                    onSubmit={(value) => {
                        setNickname(value);
                    }}
                />
            );
        }

        if ((spotifyAuthorized || nickname) && !enteredPartyId) {
            return (
                <SelectInputOption
                    key="party-code-input"
                    mainTitle="Wprowadź kod pokoju"
                    description="Wpisz kod z odtwarzacza poniżej, aby dołączyć do imprezy."
                    placeholder="Wpisz kod pokoju..."
                    submitLabel='Dołącz do imprezy'
                    onSubmit={(value) => {
                        setEnteredPartyId(value);
                    }}
                />
            );
        }

    } else if (operation === 'create') {

        if (!spotifyAuthorized) {
            return (
                <SelectOptionGroup 
                    options={[
                        { id: 'login', title: 'Zaloguj się', description: 'Zaloguj się przez Spotify, aby stworzyć pokój.', icon: '🔓' },
                    ]}
                    onSelect={(id) => {
                        if (id === 'login') {
                            login(true);
                        }
                    }}
                />
            );
        }

        if (!isPremium) {
            return (
                <div className={styles.container}>
                    <div className={styles.inputCard}>
                        <div className={styles.icon}>🚫</div>
                        <div className={styles.title}>Wymagane konto Premium</div>
                        <div className={styles.description}>Musisz posiadać konto Spotify Premium, aby stworzyć pokój i odtwarzać muzykę.</div>
                        <button className={styles.primaryButton} onClick={() => login(true)}>Zaloguj się z innym kontem</button>
                        <button className={styles.secondaryButton} onClick={() => window.location.reload()}>Powrót</button>
                    </div>
                </div>
            );
        }

        if (!voteToSkipOption) {
            return (
                <SelectOptionGroup 
                    options={[
                        { id: 'yes', title: 'Vote to skip', description: 'Zezwól innym użytkownikom na głosowanie aby pomijać utwory.', icon: '✅' },
                        { id: 'everyone', title: 'Zezwól wszystkim', description: 'Każdy użytkownik będzie mógł pomijać utwory bez głosowania.', icon: '👑' },
                        { id: 'no', title: 'Brak pomijania', description: 'Nie zezwalaj innym użytkownikom na pomijanie utworów.', icon: '❌' },
                    ]}
                    onSelect={(id) => {
                        setVoteToSkipOption(id);
                    }}
                />
            );
        }

        if (voteToSkipOption !== 'no' && voteToSkipOption !== 'everyone') {
            if (voteToSkipOption === 'yes') {
                return (
                    <SelectOptionGroup
                        options={[
                            { id: 'exactlyHalf', title: 'Połowa', description: 'Utwór zostanie pominięty jeśli połowa użytkowników zagłosuje za pominięciem.', icon: '½' },
                            { id: 'moreThanHalf', title: 'Więcej niż połowa', description: 'Utwór zostanie pominięty jeśli więcej niż połowa użytkowników zagłosuje za pominięciem.', icon: '👥' },
                            { id: 'everyone', title: 'Wszyscy', description: 'Utwór zostanie pominięty, gdy wszyscy użytkownicy zagłosują za pominięciem.', icon: '🌎' },
                            { id: 'custom', title: 'Niestandardowe ustawienia', description: 'Ustaw niestandardowe progi głosowania.', icon: '⚙️' },
                        ]}
                        onSelect={(id) => {
                            setVoteToSkipOption(id);
                        }}
                    />
                );
            }

            if (voteToSkipOption === 'custom') {
                return (
                    <SelectOptionGroup
                        options={[
                            { id: 'specifiedPercentage', title: 'Określony procent', description: 'Utwór zostanie pominięty jeśli określony procent użytkowników zagłosuje za pominięciem.', icon: '📊' },
                            { id: 'specifiedNumber', title: 'Określona liczba', description: 'Utwór zostanie pominięty, gdy zagłosują określona liczba użytkowników.', icon: '🔢' },
                        ]}
                        onSelect={(id) => {
                            setVoteToSkipOption(id);
                        }}
                    />
                );
            }

            if ((voteToSkipOption === 'specifiedPercentage' || voteToSkipOption === 'specifiedNumber') && !moreOrEqualOption) {
                return (
                    <SelectOptionGroup
                        options={[
                            { id: 'more', title: 'Więcej niż', description: `Utwór zostanie pominięty jeśli więcej niż określona liczba użytkowników zagłosuje za pominięciem.`, icon: '>' },
                            { id: 'equal', title: 'Równo', description: `Utwór zostanie pominięty jeśli równo, lub więcej użytkowników zagłosuje za pominięciem.`, icon: '=' },
                        ]}
                        onSelect={(id) => {
                            setMoreOrEqualOption(id);
                        }}
                    />
                );
            }

            if (voteToSkipOption === 'specifiedPercentage' && specifiedThreshold === -1) {
                return (
                    <SelectSliderOption
                        key="percentage-slider"
                        mainTitle="Procent użytkowników potrzebny do pominięcia utworu"
                        min={moreOrEqualOption === 'more' ? 0 : 1}
                        max={moreOrEqualOption === 'more' ? 99 : 100}
                        step={1}
                        unit="%"
                        initialValue={50}
                        onSubmit={(value) => {
                            setSpecifiedThreshold(value);
                        }}
                    />
                );
            }
            if (voteToSkipOption === 'specifiedNumber' && specifiedThreshold === -1) {
                return (
                    <SelectSliderOption
                        key="number-slider"
                        mainTitle="Liczba użytkowników potrzebna do pominięcia utworu"
                        min={moreOrEqualOption === 'more' ? 0 : 1}
                        max={20}
                        step={1}
                        unit=""
                        initialValue={50}
                        onSubmit={(value) => {
                            setSpecifiedThreshold(value);
                        }}
                    />
                );
            }
        }

        if (!joinAs) {
            return (
                <SelectCheckboxOption
                    mainTitle="Dołącz jako"
                    description="Wybierz role, które chcesz pełnić podczas imprezy na tym urządzeniu. Możesz dołączyć z innego urządzenia z inną rolą."
                    submitLabel='Dalej'
                    minSelection={1}
                    options={[
                        { id: 'user', title: 'Użytkownik', description: 'Dodawanie muzyki do kolejki i głosowanie na utwory.', icon: '👤' },
                        { id: 'player', title: 'Odtwarzacz', description: 'Odtwarzanie muzyki z tego urządzenia.', icon: '🎵' },
                        { id: 'host', title: 'Gospodarz', description: 'Zarządzanie użytkownikami i ustawieniami pokoju.', icon: '👑' },
                    ]}
                    onSubmit={(id) => {
                        setJoinAs(id);
                    }}
                />
            );
        }

        // end view
        return (
            <div className={styles.container}>
                <div className={styles.inputCard}>
                    <div className={styles.icon}>✅</div>
                    <div className={styles.title}>Wszystko gotowe!</div>
                    <div className={styles.description}>Kliknij poniższy przycisk, aby stworzyć pokój i rozpocząć imprezę!</div>
                    <button className={styles.primaryButton} onClick={handleParty} disabled={processing}>Stwórz pokój</button>
                </div>
            </div>
        );

    }

    
    // error fallback
    return (
        <div className={styles.container}>
            <h1>Something went wrong</h1>
        </div>
    )
};

export default SelectView;