import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock Notification
global.Notification = {
    requestPermission: vi.fn(),
    permission: 'default'
};
global.window.Notification = global.Notification;

// Mock Audio
global.window.AudioContext = vi.fn().mockImplementation(() => ({
    createOscillator: () => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        type: 'sine'
    }),
    createGain: () => ({
        connect: vi.fn(),
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }
    }),
    destination: {},
    currentTime: 0
}));

describe('App Integration', () => {
    it('should allow full lifecycle of a task', async () => {
        vi.useFakeTimers();
        render(<App />);

        // 1. Add Task
        const input = screen.getByPlaceholderText('Nueva tarea...');
        fireEvent.change(input, { target: { value: 'Integration Task' } });

        const submitBtn = screen.getByText('+');
        fireEvent.click(submitBtn);

        expect(screen.getByText('Integration Task')).toBeInTheDocument();

        // 2. Start Timer
        const startBtn = screen.getByTitle('Iniciar');
        fireEvent.click(startBtn);

        // 3. Initally 25:00 (1500 sec)
        // Advance 1 second -> 24:59
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Wait for effect interval (200ms)
        act(() => {
            vi.advanceTimersByTime(200);
        });

        // 25 min = 25 * 60 = 1500 seconds. 
        // After 1 sec => 1499s => 24 min 59 sec.
        expect(screen.getByText('24:59')).toBeInTheDocument();

        // 4. Pause
        const pauseBtn = screen.getByTitle('Pausar');
        fireEvent.click(pauseBtn);

        // 5. Delete
        const deleteBtn = screen.getByTitle('Eliminar');
        fireEvent.click(deleteBtn);

        expect(screen.queryByText('Integration Task')).not.toBeInTheDocument();

        vi.useRealTimers();
    });
});
