import React, { useState, useEffect } from 'react';
import useGlobalReducer from '../hooks/useGlobalReducer.jsx';

export const Settings = () => {
    const { store, dispatch } = useGlobalReducer();

    const defaultExpense = { id: Date.now(), name: '', amount: '', category: 'operativo', active: true };

    const [fixedExpenses, setFixedExpenses] = useState(() => {
        const saved = store.settings?.fixedExpenses || {};
        return saved.expenses || [
            { id: 1, name: 'Alquiler local', amount: 800, category: 'local', active: true },
            { id: 2, name: 'Luz', amount: 150, category: 'servicios', active: true },
            { id: 3, name: 'Gas', amount: 80, category: 'servicios', active: true },
            { id: 4, name: 'Agua', amount: 60, category: 'servicios', active: true },
            { id: 5, name: 'Salarios', amount: 2000, category: 'personal', active: true },
            { id: 6, name: 'Mantenimiento', amount: 100, category: 'operativo', active: true },
            { id: 7, name: 'Utensilios', amount: 50, category: 'operativo', active: true },
            { id: 8, name: 'Limpieza', amount: 75, category: 'operativo', active: true },
        ];
    });

    const [overheadRate, setOverheadRate] = useState(() => {
        const saved = store.settings?.fixedExpenses || {};
        return saved.rate || 30;
    });

    const [newExpense, setNewExpense] = useState(defaultExpense);
    const [editingId, setEditingId] = useState(null);
    const [saved, setSaved] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const categories = {
        local: { label: 'Local', icon: 'fa-home', color: '#8b5cf6' },
        personal: { label: 'Personal', icon: 'fa-users', color: '#3b82f6' },
        servicios: { label: 'Servicios', icon: 'fa-bolt', color: '#f59e0b' },
        operativo: { label: 'Operativos', icon: 'fa-tools', color: '#22c55e' },
        administrativo: { label: 'Administrativos', icon: 'fa-building', color: '#ec4899' },
        marketing: { label: 'Marketing', icon: 'fa-bullhorn', color: '#06b6d4' }
    };

    const monthlyTotal = fixedExpenses.filter(e => e.active).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const activeCount = fixedExpenses.filter(e => e.active).length;

    const getByCategory = (cat) => fixedExpenses.filter(e => e.active && e.category === cat);

    const handleAddExpense = () => {
        if (!newExpense.name || !newExpense.amount) return;

        const expense = {
            ...newExpense,
            id: Date.now(),
            amount: parseFloat(newExpense.amount) || 0,
            active: true
        };

        setFixedExpenses([...fixedExpenses, expense]);
        setNewExpense(defaultExpense);
        setShowForm(false);
    };

    const handleUpdateExpense = (id) => {
        setEditingId(id);
    };

    const handleSaveEdit = (id, field, value) => {
        setFixedExpenses(fixedExpenses.map(e =>
            e.id === id ? { ...e, [field]: field === 'amount' ? parseFloat(value) || 0 : value } : e
        ));
    };

    const handleDeleteExpense = (id) => {
        setFixedExpenses(fixedExpenses.filter(e => e.id !== id));
    };

    const handleToggleActive = (id) => {
        setFixedExpenses(fixedExpenses.map(e =>
            e.id === id ? { ...e, active: !e.active } : e
        ));
    };

    const handleSave = () => {
        const total = fixedExpenses.filter(e => e.active).reduce((sum, e) => sum + e.amount, 0);
        dispatch({
            type: 'set_fixed_expenses',
            payload: {
                enabled: true,
                rate: overheadRate,
                totalMonthly: total,
                expenses: fixedExpenses
            }
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        setFixedExpenses([
            { id: 1, name: 'Alquiler local', amount: 800, category: 'local', active: true },
            { id: 2, name: 'Luz', amount: 150, category: 'servicios', active: true },
            { id: 3, name: 'Gas', amount: 80, category: 'servicios', active: true },
            { id: 4, name: 'Agua', amount: 60, category: 'servicios', active: true },
            { id: 5, name: 'Salarios', amount: 2000, category: 'personal', active: true },
            { id: 6, name: 'Mantenimiento', amount: 100, category: 'operativo', active: true },
            { id: 7, name: 'Utensilios', amount: 50, category: 'operativo', active: true },
            { id: 8, name: 'Limpieza', amount: 75, category: 'operativo', active: true },
        ]);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ color: 'white', marginBottom: '30px' }}>
                <i className="fas fa-cog me-3"></i>
                Configuración de Gastos Fijos
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: '#1e1e2f', borderRadius: '15px', padding: '25px' }}>
                    <h3 style={{ color: '#f59e0b', margin: '0 0 20px 0' }}>
                        <i className="fas fa-list me-2"></i>
                        Gastos Mensuales
                    </h3>

                    {Object.entries(categories).map(([catKey, cat]) => {
                        const items = getByCategory(catKey);
                        if (items.length === 0) return null;

                        return (
                            <div key={catKey} style={{ marginBottom: '20px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '10px',
                                    padding: '8px 12px',
                                    backgroundColor: cat.color + '22',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${cat.color}`
                                }}>
                                    <i className={`fas ${cat.icon}`} style={{ color: cat.color }}></i>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{cat.label}</span>
                                    <span style={{ color: '#aaa', marginLeft: 'auto' }}>
                                        {items.reduce((s, e) => s + e.amount, 0).toFixed(2)}€/mes
                                    </span>
                                </div>

                                <div style={{ paddingLeft: '20px' }}>
                                    {items.map(expense => (
                                        <div key={expense.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px',
                                            backgroundColor: '#2d2d3f',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            opacity: expense.active ? 1 : 0.5
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={expense.active}
                                                onChange={() => handleToggleActive(expense.id)}
                                                style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            {editingId === expense.id ? (
                                                <input
                                                    type="text"
                                                    value={expense.name}
                                                    onChange={(e) => handleSaveEdit(expense.id, 'name', e.target.value)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '5px',
                                                        backgroundColor: '#1e1e2f',
                                                        border: '1px solid #f59e0b',
                                                        borderRadius: '4px',
                                                        color: 'white'
                                                    }}
                                                    autoFocus
                                                    onBlur={() => setEditingId(null)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => handleUpdateExpense(expense.id)}
                                                    style={{
                                                        flex: 1,
                                                        color: 'white',
                                                        cursor: 'pointer'
                                                    }}
                                                    title="Clic para editar"
                                                >
                                                    {expense.name}
                                                </span>
                                            )}
                                            <span style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#1e1e2f',
                                                borderRadius: '4px',
                                                color: '#22c55e',
                                                fontWeight: 'bold',
                                                marginRight: '10px'
                                            }}>
                                                {expense.amount.toFixed(2)}€
                                            </span>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    padding: '5px'
                                                }}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {showForm ? (
                        <div style={{
                            backgroundColor: '#2d2d3f',
                            padding: '20px',
                            borderRadius: '10px',
                            marginTop: '20px'
                        }}>
                            <h4 style={{ color: '#f59e0b', margin: '0 0 15px 0' }}>
                                <i className="fas fa-plus me-2"></i>
                                Nuevo Gasto
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px', gap: '10px', marginBottom: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Nombre del gasto"
                                    value={newExpense.name}
                                    onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: '#1e1e2f',
                                        border: '1px solid #3d3d5c',
                                        borderRadius: '5px',
                                        color: 'white'
                                    }}
                                    autoFocus
                                />
                                <input
                                    type="number"
                                    placeholder="Monto €"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: '#1e1e2f',
                                        border: '1px solid #3d3d5c',
                                        borderRadius: '5px',
                                        color: 'white'
                                    }}
                                />
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                    style={{
                                        padding: '10px',
                                        backgroundColor: '#1e1e2f',
                                        border: '1px solid #3d3d5c',
                                        borderRadius: '5px',
                                        color: 'white'
                                    }}
                                >
                                    {Object.entries(categories).map(([key, cat]) => (
                                        <option key={key} value={key}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => { setShowForm(false); setNewExpense(defaultExpense); }}
                                    className="btn-secondary"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddExpense}
                                    className="btn-primary"
                                    style={{ padding: '10px 20px' }}
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    Agregar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            className="btn-primary"
                            style={{ width: '100%', padding: '12px', marginTop: '20px' }}
                        >
                            <i className="fas fa-plus me-2"></i>
                            Agregar Nuevo Gasto
                        </button>
                    )}
                </div>

                <div style={{ backgroundColor: '#1e1e2f', borderRadius: '15px', padding: '25px', height: 'fit-content' }}>
                    <h3 style={{ color: 'white', margin: '0 0 20px 0' }}>
                        <i className="fas fa-chart-pie me-2"></i>
                        Resumen
                    </h3>

                    <div style={{
                        backgroundColor: '#22c55e22',
                        border: '2px solid #22c55e',
                        borderRadius: '10px',
                        padding: '20px',
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}>
                        <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>TOTAL MENSUAL</div>
                        <div style={{ color: '#22c55e', fontSize: '32px', fontWeight: 'bold' }}>
                            {monthlyTotal.toFixed(2)}€
                        </div>
                        <div style={{ color: '#aaa', fontSize: '12px', marginTop: '5px' }}>
                            {(monthlyTotal * 12).toFixed(2)}€/año
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '5px' }}>
                            <span>Gastos activos</span>
                            <span style={{ color: 'white' }}>{activeCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', marginBottom: '5px' }}>
                            <span>Categorías</span>
                            <span style={{ color: 'white' }}>{new Set(fixedExpenses.filter(e => e.active).map(e => e.category)).size}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button
                            onClick={handleReset}
                            className="btn-secondary"
                            style={{ flex: 1, padding: '10px' }}
                        >
                            <i className="fas fa-undo me-1"></i>
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary"
                            style={{ flex: 2, padding: '10px' }}
                        >
                            {saved ? (
                                <>
                                    <i className="fas fa-check me-2"></i>
                                    Guardado
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>
                                    Guardar
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{
                        backgroundColor: '#1e3d5c',
                        borderRadius: '8px',
                        padding: '15px',
                        marginTop: '20px',
                        fontSize: '12px',
                        color: '#aaa',
                        lineHeight: '1.6'
                    }}>
                        <i className="fas fa-info-circle me-2" style={{ color: '#3b82f6' }}></i>
                        Los gastos fijos se aplican como overhead sobre el coste de ingredientes para calcular márgenes reales.
                    </div>

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2d2d3f', borderRadius: '8px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', color: '#aaa', fontSize: '12px' }}>
                            <i className="fas fa-percentage me-1" style={{ color: '#f59e0b' }}></i>
                            Porcentaje de Overhead (para márgenes)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={overheadRate}
                                onChange={(e) => setOverheadRate(parseInt(e.target.value))}
                                style={{ flex: 1, cursor: 'pointer' }}
                            />
                            <span style={{
                                padding: '4px 10px',
                                backgroundColor: '#1e1e2f',
                                borderRadius: '4px',
                                color: '#f59e0b',
                                fontWeight: 'bold',
                                minWidth: '45px',
                                textAlign: 'center'
                            }}>
                                {overheadRate}%
                            </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '5px', textAlign: 'center' }}>
                            Se aplica sobre coste de ingredientes
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ backgroundColor: '#1e1e2f', borderRadius: '15px', padding: '25px' }}>
                <h3 style={{ color: 'white', margin: '0 0 15px 0' }}>
                    <i className="fas fa-info-circle me-2" style={{ color: '#3b82f6' }}></i>
                    Acerca de los Gastos Fijos
                </h3>
                <p style={{ color: '#aaa', lineHeight: '1.8' }}>
                    Los gastos fijos son costes mensuales que no están directamente relacionados con la producción de cada plato,
                    pero son necesarios para el funcionamiento del negocio. Al incluirlos en el cálculo del margen,
                    obtienes una imagen más realista de la rentabilidad.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                    {Object.entries(categories).map(([key, cat]) => (
                        <span key={key} style={{
                            backgroundColor: cat.color + '22',
                            padding: '5px 12px',
                            borderRadius: '15px',
                            fontSize: '12px',
                            color: cat.color,
                            border: `1px solid ${cat.color}44`
                        }}>
                            <i className={`fas ${cat.icon} me-1`}></i>
                            {cat.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};