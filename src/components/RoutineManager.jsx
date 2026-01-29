import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'aura-routines-v1';

export function RoutineManager({ currentTasks, onImport, onClose }) {
    const [routines, setRoutines] = useState([]);
    const [newRoutineName, setNewRoutineName] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setRoutines(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const saveToStorage = (newRoutines) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRoutines));
        setRoutines(newRoutines);
    };

    const handleSaveCurrent = (e) => {
        e.preventDefault();
        if (!newRoutineName.trim()) return;
        if (currentTasks.length === 0) return;

        const template = currentTasks.map(t => ({
            title: t.title,
            initialTime: t.initialTime
        }));

        const newRoutine = {
            id: crypto.randomUUID(),
            name: newRoutineName,
            tasks: template
        };

        saveToStorage([...routines, newRoutine]);
        setNewRoutineName('');
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta rutina?')) {
            saveToStorage(routines.filter(r => r.id !== id));
        }
    };

    const handleLoad = (routine) => {
        if (confirm(`¿Cargar rutina "${routine.name}"? Esto reemplazará las tareas actuales.`)) {
            onImport(routine.tasks);
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>Gestor de Rutinas</h2>
                    <button className="btn-icon" onClick={onClose}>×</button>
                </div>

                <div className="routine-section">
                    <h3>Guardar Actual</h3>
                    <form onSubmit={handleSaveCurrent} className="routine-form">
                        <input
                            type="text"
                            placeholder="Nombre de rutina (ej. Gimnasio)"
                            value={newRoutineName}
                            onChange={e => setNewRoutineName(e.target.value)}
                            className="task-input"
                        />
                        <button type="submit" className="btn-primary" disabled={currentTasks.length === 0}>
                            Guardar
                        </button>
                    </form>
                    {currentTasks.length === 0 && <p className="hint">Agrega tareas para poder guardar una rutina.</p>}
                </div>

                <div className="routine-section">
                    <h3>Mis Rutinas</h3>
                    {routines.length === 0 ? (
                        <p className="empty-state-text">No hay rutinas guardadas.</p>
                    ) : (
                        <ul className="routine-list">
                            {routines.map(routine => (
                                <li key={routine.id} className="routine-item">
                                    <span className="routine-name">{routine.name} ({routine.tasks.length} tareas)</span>
                                    <div className="routine-actions">
                                        <button className="btn-primary" onClick={() => handleLoad(routine)}>Cargar</button>
                                        <button className="btn-icon danger" onClick={() => handleDelete(routine.id)}>🗑</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
