import React, { useState } from 'react';
import { ScheduleModal } from './ScheduleModal';

const formatTime = (ms) => {
    if (ms <= 0) return "0m";
    const totalSeconds = Math.ceil(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);

    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export function TaskStats({ tasks, endTime, setEndTime, startTime, setStartTime }) {
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const completedTasks = tasks.filter(t => t.finishedAt || t.remainingTime <= 0);
    const pendingTasks = tasks.filter(t => !t.finishedAt && t.remainingTime > 0 && !t.isSkipped);

    const completedCount = completedTasks.length;
    const pendingCount = pendingTasks.length;


    const totalTimeRemaining = pendingTasks.reduce((acc, t) => acc + t.remainingTime, 0);

    // Schedule Logic
    let scheduleStatus = 'neutral';
    let scheduleDiff = null;

    if (endTime) {
        const now = new Date();
        const [endH, endM] = endTime.split(':').map(Number);

        const targetEnd = new Date();
        targetEnd.setHours(endH, endM, 0, 0);

        let startTarget = new Date();
        if (startTime) {
            const [startH, startM] = startTime.split(':').map(Number);
            startTarget.setHours(startH, startM, 0, 0);
        }

        const effectiveStart = (startTarget > now) ? startTarget : now;
        const availableMs = targetEnd - effectiveStart;

        if (availableMs > 0) {
            const diff = availableMs - totalTimeRemaining;
            scheduleDiff = diff;
            scheduleStatus = diff >= 0 ? 'ok' : 'warning';
        } else {
            scheduleStatus = 'warning';
            scheduleDiff = availableMs - totalTimeRemaining; // Should be negative total of workload + any overtime
        }
    }

    const formatDiff = (ms) => {
        const abs = Math.abs(ms);
        const totalMinutes = Math.floor(abs / 60000);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
        // Clarify text
        return ms >= 0 ? `+${timeStr} de sobra` : `-${timeStr} faltante`;
    };

    // Calculate Available Time for Display (independent of diff)
    let availableTimeDisplay = "---";
    if (endTime) {
        const now = new Date();
        const [endH, endM] = endTime.split(':').map(Number);
        const targetEnd = new Date();
        targetEnd.setHours(endH, endM, 0, 0);

        // Logic for available time from NOW (or Start if future)
        let startTarget = new Date();
        if (startTime) {
            const [startH, startM] = startTime.split(':').map(Number);
            startTarget.setHours(startH, startM, 0, 0);
        }
        const effectiveStart = (startTarget > now) ? startTarget : now;
        const ms = targetEnd - effectiveStart;
        availableTimeDisplay = ms > 0 ? formatTime(ms) : "0m";
    }

    return (
        <div className="stats-dashboard glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            marginBottom: '2rem'
        }}>
            {/* Top Row: Counts & Basic Times */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', width: '100%' }}>
                <div className="stat-card">
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Carga Trabajo</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{formatTime(totalTimeRemaining)}</div>
                </div>
                <div className="stat-card" style={{ border: '1px solid var(--primary-color)', background: 'rgba(var(--primary-hue), 0.1)' }}>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase', color: 'var(--primary-color)' }}>Tiempo Disponible</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{availableTimeDisplay}</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Pendientes</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{pendingCount}</div>
                </div>
                <div className="stat-card">
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Completadas</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{completedCount}</div>
                </div>
            </div>

            {/* Bottom Row: Schedule & Feasibility */}
            <div className="stat-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                marginTop: '0.5rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => setShowScheduleModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {startTime || endTime ?
                            `${startTime || '--:--'} - ${endTime || '--:--'}` :
                            "Configurar Horario"
                        }
                    </button>
                </div>

                {scheduleStatus !== 'neutral' && (
                    <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: scheduleStatus === 'ok' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: scheduleStatus === 'ok' ? 'var(--success-color)' : 'var(--danger-color)',
                        border: `1px solid ${scheduleStatus === 'ok' ? 'var(--success-color)' : 'var(--danger-color)'}`,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        flexGrow: 1
                    }}>
                        {formatDiff(scheduleDiff)}
                    </div>
                )}
            </div>

            {showScheduleModal && (
                <ScheduleModal
                    startTime={startTime}
                    setStartTime={setStartTime}
                    endTime={endTime}
                    setEndTime={setEndTime}
                    onClose={() => setShowScheduleModal(false)}
                />
            )}
        </div>
    );
}
