// Keys for AlarmClock:
const ACTION = 'android.intent.action.SET_TIMER';
const EXTRA_LENGTH = 'android.intent.extra.alarm.LENGTH';
const EXTRA_MESSAGE = 'android.intent.extra.alarm.MESSAGE';
// FLAG_ACTIVITY_NEW_TASK = 0x10000000 (268435456 in decimal)
const FLAG_NEW_TASK = '0x10000000';
const EXTRA_SKIP_UI = 'android.intent.extra.alarm.SKIP_UI';

export const setAndroidTimer = (seconds, message) => {
    // Construct the Intent URI
    // We remove skipUi for broad compatibility as strict permission checks might block it from web context.
    // Scheme: intent:#Intent;action=...;type=...;i.ExKey=intVal;S.ExKey=strVal;end

    // Note: No 'scheme' defined for SET_TIMER usually, it's action-based. 
    // We add a specific package 'com.google.android.deskclock' ONLY as a comment reference, 
    // we stick to generic action for compatibility (Samsung/Xiaomi clocks).
    // Modified to include launchFlags to help Chrome escape to native app.

    let intentUri = `intent:#Intent;action=${ACTION};`;
    intentUri += `launchFlags=${FLAG_NEW_TASK};`;
    intentUri += `i.${EXTRA_LENGTH}=${seconds};`;
    intentUri += `S.${EXTRA_MESSAGE}=${encodeURIComponent(message)};`;
    intentUri += `end`;

    // Feedback: Vibrate to confirm click (helping user know something happened)
    if (navigator.vibrate) {
        try { navigator.vibrate(200); } catch (e) { /* ignore */ }
    }

    // Method 2: Direct navigation (Standard for Chrome Android Intents)
    console.log(`Triggering Android Timer (v5 - Flags): ${seconds}s`);
    window.location.href = intentUri;
};
