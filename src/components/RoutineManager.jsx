import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'aura-routines-v1';

export function RoutineManager({ currentTasks, onImport, onClose, startTime, endTime }) {
    const [routines, setRoutines] = useState([]);
    const [newRoutineName, setNewRoutineName] = useState('');

    // Edit Mode State
    const [editingRoutine, setEditingRoutine] = useState(null);
    const [editName, setEditName] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editTasks, setEditTasks] = useState([]);

    // New Task in Edit Mode
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState(30);

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
            tasks: template,
            startTime, // Save current global settings
            endTime
        };

        // If routine with same name exists, ask to replace? No, just append for now to be safe.
        // Actually unique IDs handle it.

        saveToStorage([...routines, newRoutine]);
        setNewRoutineName('');
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar esta rutina?')) {
            saveToStorage(routines.filter(r => r.id !== id));
        }
    };

    const handleLoad = (routine) => {
        const confirmMsg = `¿Cargar rutina "${routine.name}"? Esto reemplazará las tareas actuales.`;
        if (confirm(confirmMsg)) {
            // Pass full object to App.jsx to handle time settings
            onImport(routine);
            onClose();
        }
    };

    // --- Edit Mode Logic ---

    const startEditing = (routine) => {
        setEditingRoutine(routine);
        setEditName(routine.name);
        setEditStartTime(routine.startTime || '');
        setEditEndTime(routine.endTime || '');
        // Deep copy tasks to avoid mutating state directly
        setEditTasks(JSON.parse(JSON.stringify(routine.tasks)));
    };

    const saveEdit = () => {
        const updatedRoutine = {
            ...editingRoutine,
            name: editName,
            startTime: editStartTime,
            endTime: editEndTime,
            tasks: editTasks
        };

        const updatedRoutines = routines.map(r =>
            r.id === editingRoutine.id ? updatedRoutine : r
        );

        saveToStorage(updatedRoutines);
        setEditingRoutine(null);
    };

    const cancelEdit = () => {
        setEditingRoutine(null);
    };

    const removeTaskFromEdit = (index) => {
        const newTasks = [...editTasks];
        newTasks.splice(index, 1);
        setEditTasks(newTasks);
    };

    const addTaskToEdit = () => {
        if (!newTaskTitle.trim()) return;
        const totalMs = newTaskDuration * 60 * 1000;

        setEditTasks([...editTasks, {
            title: newTaskTitle,
            initialTime: totalMs
        }]);

        setNewTaskTitle('');
        setNewTaskDuration(30);
    };

    // --- Render ---

    if (editingRoutine) {
        return (
            <div className="modal-overlay">
                <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
                    <div className="modal-header">
                        <h2>Editar Rutina</h2>
                        <button className="btn-icon" onClick={cancelEdit}>×</button>
                    </div>

                    <div className="routine-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label>Nombre</label>
                            <input
                                className="task-input"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div>
                                <label>Inicio</label>
                                <input
                                    className="task-input"
                                    type="time"
                                    value={editStartTime}
                                    onChange={e => setEditStartTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Fin</label>
                                <input
                                    className="task-input"
                                    type="time"
                                    value={editEndTime}
                                    onChange={e => setEditEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <h3 style={{ marginTop: '1rem', borderBottom: '1px solid var(--border-color)' }}>Tareas</h3>

                        <ul className="routine-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {editTasks.map((t, idx) => (
                                <li key={idx} className="routine-item" style={{ padding: '0.5rem' }}>
                                    <span>{t.title} ({t.initialTime / 60000}m)</span>
                                    <button
                                        className="btn-icon danger"
                                        onClick={() => removeTaskFromEdit(idx)}
                                        title="Eliminar tarea"
                                    >×</button>
                                </li>
                            ))}
                        </ul>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                            <input
                                className="task-input"
                                placeholder="Nueva tarea..."
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <input
                                className="task-input"
                                type="number"
                                style={{ width: '60px' }}
                                value={newTaskDuration}
                                onChange={e => setNewTaskDuration(parseInt(e.target.value) || 0)}
                            /> m
                            <button className="btn-secondary" onClick={addTaskToEdit}>+</button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button className="btn-secondary" onClick={cancelEdit}>Cancelar</button>
                            <button className="btn-primary" onClick={saveEdit}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="routine-name">{routine.name}</span>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                            {routine.tasks.length} tareas
                                            {routine.startTime ? ` • ${routine.startTime} - ${routine.endTime}` : ''}
                                        </span>
                                    </div>
                                    <div className="routine-actions">
                                        <button className="btn-primary" onClick={() => handleLoad(routine)}>Cargar</button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => startEditing(routine)}
                                            title="Editar"
                                            style={{ margin: '0 4px' }}
                                        >✏️</button>
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
