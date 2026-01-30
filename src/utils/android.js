export const setAndroidTimer = (seconds, message) => {
    // Intent structure:
    // intent:#Intent;
    // scheme=android-app; (or no scheme, just action)
    // action=android.intent.action.SET_TIMER;
    // i.length=SECONDS;
    // S.message=MESSAGE;
    // B.skipUi=true; (optional, tries to skip UI confirmation)
    // end;

    // Correct Keys for AlarmClock.ACTION_SET_TIMER:
    // android.intent.extra.alarm.LENGTH (int)
    // android.intent.extra.alarm.MESSAGE (String)
    // android.intent.extra.alarm.SKIP_UI (boolean)

    // URI encoding:
    // i.KEY=VALUE (integer)
    // S.KEY=VALUE (string)
    // B.KEY=VALUE (boolean)

    const intentUri = `intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.alarm.LENGTH=${seconds};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(message)};B.android.intent.extra.alarm.SKIP_UI=true;end`;

    // Try standard assignment. Hidden link click sometimes fails in recent Android webviews if not direct user tap.
    // But since this is called from an onClick handler, window.location might be more robust.
    window.location.href = intentUri;

    console.log(`Triggered Android Timer (v2): ${seconds}s - "${message}"`);
};
