import { useEffect, useState, useCallback } from 'react';
import styles from './SelectView.module.css';

import { useAuth } from '../contexts/AuthContext';
import { useParty } from '../contexts/PartyContext';

import SelectOptionGroup from './SelectSubViews/SelectOptionGroup';
import SelectInputOption from './SelectSubViews/SelectInputOption';
import SelectSliderOption from './SelectSubViews/SelectSliderOption';
import SelectCheckboxOption from './SelectSubViews/SelectCheckboxOption';
import SelectPlaylistOption from './SelectSubViews/SelectPlaylistOption';

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL

const SelectView = () => {

    const { spotifyAuthorized, hasHostPermissions, isPremium, login, loginAsGuest } = useAuth();
    const { createPartySession, joinPartySession, createPartySessionAndJoin, joinOwnPartySession } = useParty();

    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    // global states
    const [operation, setOperation] = useState(() => {
        const oldOperation = localStorage.getItem('operation');
        if (oldOperation) {
            localStorage.removeItem('operation');
            return oldOperation;
        }
        return null;
    });
    const [joinAs, setJoinAs] = useState(null) // user / player / host
    
    // create states
    const [voteToSkipOption, setVoteToSkipOption] = useState(null);
    const [instantSelfSkipOption, setInstantSelfSkipOption] = useState(null);
    const [moreOrEqualOption, setMoreOrEqualOption] = useState(null);
    const [specifiedThreshold, setSpecifiedThreshold] = useState(-1);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

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
        setLoading(false);
    }, []);
    //auto join
    useEffect(() => {
        if ((operation === 'join' && enteredPartyId && joinAs.length !== 0 && (spotifyAuthorized || (isGuest && nickname.length > 3))) && autoJoinTry === 1) {
            setAutoJoinTry(2);
            handleParty(operation, joinAs, enteredPartyId);
        }
    }, [operation, joinAs, enteredPartyId, nickname, spotifyAuthorized]);

    const handleParty = async (operation, joinAs, partyId = null, voteToSkipOption = null) => {
        if (processing) return;
        setProcessing(true);
        setLoading(true);

        const isUser = joinAs.includes('user');
        const isPlayer = joinAs.includes('player');
        const isHost = joinAs.includes('host');
        
        if (operation === 'create') {

            // if something goes wrong default is everyone can vote to skip
            const voteToSkip = !(voteToSkipOption === 'no');
            let percentVoting = false;
            let moreThanThreshold = true;
            let voteThreshold = 0;
            let instantSelfSkip = instantSelfSkipOption === 'yes';
            const fallbackPlaylistId = selectedPlaylistId === 'none' ? null : selectedPlaylistId;
            
            if (voteToSkipOption === 'everyone') {
                percentVoting = true;
                moreThanThreshold = false;
                voteThreshold = 1;
            }
            else if (voteToSkipOption === 'exactlyHalf') {
                percentVoting = true;
                moreThanThreshold = false;
                voteThreshold = 0.5;
            }
            else if (voteToSkipOption === 'moreThanHalf') {
                percentVoting = true;
                moreThanThreshold = true;
                voteThreshold = 0.5;
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
                moreThanThreshold,
                voteThreshold,
                instantSelfSkip,
                fallbackPlaylistId,
            };
            await createPartySessionAndJoin(partySettings, isUser, isPlayer, isHost);        
        } else if (operation === 'join') {
            if (!partyId) {
                console.warn("Didn't provide a party ID to join operation.");
                // this should never happen, but if it does, we can just reset the view and let user try again
                window.location.href = FRONTEND_URL;
                return;
            }
            localStorage.setItem('enteredPartyId', partyId);
            if (isGuest) {
                await loginAsGuest(nickname);
            }
            await joinPartySession(partyId, isUser, isPlayer, isHost);
        } else if (operation === 'joinOwn') {
            await joinOwnPartySession(isUser, isPlayer, isHost);            
        }

        setProcessing(false);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Ładowanie...</div>
            </div>
        );
    }

    // operation select
    if (!operation) {
        return (
            <SelectOptionGroup 
                options={[
                    { id: 'create', title: 'Utwórz party', description: 'Stwórz nowy pokój i zaproś znajomych.', icon: '🛠️' },
                    { id: 'join', title: 'Dołącz do party', description: 'Dołącz do istniejącego pokoju.', icon: '🎉' },
                    { id: 'joinOwn', title: 'Dołącz do własnego party', description: 'Dołącz do swojego pokoju, z inną rolą.', icon: '🚀' },
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
                        localStorage.setItem('operation', operation);
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
                        handleParty(operation, joinAs, value);
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
                            localStorage.setItem('operation', operation);
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
                        <button className={styles.primaryButton} onClick={() => window.location.href = FRONTEND_URL}>Powrót</button>
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

        if (instantSelfSkipOption === null) {
            return (
                <SelectOptionGroup 
                    options={[
                        { id: 'yes', title: 'Tak', description: 'Pozwól użytkownikom, którzy dodali utwór, na jego natychmiastowe pominięcie.', icon: '✅' },
                        { id: 'no', title: 'Nie', description: 'Nie pozwalaj na natychmiastowe pomijanie utworów przez użytkowników, którzy je dodali.', icon: '❌' },
                    ]}
                    onSelect={(id) => {
                        setInstantSelfSkipOption(id);
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

        if (!selectedPlaylistId) {
            return (
                <SelectPlaylistOption
                    mainTitle="Muzyka rezerwowa"
                    onSelect={(playlistId) => {
                        setSelectedPlaylistId(playlistId);
                    }}
                    onSkip={() => {
                        setSelectedPlaylistId("none");
                    }}
                />
            );
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
                    <button className={styles.primaryButton} onClick={() => handleParty(operation, joinAs, null, voteToSkipOption)} disabled={processing}>Stwórz pokój</button>
                </div>
            </div>
        );

    } else if (operation === 'joinOwn') {

        if (!spotifyAuthorized) {
            return (
                <SelectOptionGroup 
                    options={[
                        { id: 'login', title: 'Zaloguj się', description: 'Zaloguj się przez Spotify, aby dołączyć do własnego party.', icon: '🔓' },
                    ]}
                    onSelect={(id) => {
                        if (id === 'login') {
                            localStorage.setItem('operation', operation);
                            login(true);
                        }
                    }}
                />
            );
        }

        if (!joinAs) {
            return (
                <SelectCheckboxOption
                    mainTitle="Dołącz jako"
                    description="Wybierz role, które chcesz pełnić podczas imprezy na tym urządzeniu."
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

        return (
            <div className={styles.container}>
                <div className={styles.inputCard}>
                    <div className={styles.icon}>✅</div>
                    <div className={styles.title}>Wszystko gotowe!</div>
                    <div className={styles.description}>Kliknij poniższy przycisk, aby dołączyć do swojego pokoju z tego urządzenia.</div>
                    <button className={styles.primaryButton} onClick={() => handleParty(operation, joinAs)} disabled={processing}>Dołącz do pokoju</button>
                </div>
            </div>
        );

    }


    // error fallback
    return (
        <div className={styles.container}>
            <h1>Something went wrong<br/>Spróbuj odświeżyć stronę.</h1>
        </div>
    )
};

export default SelectView;