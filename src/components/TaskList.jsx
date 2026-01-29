import React from 'react';
import { TaskItem } from './TaskItem';

export function TaskList({ tasks, dispatch }) {
    if (tasks.length === 0) {
        return (
            <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20, opacity: 0.5 }}>
                    <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <p>No hay tareas pendientes.</p>
                <p style={{ fontSize: '0.9rem', marginTop: 8 }}>¡Agrega una para comenzar!</p>
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} dispatch={dispatch} />
            ))}
        </div>
    );
}
