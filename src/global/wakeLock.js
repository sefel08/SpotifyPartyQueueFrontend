let wakeLock = null;

export async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen Wake Lock ACTIVATED');
        } catch (err) {
            console.error(`Screen Wake Lock error: ${err.message}`);
        }
    } else {
        console.warn('Your browser does not support the Screen Wake Lock API.');
    }
}

export function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release()
            .then(() => {
                wakeLock = null;
                console.log('Screen Wake Lock DEACTIVATED');
            });
    }
}