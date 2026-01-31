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

        case 'TOGGLE_TIMER': {
            const nowTime = Date.now();
            const taskIndex = state.findIndex(t => t.id === action.payload);
            if (taskIndex === -1) return state;

            const task = state[taskIndex];

            if (task.isRunning) {
                // Pause
                return state.map(t => t.id === action.payload ? {
                    ...t,
                    isRunning: false,
                    lastTickAt: null
                } : t);
            } else {
                // Start
                if (task.remainingTime <= 0) return state; // Cannot start finished task

                // Move to top and start
                const newState = [...state];
                const [taskToMove] = newState.splice(taskIndex, 1);

                const updatedTask = {
                    ...taskToMove,
                    isRunning: true,
                    lastTickAt: nowTime
                };

                newState.unshift(updatedTask);
                return newState;
            }
        }

        case 'MOVE_TASK': {
            const { fromId, toId } = action.payload;
            const fromIndex = state.findIndex(t => t.id === fromId);
            const toIndex = state.findIndex(t => t.id === toId);

            if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return state;

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

        case 'SET_INITIAL_TIME':
            return state.map(task =>
                task.id === action.payload.id
                    ? { ...task, initialTime: action.payload.totalMs }
                    : task
            );

        case 'UPDATE_REMAINING_TIME':
            return state.map(task =>
                task.id === action.payload.id
                    ? { ...task, remainingTime: action.payload.newUsageMs }
                    : task
            );

        case 'IMPORT_TASKS':
            return action.payload.map(t => ({
                id: crypto.randomUUID(),
                title: t.title,
                initialTime: t.initialTime,
                remainingTime: t.initialTime,
                isRunning: false,
                lastTickAt: null,
                isSkipped: false,
                skippedAt: null,
                finishedAt: null
            }));

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
