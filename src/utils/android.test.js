import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAndroidTimer } from './android';

describe('setAndroidTimer (Alarm Mode)', () => {
    let originalLocation;

    beforeEach(() => {
        // Mock window.location
        originalLocation = window.location;
        delete window.location;
        window.location = { href: '' };

        vi.useFakeTimers();
    });

    afterEach(() => {
        window.location = originalLocation;
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should create an Alarm intent with correct target time', () => {
        // Setup fixed time: 2023-01-01 10:00:00
        const now = new Date(2023, 0, 1, 10, 0, 0);
        vi.setSystemTime(now);

        const seconds = 300; // 5 minutes
        const message = 'Test Alarm';

        setAndroidTimer(seconds, message);

        // Expected Target: 10:05
        const hour = 10;
        const minutes = 5;

        // Expected URI components
        // action=android.intent.action.SET_ALARM
        // launchFlags=0x10000000
        // i.android.intent.extra.alarm.HOUR=10
        // i.android.intent.extra.alarm.MINUTES=5
        // S.android.intent.extra.alarm.MESSAGE=...
        // B.android.intent.extra.alarm.SKIP_UI=true

        const expectedUri = `intent:#Intent;action=android.intent.action.SET_ALARM;launchFlags=0x10000000;i.android.intent.extra.alarm.HOUR=${hour};i.android.intent.extra.alarm.MINUTES=${minutes};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(message)};B.android.intent.extra.alarm.SKIP_UI=true;end`;

        expect(window.location.href).toBe(expectedUri);
    });

    it('should handle time rollover (next hour)', () => {
        // Setup: 10:55:00
        const now = new Date(2023, 0, 1, 10, 55, 0);
        vi.setSystemTime(now);

        const seconds = 600; // 10 minutes -> 11:05
        const message = 'Rollover Alarm';

        setAndroidTimer(seconds, message);

        const hour = 11;
        const minutes = 5;

        const expectedUri = `intent:#Intent;action=android.intent.action.SET_ALARM;launchFlags=0x10000000;i.android.intent.extra.alarm.HOUR=${hour};i.android.intent.extra.alarm.MINUTES=${minutes};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(message)};B.android.intent.extra.alarm.SKIP_UI=true;end`;

        expect(window.location.href).toBe(expectedUri);
    });
});
