export const recalculateTaskTimes = (tasks, baseStartTimeMs) => {
    const now = Date.now();
    let currentStartTime = baseStartTimeMs || now;

    return tasks.map((task) => {
        // Skipped or finished tasks don't take time in the future schedule
        const isInactive = task.isSkipped || (task.remainingTime <= 0) || task.finishedAt;
        const duration = isInactive ? 0 : Math.max(0, task.remainingTime || 0);

        const startTimeMs = currentStartTime;
        const endTimeMs = startTimeMs + duration;

        const startTimeDate = new Date(startTimeMs);
        const endTimeDate = new Date(endTimeMs);

        // Update currentStartTime for the next task ONLY if this task takes time
        currentStartTime = endTimeMs;

        const formatTime = (date) => {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        return {
            ...task,
            calculatedStartTime: isInactive ? null : formatTime(startTimeDate),
            calculatedEndTime: isInactive ? null : formatTime(endTimeDate),
            calculatedStartMs: startTimeMs,
            calculatedEndMs: endTimeMs
        };
    });
};

