import React from "react";

export const DashboardIngredients = ({ ingredients, onEditIngredient }) => {
    const getStockStatus = (ing) => {
        if (ing.current_stock <= 0) return { label: "Sin stock", class: "badge-red", pct: 0 };
        if (ing.current_stock < 5) return { label: "Stock bajo", class: "badge-amber", pct: 20 };
        return { label: "OK", class: "badge-green", pct: 75 };
    };

    const getBarColor = (pct) => {
        if (pct <= 0) return "var(--accent3)";
        if (pct <= 20) return "var(--accent4)";
        return "var(--accent)";
    };

    return (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Nombre", "Unidad", "Coste", "Stock", "Proveedor", "Estado", ""].map(h => (
                            <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {ingredients.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                                No hay ingredientes registrados
                            </td>
                        </tr>
                    ) : ingredients.map((ing, i) => {
                        const status = getStockStatus(ing);
                        return (
                            <tr key={ing.id}
                                style={{ borderBottom: i < ingredients.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.12s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 500 }}>{ing.name}</td>
                                <td style={{ padding: "12px 16px" }}>
                                    <span style={{ background: "var(--bg4)", color: "var(--muted)", fontSize: "11px", padding: "2px 8px", borderRadius: "6px" }}>{ing.unit}</span>
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "var(--font-head)", fontWeight: 700 }}>
                                    {ing.cost_per_unit}€/{ing.unit}
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div style={{ height: "4px", background: "var(--bg4)", borderRadius: "4px", overflow: "hidden", width: "80px" }}>
                                            <div style={{ height: "100%", width: `${status.pct}%`, background: getBarColor(status.pct), borderRadius: "4px" }} />
                                        </div>
                                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>{ing.current_stock} {ing.unit}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--muted)" }}>{ing.supplier || "—"}</td>
                                <td style={{ padding: "12px 16px" }}>
                                    <span className={`badge ${status.class}`}>{status.label}</span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <button className="btn-icon" onClick={() => onEditIngredient(ing)} title="Editar">✏️</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};