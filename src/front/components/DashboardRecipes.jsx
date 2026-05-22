import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

export const DashboardRecipes = ({ recipes, calculateCost, calculateMargin, onViewRecipe, onDelete }) => {
    const tableRef = useRef(null);

    useEffect(() => {
        if (tableRef.current) {
            const rows = tableRef.current.querySelectorAll("tr");
            rows.forEach((row, index) => {
                row.style.opacity = "0";
                row.style.transform = "translateY(10px)";
                animate(row, {
                    translateY: [10, 0],
                    opacity: [0, 1],
                    delay: index * 60,
                    easing: "easeOutQuad",
                    duration: 400
                });
            });
        }
    }, [recipes]);

    const getMarginColor = (margin) => {
        if (margin >= 60) return "var(--accent)";
        if (margin >= 30) return "var(--accent4)";
        return "var(--accent3)";
    };

    return (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Nombre", "Categoría", "Precio", "Coste", "Margen", ""].map(h => (
                            <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody ref={tableRef}>
                    {recipes.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                                No hay productos registrados
                            </td>
                        </tr>
                    ) : recipes.map((recipe, i) => {
                        const cost = calculateCost(recipe);
                        const margin = calculateMargin(recipe);
                        return (
                            <tr key={recipe.id}
                                style={{ borderBottom: i < recipes.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.12s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "12px 16px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--accent)", cursor: "pointer" }} onClick={() => onViewRecipe(recipe)}>
                                        {recipe.name}
                                    </span>
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--muted)" }}>
                                    {recipe.category || "Sin categoría"}
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "var(--font-head)", fontWeight: 700 }}>
                                    {recipe.sale_price}€
                                </td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>
                                    {cost.toFixed(2)}€
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <span style={{ fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700, color: getMarginColor(margin) }}>
                                        {margin.toFixed(1)}%
                                    </span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button className="btn-icon" onClick={() => onViewRecipe(recipe)} title="Ver">👁️</button>
                                        <button className="btn-icon" onClick={() => onDelete(recipe.id)} title="Eliminar" style={{ color: "var(--accent3)" }}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};