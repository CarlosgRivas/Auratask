// Keys for AlarmClock:
const ACTION = 'android.intent.action.SET_TIMER';
const EXTRA_LENGTH = 'android.intent.extra.alarm.LENGTH';
const EXTRA_MESSAGE = 'android.intent.extra.alarm.MESSAGE';
const EXTRA_SKIP_UI = 'android.intent.extra.alarm.SKIP_UI';

export const setAndroidTimer = (seconds, message) => {
    // Construct the Intent URI
    // We remove skipUi for broad compatibility as strict permission checks might block it from web context.
    // Scheme: intent:#Intent;action=...;type=...;i.ExKey=intVal;S.ExKey=strVal;end

    // Note: No 'scheme' defined for SET_TIMER usually, it's action-based. 
    // We add a specific package 'com.google.android.deskclock' ONLY as a comment reference, 
    // we stick to generic action for compatibility (Samsung/Xiaomi clocks).

    let intentUri = `intent:#Intent;action=${ACTION};`;
    intentUri += `i.${EXTRA_LENGTH}=${seconds};`;
    intentUri += `S.${EXTRA_MESSAGE}=${encodeURIComponent(message)};`;
    intentUri += `end`;

    // Method 2: Direct navigation (Standard for Chrome Android Intents)
    console.log(`Triggering Android Timer (v4) via location.href: ${seconds}s`);
    window.location.href = intentUri;
};
