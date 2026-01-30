// Keys for AlarmClock:
// We switched from SET_TIMER to SET_ALARM for better compatibility (v1.0.2)
const ACTION = 'android.intent.action.SET_ALARM';
const EXTRA_HOUR = 'android.intent.extra.alarm.HOUR';
const EXTRA_MINUTES = 'android.intent.extra.alarm.MINUTES';
const EXTRA_MESSAGE = 'android.intent.extra.alarm.MESSAGE';
const EXTRA_SKIP_UI = 'android.intent.extra.alarm.SKIP_UI';

// FLAG_ACTIVITY_NEW_TASK = 0x10000000 (268435456 in decimal)
const FLAG_NEW_TASK = '0x10000000';

export const setAndroidTimer = (seconds, message) => {
    // Calculate target time for the alarm
    const now = new Date();
    const targetTime = new Date(now.getTime() + (seconds * 1000));
    const hour = targetTime.getHours();
    const minutes = targetTime.getMinutes();

    // Construct the Intent URI
    let intentUri = `intent:#Intent;action=${ACTION};launchFlags=${FLAG_NEW_TASK};`;
    intentUri += `i.${EXTRA_HOUR}=${hour};`;
    intentUri += `i.${EXTRA_MINUTES}=${minutes};`;
    intentUri += `S.${EXTRA_MESSAGE}=${encodeURIComponent(message)};`;
    intentUri += `B.${EXTRA_SKIP_UI}=true;`; // Try to skip UI config and just set it
    intentUri += `end`;

    // Feedback: Vibrate to confirm click
    if (navigator.vibrate) {
        try { navigator.vibrate(200); } catch (e) { /* ignore */ }
    }

    // Direct navigation
    console.log(`Triggering Android Alarm (v1.0.2): ${hour}:${minutes} (${seconds}s)`);
    window.location.href = intentUri;
};
