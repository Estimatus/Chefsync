import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

export const DashboardOverview = ({ totalRecipes, totalIngredients, pendingOrders, inProductionOrders }) => {
    const gridRef = useRef(null);

    useEffect(() => {
        if (gridRef.current) {
            const cards = gridRef.current.querySelectorAll(".metric-card");
            cards.forEach((card, index) => {
                card.style.opacity = "0";
                card.style.transform = "translateY(20px)";
                animate(card, {
                    translateY: [20, 0],
                    opacity: [0, 1],
                    delay: index * 100,
                    easing: "easeOutQuad",
                    duration: 500
                });
            });
        }
    }, []);

    const metrics = [
        { value: totalRecipes, label: "Recetas", iconClass: "bg-primary", icon: "📦" },
        { value: totalIngredients, label: "Ingredientes", iconClass: "bg-success", icon: "🧪" },
        { value: pendingOrders, label: "Pedidos", iconClass: "bg-warning", icon: "🧾" },
        { value: inProductionOrders, label: "En Producción", iconClass: "bg-info", icon: "🔥" },
    ];

    return (
        <div>
            <div className="metrics-grid" ref={gridRef}>
                {metrics.map(({ value, label, iconClass, icon }) => (
                    <div className="metric-card" key={label}>
                        <div className={`metric-icon ${iconClass}`}>{icon}</div>
                        <div className="metric-info">
                            <h3>{value}</h3>
                            <p>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder para próximas secciones del dashboard */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "8px" }}>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>
                        Pedidos recientes
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                        {pendingOrders === 0 ? "No hay pedidos pendientes" : `${pendingOrders} pedido(s) pendiente(s)`}
                    </p>
                </div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>
                        Resumen de inventario
                    </div>
                    <p style={{ color: "var(--muted)", fontSize: "13px" }}>
                        {totalIngredients} ingrediente(s) registrado(s)
                    </p>
                </div>
            </div>
        </div>
    );
};