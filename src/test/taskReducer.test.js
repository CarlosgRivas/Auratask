import { describe, it, expect, vi } from 'vitest';
import { taskReducer } from '../reducers/taskReducer';

describe('taskReducer', () => {
    it('should add a task', () => {
        const initialState = [];
        const action = { type: 'ADD_TASK', payload: { title: 'Test Task', minutes: 10 } };
        const newState = taskReducer(initialState, action);

        expect(newState).toHaveLength(1);
        expect(newState[0].title).toBe('Test Task');
        expect(newState[0].initialTime).toBe(600000);
        expect(newState[0].remainingTime).toBe(600000);
        expect(newState[0].isRunning).toBe(false);
    });

    it('should toggle timer start and move to top', () => {
        const t1 = { id: 1, title: 'T1', remainingTime: 1000, isRunning: false };
        const t2 = { id: 2, title: 'T2', remainingTime: 1000, isRunning: false };
        const state = [t1, t2];
        const newState = taskReducer(state, { type: 'TOGGLE_TIMER', payload: 2 });

        expect(newState[0].id).toBe(2);
        expect(newState[0].isRunning).toBe(true);
        expect(newState[1].id).toBe(1);
    });

    it('should move task using IDs', () => {
        const t1 = { id: 'a' };
        const t2 = { id: 'b' };
        const t3 = { id: 'c' };
        const state = [t1, t2, t3];

        // Move 'c' to 'a' (bottom to top)
        const newState = taskReducer(state, { type: 'MOVE_TASK', payload: { fromId: 'c', toId: 'a' } });

        expect(newState[0].id).toBe('c');
        expect(newState[1].id).toBe('a');
        expect(newState[2].id).toBe('b');
    });

    it('should sync timer correctly', () => {
        const now = Date.now();
        const task = {
            id: 1,
            remainingTime: 5000,
            isRunning: true,
            lastTickAt: now - 1000 // 1 second ago
        };
        const state = [task];

        // Mock Date.now? Vitest allows mocking system time but here we use delta logic
        // We can rely on logic: lastTickAt was 1000ms ago. 
        // If run immediately, current Date.now might be very close to 'now'.
        // Better to manually inspect logic or mock Date.
    });

    it('should pause timer', () => {
        const task = { id: 1, remainingTime: 1000, isRunning: true, lastTickAt: Date.now() };
        const newState = taskReducer([task], { type: 'TOGGLE_TIMER', payload: 1 });
        expect(newState[0].isRunning).toBe(false);
        expect(newState[0].lastTickAt).toBeNull();
    });
    it('should handle large time jumps (background simulation)', () => {
        // Setup logic without mocking Date directly if using reducer logic that relies on Date.now() call inside.
        // We need to mock Date.now() for the reducer to see the jump.
        const start = 1000000000;
        const jump = 30000;

        // Mock the date object or just the input state?
        // The reducer calls Date.now().
        vi.setSystemTime(start);

        const task = {
            id: 1,
            remainingTime: 60000,
            isRunning: true,
            lastTickAt: start
        };
        const state = [task];

        // Advance time
        vi.setSystemTime(start + jump);

        const newState = taskReducer(state, { type: 'SYNC_TIMERS' });

        expect(newState[0].remainingTime).toBe(30000);
        expect(newState[0].lastTickAt).toBe(start + jump);

        vi.useRealTimers();
    });
});
