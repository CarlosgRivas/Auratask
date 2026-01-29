export const taskReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TASK': {
            const totalMs = (action.payload.totalMs)
                ? action.payload.totalMs
                : (action.payload.minutes || 0) * 60 * 1000;

            return [
                ...state,
                {
                    id: crypto.randomUUID(),
                    title: action.payload.title || 'Nueva Tarea',
                    initialTime: totalMs,
                    remainingTime: totalMs,
                    isRunning: false,
                    lastTickAt: null
                }
            ];
        }

        case 'DELETE_TASK':
            return state.filter(task => task.id !== action.payload);

        case 'UPDATE_TASK':
            return state.map(task =>
                task.id === action.payload.id
                    ? { ...task, ...action.payload.updates }
                    : task
            );

        case 'RESET_TIMER':
            return state.map(task =>
                task.id === action.payload
                    ? {
                        ...task,
                        remainingTime: task.initialTime,
                        isRunning: false,
                        lastTickAt: null
                    }
                    : task
            );

        case 'SYNC_TIMERS':
            // Called on valid ticks or init to update running timers
            const now = Date.now();
            return state.map(task => {
                if (task.isRunning) {
                    const delta = now - (task.lastTickAt || now);
                    // If delta is huge (app was suspended), we subtract it properly
                    const newRemaining = task.remainingTime - delta;

                    if (newRemaining <= 0) {
                        // Task finished
                        return {
                            ...task,
                            remainingTime: 0,
                            isRunning: false,
                            lastTickAt: null,
                            finishedAt: now // Flag to trigger side effects
                        };
                    }

                    return {
                        ...task,
                        remainingTime: newRemaining,
                        lastTickAt: now
                    };
                }
                return task;
            });

        case 'TOGGLE_TIMER':
            const nowTime = Date.now();
            return state.map(task => {
                if (task.id === action.payload) {
                    if (task.isRunning) {
                        // Pause
                        return {
                            ...task,
                            isRunning: false,
                            lastTickAt: null
                        };
                    } else {
                        // Start
                        if (task.remainingTime <= 0) return task; // Cannot start finished task without reset
                        return {
                            ...task,
                            isRunning: true,
                            lastTickAt: nowTime
                        };
                    }
                }
                return task;
            });

        case 'SET_INITIAL_TIME':
            return state.map(task => {
                if (task.id === action.payload.id) {
                    const newTime = action.payload.totalMs;
                    return {
                        ...task,
                        initialTime: newTime,
                        remainingTime: newTime, // Reset progress on edit
                        isRunning: false,
                        lastTickAt: null
                    };
                }
                return task;
            });

        case 'UPDATE_REMAINING_TIME':
            return state.map(task => {
                if (task.id === action.payload.id) {
                    const newRemaining = Math.max(0, Math.min(task.initialTime, action.payload.newUsageMs));
                    return {
                        ...task,
                        remainingTime: newRemaining,
                        // Stop if running? Maybe not, just adjust current time.
                        // But valid tick calculation needs lastTickAt reset or adjustment?
                        // Simple way: if running, we just update remainingTime, next tick will subtract delta from there.
                        // BUT lastTickAt is in the past. If we set remainingTime to X, next tick will do X - (now - lastTickAt).
                        // To avoid "instantly losing the time passed since last tick", we should probably reset lastTickAt to now if running.
                        lastTickAt: task.isRunning ? Date.now() : null
                    };
                }
                return task;
            });

        case 'IMPORT_TASKS':
            // Payload is a list of tasks (template). We need to create new IDs and reset state.
            return action.payload.map(t => ({
                id: crypto.randomUUID(),
                title: t.title,
                initialTime: t.initialTime,
                remainingTime: t.initialTime,
                isRunning: false,
                lastTickAt: null
            }));

        case 'MOVE_TASK': {
            const { fromIndex, toIndex } = action.payload;
            if (toIndex < 0 || toIndex >= state.length) return state;
            const newState = [...state];
            const [movedItem] = newState.splice(fromIndex, 1);
            newState.splice(toIndex, 0, movedItem);
            return newState;
        }

        case 'RESTORE_TASK':
            return state.map(task =>
                task.id === action.payload
                    ? {
                        ...task,
                        remainingTime: task.initialTime,
                        isRunning: false,
                        lastTickAt: null,
                        finishedAt: null
                    }
                    : task
            );

        case 'RESTORE_ALL_TASKS':
            return state.map(task =>
                (task.remainingTime <= 0 || task.finishedAt)
                    ? {
                        ...task,
                        remainingTime: task.initialTime,
                        isRunning: false,
                        lastTickAt: null,
                        finishedAt: null
                    }
                    : task
            );

        case 'SKIP_TASK':
            return state.map(task =>
                task.id === action.payload
                    ? {
                        ...task,
                        isRunning: false,
                        lastTickAt: null,
                        isSkipped: true,
                        skippedAt: Date.now()
                    }
                    : task
            );

        case 'RESTORE_SKIPPED_TASK':
            return state.map(task =>
                task.id === action.payload
                    ? {
                        ...task,
                        isSkipped: false,
                        skippedAt: null
                    }
                    : task
            );

        default:
            return state;
    }
};
