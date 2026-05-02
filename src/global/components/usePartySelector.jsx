import { useSyncExternalStore } from 'react';
import { partyStore } from '../stores/PartyStore';

export function usePartySelector(selector) {
    return useSyncExternalStore(
        partyStore.subscribe,
        () => selector(partyStore.getSnapshot())
    );
}