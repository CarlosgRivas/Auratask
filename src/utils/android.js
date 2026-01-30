export const setAndroidTimer = (seconds, message) => {
    // Intent structure:
    // intent:#Intent;
    // scheme=android-app; (or no scheme, just action)
    // action=android.intent.action.SET_TIMER;
    // i.length=SECONDS;
    // S.message=MESSAGE;
    // B.skipUi=true; (optional, tries to skip UI confirmation)
    // end;

    // We use the 'intent:' scheme which is standard for invoking intents from Chrome on Android.
    const intentUri = `intent:#Intent;action=android.intent.action.SET_TIMER;i.length=${seconds};S.message=${encodeURIComponent(message)};B.skipUi=true;end`;

    // Create a temporary link and click it
    // This is safer than window.location.href for some pop-up blockers, though window.location usually works too for intents.
    const link = document.createElement('a');
    link.href = intentUri;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`Triggered Android Timer: ${seconds}s - "${message}"`);
};
