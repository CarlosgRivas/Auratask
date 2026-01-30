import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAndroidTimer } from './android';

describe('setAndroidTimer', () => {
    let originalLocation;

    beforeEach(() => {
        // Mock window.location
        // In JSDOM, window.location is read-only, so we need to redefine it or use a spy if possible.
        // Simple way: delete and redefine
        originalLocation = window.location;
        delete window.location;
        window.location = { href: '' };

        vi.useFakeTimers();
    });

    afterEach(() => {
        // Restore
        window.location = originalLocation;
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should assign correct intent URI to window.location.href', () => {
        const seconds = 300;
        const message = 'Test Task';

        setAndroidTimer(seconds, message);

        // Expected URI with launchFlags
        const expectedUri = `intent:#Intent;action=android.intent.action.SET_TIMER;launchFlags=0x10000000;i.android.intent.extra.alarm.LENGTH=${seconds};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(message)};end`;

        expect(window.location.href).toBe(expectedUri);
    });

    it('should encode special characters in message', () => {
        const seconds = 60;
        const message = 'Tarea con espacios y & símbolos';
        setAndroidTimer(seconds, message);

        const expectedMessage = encodeURIComponent(message);
        expect(window.location.href).toContain(`S.android.intent.extra.alarm.MESSAGE=${expectedMessage}`);
    });
});
