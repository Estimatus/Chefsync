import React, { useState } from 'react';

export const FixedExpensesConfig = ({ fixedExpenses, onSave }) => {
    const [enabled, setEnabled] = useState(fixedExpenses?.enabled || false);
    const [rate, setRate] = useState(fixedExpenses?.rate || 0);

    const handleSave = () => {
        onSave({ enabled, rate: parseFloat(rate) || 0 });
    };

    return (
        <div className="stat-card full-width" style={{ backgroundColor: '#1e1e2f', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>
                    <i className="fas fa-calculator me-2"></i>
                    Gastos Fijos
                </h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ color: enabled ? '#22c55e' : '#aaa' }}>
                        {enabled ? 'Activado' : 'Desactivado'}
                    </span>
                </label>
            </div>

            {enabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#aaa', fontSize: '14px' }}>
                            Porcentaje de gastos fijos (overhead)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                style={{ flex: 1, cursor: 'pointer' }}
                            />
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={rate}
                                onChange={(e) => setRate(Math.min(100, Math.max(0, e.target.value)))}
                                style={{
                                    width: '70px',
                                    padding: '8px',
                                    borderRadius: '5px',
                                    border: 'none',
                                    backgroundColor: '#2d2d3f',
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                            />
                            <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '18px' }}>%</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        style={{ padding: '10px 20px', marginTop: '20px' }}
                    >
                        Guardar
                    </button>
                </div>
            )}

            {enabled && (
                <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#2d2d3f', borderRadius: '8px', fontSize: '14px', color: '#aaa' }}>
                    <i className="fas fa-info-circle me-2" style={{ color: '#3b82f6' }}></i>
                    El {rate}% de los costes de ingredientes se añadirán como gastos fijos para calcular el margen real.
                </div>
            )}
        </div>
    );
};