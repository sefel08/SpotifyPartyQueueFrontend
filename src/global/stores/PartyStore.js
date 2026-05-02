class PartyStore {
    constructor() {
        this.state = {
            partyQueueVersion: 0,
            partyUsersVersion: 0,
        }
        this.listeners = new Set();
    }

    subscribe = (listener) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    getSnapshot = () => this.state;

    notify = (key, value = null) => {
        this.state = {
            ...this.state,
            [key]: value,
            ...(key === 'partyQueue' && { partyQueueVersion: this.state.partyQueueVersion + 1 }),
            ...(key === 'partyUsers' && { partyUsersVersion: this.state.partyUsersVersion + 1 }),
        };
        this.listeners.forEach(listener => listener());
    }
}

export const partyStore = new PartyStore();