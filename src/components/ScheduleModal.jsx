import React from 'react';

export function ScheduleModal({ startTime, setStartTime, endTime, setEndTime, onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>Configurar Horario</h2>
                    <button className="btn-icon" onClick={onClose}>×</button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1rem', opacity: 0.9 }}>
                            Inicio de Jornada
                        </label>
                        <input
                            type="time"
                            className="task-input"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            style={{ fontSize: '1.5rem', padding: '0.5rem', width: '100%', textAlign: 'center' }}
                        />
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.3rem' }}>
                            Hora a la que planeas comenzar (o hora actual).
                        </p>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1rem', opacity: 0.9 }}>
                            Fin de Jornada
                        </label>
                        <input
                            type="time"
                            className="task-input"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            style={{ fontSize: '1.5rem', padding: '0.5rem', width: '100%', textAlign: 'center' }}
                        />
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.3rem' }}>
                            Hora límite para terminar todas las tareas.
                        </p>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={onClose}
                        style={{ marginTop: '1rem', padding: '0.8rem', fontSize: '1.1rem', justifyContent: 'center' }}
                    >
                        Listo
                    </button>
                </div>
            </div>
        </div>
    );
}
