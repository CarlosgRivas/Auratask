import React from 'react';
import { TaskItem } from './TaskItem';

export function TaskList({ tasks, dispatch }) {
    const [draggedIndex, setDraggedIndex] = React.useState(null);

    const pendingTasks = tasks.filter(t => !t.finishedAt && t.remainingTime > 0);
    const completedTasks = tasks.filter(t => t.finishedAt || t.remainingTime <= 0);

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDrop = (dropIndex) => {
        if (draggedIndex === null || draggedIndex === dropIndex) return;
        dispatch({ type: 'MOVE_TASK', payload: { fromIndex: draggedIndex, toIndex: dropIndex } });
        setDraggedIndex(null);
    };

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
        <div className="task-list-container">
            <div className="task-list">
                {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20, opacity: 0.5 }}>
                            <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        <p>No hay tareas pendientes.</p>
                        <p style={{ fontSize: '0.9rem', marginTop: 8 }}>¡Agrega una para comenzar!</p>
                    </div>
                ) : (
                    pendingTasks.map((task, index) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            index={index}
                            totalCount={pendingTasks.length}
                            dispatch={dispatch}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                        />
                    ))
                )}
            </div>

            {completedTasks.length > 0 && (
                <div className="completed-section" style={{ marginTop: 40, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <h3 style={{ margin: 0, opacity: 0.7 }}>Completadas ({completedTasks.length})</h3>
                        <button
                            className="btn-secondary small"
                            onClick={() => dispatch({ type: 'RESTORE_ALL_TASKS' })}
                            style={{ fontSize: '0.8rem' }}
                        >
                            Restaurar todas
                        </button>
                    </div>
                    <div className="task-list completed" style={{ opacity: 0.8 }}>
                        {completedTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                index={-1} // Disable reordering for completed
                                totalCount={0}
                                dispatch={dispatch}
                                isCompleted={true}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
