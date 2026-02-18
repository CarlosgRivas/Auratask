export const recalculateTaskTimes = (tasks) => {
    const now = new Date();
    let currentStartTime = now.getTime();

    return tasks.map((task, index) => {
        // We use remainingTime if available, otherwise initialTime.
        // The reducer ensures remainingTime is initialized.
        // We also check if task is finished (remainingTime <= 0) to avoid negative duration logic quirks, although logic handles it.
        const duration = Math.max(0, task.remainingTime || 0);

        const startTimeMs = currentStartTime;
        const endTimeMs = startTimeMs + duration;

        const startTimeDate = new Date(startTimeMs);
        const endTimeDate = new Date(endTimeMs);

        // Update currentStartTime for the next task
        currentStartTime = endTimeMs;

        const formatTime = (date) => {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        return {
            ...task,
            calculatedStartTime: formatTime(startTimeDate),
            calculatedEndTime: formatTime(endTimeDate),
            // We can also store the raw timestamp if needed for UI calculations
            calculatedStartMs: startTimeMs,
            calculatedEndMs: endTimeMs
        };
    });
};
