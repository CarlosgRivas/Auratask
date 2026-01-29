import React, { useState } from 'react';

export function AddTask({ onAdd }) {
    const [title, setTitle] = useState('');
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(25);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        // Calculate total ms
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;

        if (h === 0 && m === 0) return; // Validación mínima

        const totalMs = (h * 60 * 60 * 1000) + (m * 60 * 1000);

        onAdd({ title, totalMs });
        setTitle('');
        // Keep last used time or reset? Usually reset or keep default
        // Let's keep 25min default logic or reset to 0? 
        // User often adds multiple tasks of same length? No, usually different.
        // Resetting to default 25m seems safe.
        setHours(0);
        setMinutes(25);
    };

    return (
        <div className="glass-panel">
            <form onSubmit={handleSubmit} className="task-header" style={{ flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Nueva tarea..."
                    className="task-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ flexGrow: 1, minWidth: '200px' }}
                />
                <div className="time-editor" style={{ marginLeft: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <input
                            type="number"
                            min="0"
                            max="23"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="time-input"
                            placeholder="0"
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>h</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            className="time-input"
                            placeholder="0"
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>m</span>
                    </div>
                </div>
                <button type="submit" className="btn-primary">
                    +
                </button>
            </form>
        </div>
    );
}
