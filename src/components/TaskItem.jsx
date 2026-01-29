import React, { useState } from 'react';

const formatTime = (ms) => {
    if (ms <= 0) return "00:00";
    const totalSeconds = Math.ceil(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export function TaskItem({ task, dispatch }) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingTime, setIsEditingTime] = useState(false); // For remaining time manual edit

    const [editH, setEditH] = useState(0);
    const [editM, setEditM] = useState(0);

    const progress = Math.min(100, Math.max(0, (task.remainingTime / task.initialTime) * 100));

    // Total Initial Time Editor Logic
    const handleInitialTimeEdit = (h, m) => {
        const totalMs = (h * 60 * 60 * 1000) + (m * 60 * 1000);
        if (totalMs > 0) {
            dispatch({ type: 'SET_INITIAL_TIME', payload: { id: task.id, totalMs } });
        }
    };

    // Remaining Time Editor Logic
    const startEditingRemaining = () => {
        if (task.isRunning) return; // Don't edit while running
        const totalSeconds = Math.ceil(task.remainingTime / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        setEditH(h);
        setEditM(m);
        setIsEditingTime(true);
    };

    const saveRemainingTime = () => {
        const totalMs = (parseInt(editH) * 60 * 60 * 1000) + (parseInt(editM) * 60 * 1000);
        dispatch({ type: 'UPDATE_REMAINING_TIME', payload: { id: task.id, newUsageMs: totalMs } });
        setIsEditingTime(false);
    };

    const initialH = Math.floor(task.initialTime / (3600 * 1000));
    const initialM = Math.floor((task.initialTime % (3600 * 1000)) / (60 * 1000));

    return (
        <div className={`task-card ${task.isRunning ? 'active' : ''}`}>
            <div className="task-header">
                {isEditingTitle ? (
                    <input
                        className="task-input"
                        value={task.title}
                        onChange={(e) => dispatch({ type: 'UPDATE_TASK', payload: { id: task.id, updates: { title: e.target.value } } })}
                        onBlur={() => setIsEditingTitle(false)}
                        autoFocus
                    />
                ) : (
                    <span className="task-input" onClick={() => setIsEditingTitle(true)}>{task.title}</span>
                )}

                <div className="controls">
                    <button
                        className="btn-icon"
                        onClick={() => dispatch({ type: 'TOGGLE_TIMER', payload: task.id })}
                        title={task.isRunning ? "Pausar" : "Iniciar"}
                    >
                        {task.isRunning ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        )}
                    </button>

                    <button
                        className="btn-icon"
                        onClick={() => dispatch({ type: 'RESET_TIMER', payload: task.id })}
                        title="Reiniciar"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                    </button>

                    <button
                        className="btn-icon"
                        style={{ color: 'var(--danger-color)' }}
                        onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
                        title="Eliminar"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>

            <div className="task-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                {isEditingTime ? (
                    <div className="time-editor glass-panel" style={{ padding: '5px' }}>
                        <input
                            type="number" value={editH} onChange={e => setEditH(e.target.value)}
                            className="time-input" style={{ width: 30 }}
                        /> h :
                        <input
                            type="number" value={editM} onChange={e => setEditM(e.target.value)}
                            className="time-input" style={{ width: 30 }}
                        /> m
                        <button onClick={saveRemainingTime} className="btn-primary" style={{ padding: '2px 8px', marginLeft: 5, fontSize: '0.8rem' }}>OK</button>
                    </div>
                ) : (
                    <div
                        className="timer-display"
                        onClick={startEditingRemaining}
                        style={{ cursor: task.isRunning ? 'default' : 'pointer', textDecoration: task.isRunning ? 'none' : 'underline', textDecorationStyle: 'dotted' }}
                        title={task.isRunning ? "Pausa para editar" : "Click para editar tiempo restante"}
                    >
                        {formatTime(task.remainingTime)}
                    </div>
                )}

                <div className="time-editor">
                    <span>Total:</span>
                    <input
                        className="time-input"
                        type="number"
                        defaultValue={initialH}
                        onBlur={(e) => handleInitialTimeEdit(parseInt(e.target.value), initialM)}
                    /> h
                    <input
                        className="time-input"
                        type="number"
                        defaultValue={initialM}
                        onBlur={(e) => handleInitialTimeEdit(initialH, parseInt(e.target.value))}
                    /> m
                </div>
            </div>

            <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
}
