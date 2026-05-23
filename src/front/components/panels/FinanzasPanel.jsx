// =============================================================================
// COMPONENTE: FinanzasPanel
// Panel de finanzas para el dashboard.
// Muestra KPIs, formulario de movimientos y tabla de transacciones.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../hooks/useTransactions';

// Categorías predefinidas para el datalist
const INCOME_CATEGORIES = ["Ventas", "Servicios", "Anticipo", "Otro ingreso"];
const EXPENSE_CATEGORIES = [
    "Materiales", "Insumos", "Transporte", "Renta",
    "Servicios públicos", "Marketing", "Equipamiento", "Otro gasto"
];

// =============================================================================
// KPI Card - Tarjeta para indicador clave
// =============================================================================
const KPI = ({ label, value, color, sub }) => (
    <div style={{
        background: "var(--bg2)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "18px 20px",
    }}>
        <div style={{
            fontSize: "11px",
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 600,
            marginBottom: "8px"
        }}>
            {label}
        </div>
        <div style={{
            fontFamily: "var(--font-head)",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: color || "var(--text)"
        }}>
            {value}
        </div>
        {sub && (
            <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>
                {sub}
            </div>
        )}
    </div>
);

// =============================================================================
// COMPONENTE PRINCIPAL: FinanzasPanel
// =============================================================================
export const FinanzasPanel = ({ backendUrl }) => {
    const {
        transactions,
        summary,
        fetchTransactions,
        fetchSummary,
        createTransaction,
        deleteTransaction,
        loading
    } = useTransactions(backendUrl);

    // Estados locales
    const [showForm, setShowForm] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [filterType, setFilterType] = useState('');
    const [form, setForm] = useState({
        type: 'income',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().slice(0, 10),
    });

    // Cargar datos cuando cambia mes o filtro
    useEffect(() => {
        fetchTransactions(selectedMonth, filterType || null);
        fetchSummary(selectedMonth);
    }, [selectedMonth, filterType]);

    // Submit del formulario
    const handleSubmit = async () => {
        if (!form.amount || !form.type) return;
        const ok = await createTransaction(form);
        if (ok) {
            setForm({
                type: 'income',
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().slice(0, 10),
            });
            setShowForm(false);
        }
    };

    const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <div>
            {/* HEADER */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "✕ Cancelar" : "+ Registrar movimiento"}
                </button>

                <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: "160px" }}
                />

                <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                    {["", "income", "expense"].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={filterType === t ? "btn-primary" : "btn-secondary"}
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                            {t === '' ? "Todos" : t === 'income' ? "Ingresos" : "Gastos"}
                        </button>
                    ))}
                </div>
            </div>

            {/* FORMULARIO */}
            {showForm && (
                <div style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "16px"
                }}>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>
                        Nuevo movimiento
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "12px",
                        marginBottom: "16px"
                    }}>
                        <div>
                            <label>Tipo *</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({...form, type: e.target.value, category: ''})}
                                className="form-input"
                            >
                                <option value="income">💰 Ingreso</option>
                                <option value="expense">💸 Gasto</option>
                            </select>
                        </div>
                        <div>
                            <label>Monto *</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={e => setForm({...form, amount: e.target.value})}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label>Categoría</label>
                            <input
                                list="cat-list"
                                placeholder="Selecciona o escribe..."
                                value={form.category}
                                onChange={e => setForm({...form, category: e.target.value})}
                                className="form-input"
                            />
                            <datalist id="cat-list">
                                {categories.map(c => <option key={c} value={c}/>)}
                            </datalist>
                        </div>
                        <div>
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({...form, date: e.target.value})}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label>Descripción</label>
                        <input
                            placeholder="Descripción opcional..."
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                            className="form-input"
                        />
                    </div>

                    <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Guardando..." : "Guardar movimiento"}
                    </button>
                </div>
            )}

            {/* KPIs */}
            {summary && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "12px",
                    marginBottom: "16px"
                }}>
                    <KPI label="Ingresos" value={`$${summary.total_income.toFixed(2)}`} color="var(--accent)" />
                    <KPI label="Gastos" value={`$${summary.total_expense.toFixed(2)}`} color="var(--accent3)" />
                    <KPI label="Ganancia neta" value={`$${summary.net.toFixed(2)}`} color={summary.net >= 0 ? "var(--accent)" : "var(--accent3)"} />
                    <KPI label="Movimientos" value={summary.transaction_count} sub={selectedMonth} />
                </div>
            )}

            {/* TABLA */}
            <div style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                overflow: "hidden"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["Fecha", "Tipo", "Categoría", "Descripción", "Monto", ""].map(h => (
                                <th key={h} style={{
                                    padding: "12px 16px",
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    color: "var(--muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    textAlign: "left"
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "var(--muted)",
                                    fontSize: "13px"
                                }}>
                                    No hay movimientos este mes
                                </td>
                            </tr>
                        ) : transactions.map((t, i) => (
                            <tr
                                key={t.id}
                                style={{
                                    borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
                                    transition: "background 0.12s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--muted)" }}>
                                    {t.date}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <span style={{
                                        background: t.type === 'income' ? "rgba(200,240,96,0.12)" : "rgba(255,107,107,0.12)",
                                        color: t.type === 'income' ? "var(--accent)" : "var(--accent3)",
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        padding: "3px 9px",
                                        borderRadius: "20px",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em"
                                    }}>
                                        {t.type === 'income' ? "Ingreso" : "Gasto"}
                                    </span>
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>
                                    {t.category || "—"}
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                                    {t.description || "—"}
                                </td>
                                <td style={{
                                    padding: "12px 16px",
                                    fontFamily: "var(--font-head)",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: t.type === 'income' ? "var(--accent)" : "var(--accent3)"
                                }}>
                                    {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <button
                                        className="btn-icon"
                                        onClick={() => deleteTransaction(t.id)}
                                        title="Eliminar"
                                        style={{ color: "var(--accent3)" }}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};