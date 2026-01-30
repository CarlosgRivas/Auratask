import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAndroidTimer } from './android';

describe('setAndroidTimer', () => {
    let appendChildSpy;
    let removeChildSpy;
    let clickSpy;
    let createElementSpy;

    beforeEach(() => {
        // Mock document methods
        appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => { });
        removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => { });

        // Mock link element
        const mockLink = {
            click: vi.fn(),
            style: {},
            href: ''
        };
        clickSpy = mockLink.click;

        createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);

        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should create an anchor tag with correct intent URI and click it', () => {
        const seconds = 300;
        const message = 'Test Task';

        setAndroidTimer(seconds, message);

        // Verify creation
        expect(createElementSpy).toHaveBeenCalledWith('a');

        // Verify URI construction
        // Expected: intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.alarm.LENGTH=300;S.android.intent.extra.alarm.MESSAGE=Test%20Task;end
        const expectedUri = `intent:#Intent;action=android.intent.action.SET_TIMER;i.android.intent.extra.alarm.LENGTH=${seconds};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(message)};end`;

        // We need to access the spy's returned value (the mockLink) to check its href
        // But we didn't save the reference easily in the test body, but we know createElement returned it.
        const mockLink = createElementSpy.mock.results[0].value;
        expect(mockLink.href).toBe(expectedUri);
        expect(mockLink.style.display).toBe('none');

        // Verify appending to body
        expect(appendChildSpy).toHaveBeenCalledWith(mockLink);

        // Verify click
        expect(clickSpy).toHaveBeenCalled();

        // Verify cleanup after timeout
        expect(removeChildSpy).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100);
        expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it('should encoding special characters in message', () => {
        const seconds = 60;
        const message = 'Tarea con espacios y & símbolos';
        setAndroidTimer(seconds, message);

        const mockLink = createElementSpy.mock.results[0].value;
        const expectedMessage = encodeURIComponent(message);
        expect(mockLink.href).toContain(`S.android.intent.extra.alarm.MESSAGE=${expectedMessage}`);
    });
});
