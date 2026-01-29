import React from 'react';

const formatTime = (ms) => {
    if (ms <= 0) return "0m";
    const totalSeconds = Math.ceil(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export function TaskStats({ tasks }) {
    const completedTasks = tasks.filter(t => t.finishedAt || t.remainingTime <= 0);
    const pendingTasks = tasks.filter(t => !t.finishedAt && t.remainingTime > 0);

    const completedCount = completedTasks.length;
    const pendingCount = pendingTasks.length;

    const totalTimeSpent = tasks.reduce((acc, t) => acc + (t.initialTime - t.remainingTime), 0);
    const totalTimeRemaining = tasks.reduce((acc, t) => acc + t.remainingTime, 0);

    return (
        <div className="stats-dashboard glass-panel" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            marginBottom: '2rem'
        }}>
            <div className="stat-card">
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Pendientes</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{pendingCount}</div>
            </div>
            <div className="stat-card">
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Completadas</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{completedCount}</div>
            </div>
            <div className="stat-card">
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Tiempo Actividad</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(totalTimeSpent)}</div>
            </div>
            <div className="stat-card">
                <div style={{ fontSize: '0.8rem', opacity: 0.7, textTransform: 'uppercase' }}>Tiempo Restante</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(totalTimeRemaining)}</div>
            </div>
        </div>
    );
}
