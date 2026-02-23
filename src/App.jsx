import React, { useReducer, useEffect, useState } from 'react';
import pkg from '../package.json';
import { RoutineManager } from './components/RoutineManager';
import { taskReducer } from './reducers/taskReducer';
import { TaskList } from './components/TaskList';
import { AddTask } from './components/AddTask';
import { TaskStats } from './components/TaskStats';
import { requestNotificationPermission, sendNotification } from './utils/notifications';
import { playAlarm } from './utils/audio';
import { recalculateTaskTimes } from './utils/timeUtils';

const STORAGE_KEY = 'aura-tasks-v1';

const init = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return parsed; // We calculate times in render now
    } catch (e) {
      console.error(e);
      return [];
    }
  }
  return [];
};

function App() {
  const [tasks, dispatch] = useReducer(taskReducer, [], init);
  const [showRoutines, setShowRoutines] = useState(false);
  const [endTime, setEndTime] = useState(() => localStorage.getItem('aura-end-time') || '');
  const [startTime, setStartTime] = useState(() => localStorage.getItem('aura-start-time') || '');
  const [now, setNow] = useState(Date.now());

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('aura-end-time', endTime);
  }, [endTime]);

  useEffect(() => {
    localStorage.setItem('aura-start-time', startTime);
  }, [startTime]);

  // Global Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());

      const hasRunning = tasks.some(t => t.isRunning);
      if (hasRunning) {
        dispatch({ type: 'SYNC_TIMERS' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);
  // Dependency on tasks is needed if we use 'tasks' inside, but we use 'dispatch'.
  // However, 'hasRunning' needs 'tasks'.
  // If we assume 'dispatch' is stable (it is from useReducer), we can optimize:
  // But checking 'tasks.some' inside effect requires 'tasks' dep, which resets interval every time tasks change.
  // Resetting interval every 200ms is bad? No, it's fine.
  // Actually, better to use a ref for tasks or functional state update,
  // but we need to know if we should dispatch.
  // Let's just run it always and let reducer handle it.

  // Handling Side Effects (Sound/Notification)
  useEffect(() => {
    tasks.forEach(task => {
      if (task.finishedAt) {
        // It just finished
        playAlarm();
        sendNotification("¡Tiempo Terminad!", {
          body: `La tarea "${task.title}" ha finalizado.`,
          icon: '/vite.svg' // Placeholder
        });

        // Clear the flag
        // We need a specific action to clear the flag or just let it stay 
        // until user resets? 
        // The reducer sets 'isRunning' to false.
        // But 'finishedAt' persists. We should consume it.
        dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates: { finishedAt: null } } });
      }
    });
  }, [tasks]);

  const handleAddTask = (taskData) => {
    dispatch({ type: 'ADD_TASK', payload: taskData });
    // Opportunistic permission request
    requestNotificationPermission();
  };

  const handleImport = (routine) => {
    // Legacy support: if routine is just an array, it's the old format (just tasks)
    const newTasks = Array.isArray(routine) ? routine : routine.tasks;

    dispatch({ type: 'IMPORT_TASKS', payload: newTasks });

    // Time Configuration Support
    // If routine object has time config, load it. 
    // If missing (legacy routine), keep current app state.
    if (!Array.isArray(routine)) {
      if (routine.startTime !== undefined) setStartTime(routine.startTime);
      if (routine.endTime !== undefined) setEndTime(routine.endTime);
    }
  };

  // Derived state: calculate times for all tasks
  const tasksWithTimes = React.useMemo(() => {
    let baseStart = now;
    if (startTime) {
      const [h, m] = startTime.split(':').map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      if (target.getTime() > now) {
        baseStart = target.getTime();
      }
    }
    return recalculateTaskTimes(tasks, baseStart);
  }, [tasks, startTime, now]);

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <h1>AuraTask</h1>
        <button
          className="btn-icon"
          style={{ position: 'absolute', right: 0 }}
          onClick={() => setShowRoutines(true)}
          title="Rutinas"
        >
          📑
        </button>
      </header>

      <main>
        <TaskStats
          tasks={tasksWithTimes}
          endTime={endTime}
          setEndTime={setEndTime}
          startTime={startTime}
          setStartTime={setStartTime}
        />
        <AddTask onAdd={handleAddTask} />
        <TaskList tasks={tasksWithTimes} dispatch={dispatch} />
      </main>

      {showRoutines && (
        <RoutineManager
          currentTasks={tasks}
          onImport={handleImport}
          onClose={() => setShowRoutines(false)}
          startTime={startTime}
          endTime={endTime}
        />
      )}

      <div style={{
        position: 'fixed',
        bottom: 5,
        right: 10,
        fontSize: '0.7rem',
        opacity: 0.3,
        pointerEvents: 'none',
        color: 'var(--text-muted)'
      }}>
        v{pkg.version}
      </div>
    </>
  );
}

export default App;
