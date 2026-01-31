import React, { useReducer, useEffect, useState } from 'react';
import pkg from '../package.json';
import { RoutineManager } from './components/RoutineManager';
import { taskReducer } from './reducers/taskReducer';
import { TaskList } from './components/TaskList';
import { AddTask } from './components/AddTask';
import { TaskStats } from './components/TaskStats';
import { requestNotificationPermission, sendNotification } from './utils/notifications';
import { playAlarm } from './utils/audio';

const STORAGE_KEY = 'aura-tasks-v1';

const init = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Correction for running tasks when reloading logic could be here,
      // but Reducer SYNC_TIMERS handles it on first tick.....
      return parsed;
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
      // Check if any task is running before dispatching to avoid useless renders?
      // But we need to check if any task finished too.
      // We can just dispatch Sync. The reducer returns same state if no changes?
      // Actually my reducer always maps. Optimization: only dispatch if some task is running.

      const hasRunning = tasks.some(t => t.isRunning);
      if (hasRunning) {
        dispatch({ type: 'SYNC_TIMERS' });
      }
    }, 200);

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

  const handleImport = (templateTasks) => {
    dispatch({ type: 'IMPORT_TASKS', payload: templateTasks });
  };

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
          tasks={tasks}
          endTime={endTime}
          setEndTime={setEndTime}
          startTime={startTime}
          setStartTime={setStartTime}
        />
        <AddTask onAdd={handleAddTask} />
        <TaskList tasks={tasks} dispatch={dispatch} />
      </main>

      {showRoutines && (
        <RoutineManager
          currentTasks={tasks}
          onImport={handleImport}
          onClose={() => setShowRoutines(false)}
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
