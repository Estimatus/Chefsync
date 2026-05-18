import React, { useEffect, useRef } from 'react';
import { animate } from 'animejs';

export const DashboardStats = ({ orders, recipes, calculateCost, fixedExpenses }) => {
    const statsRef = useRef(null);

    const { enabled: fixedEnabled, rate: fixedRate, totalMonthly } = fixedExpenses || { enabled: false, rate: 0, totalMonthly: 0 };

    const completedOrders = orders.filter(o => ["completed","sent","delivered","ready"].includes(o.status));
    const inProductionCount = orders.filter(o => o.status === "in_production").length;
    const pendingCount = orders.filter(o => o.status === "pending").length;
    const cancelledCount = orders.filter(o => o.status === "cancelled").length;

    const calculateCostWithExpenses = (recipe) => {
        const baseCost = calculateCost(recipe);
        if (!fixedEnabled || fixedRate <= 0) return baseCost;
        return baseCost * (1 + fixedRate / 100);
    };

    const totalRevenue = completedOrders.reduce((a, b) =>
        a + ((b.items?.reduce((sum, item) => sum + (item.recipe_price || 0) * item.quantity, 0)) || 0), 0);

    const totalCost = completedOrders.reduce((a, b) =>
        a + ((b.items?.reduce((sum, item) => {
            const baseCost = (item.recipe_cost || 0) * item.quantity;
            return sum + (fixedEnabled ? baseCost * (1 + fixedRate / 100) : baseCost);
        }, 0)) || 0), 0);

    const totalProfit = totalRevenue - totalCost;
    const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    const recipesSold = Object.entries(
        orders.flatMap(o => o.items || []).reduce((acc, item) => {
            const key = item.recipe_name || 'Unknown';
            acc[key] = acc[key] || { qty: 0, revenue: 0 };
            acc[key].qty += item.quantity || 0;
            acc[key].revenue += (item.recipe_price || 0) * (item.quantity || 0);
            return acc;
        }, {})
    ).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

    const getMarginColor = (margin) => {
        if (margin >= 50) return "var(--accent)";
        if (margin >= 30) return "var(--accent4)";
        return "var(--accent3)";
    };

    const getMarginLabel = (margin) => {
        if (margin >= 50) return "Excelente";
        if (margin >= 30) return "Bueno";
        if (margin >= 15) return "Bajo";
        return "Crítico";
    };

    useEffect(() => {
        if (!statsRef.current) return;
        const cards = statsRef.current.querySelectorAll('.kpi-card');
        cards.forEach((card, i) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(12px)";
            animate(card, { translateY: [12, 0], opacity: [0, 1], delay: i * 80, easing: 'easeOutQuad', duration: 400 });
        });
    }, []);

    const KPI = ({ label, value, color, accent }) => (
        <div className="kpi-card" style={{
            background: "var(--bg2)", border: `1px solid ${accent ? accent + "33" : "var(--border)"}`,
            borderRadius: "14px", padding: "18px 20px",
        }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: "8px" }}>{label}</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", color: color || "var(--text)" }}>{value}</div>
        </div>
    );

    return (
        <div ref={statsRef} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                <KPI label="Ingresos totales" value={`${totalRevenue.toFixed(2)}€`} />
                <KPI label="Ganancia neta" value={`${totalProfit.toFixed(2)}€`} color="var(--accent)" accent="#c8f060" />
                <KPI label="Pedidos entregados" value={completedOrders.length} />
                <KPI label="Ticket promedio" value={`${averageTicket.toFixed(2)}€`} />
                <KPI label="En producción" value={inProductionCount} color="var(--accent4)" accent="#ffb347" />
                {fixedEnabled && totalMonthly > 0 && (
                    <KPI label="Gastos fijos/mes" value={`${totalMonthly.toFixed(2)}€`} color="var(--accent4)" accent="#ffb347" />
                )}
            </div>

            {/* Estado de pedidos */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
                <div style={{ fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>Estado de pedidos</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                    {[
                        { label: "Pendientes", value: pendingCount, color: "var(--accent4)" },
                        { label: "En producción", value: inProductionCount, color: "var(--accent2)" },
                        { label: "Entregados", value: completedOrders.length, color: "var(--accent)" },
                        { label: "Cancelados", value: cancelledCount, color: "var(--accent3)" },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: "var(--bg3)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-head)", fontSize: "24px", fontWeight: 700, color, marginBottom: "4px" }}>{value}</div>
                            <div style={{ fontSize: "11px", color: "var(--muted)" }}>{label}</div>
                        </div>
                    ))}
                </div>
                {cancelledCount > 0 && orders.length > 0 && (
                    <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--muted)" }}>
                        Tasa de cancelación: {((cancelledCount / orders.length) * 100).toFixed(1)}%
                    </div>
                )}
            </div>

            {/* Recetas más vendidas */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700 }}>
                    Productos más vendidos
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["Producto", "Cantidad", "Ingresos"].map(h => (
                                <th key={h} style={{ padding: "10px 16px", fontSize: "10px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {recipesSold.length === 0 ? (
                            <tr><td colSpan={3} style={{ padding: "30px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>Sin datos aún</td></tr>
                        ) : recipesSold.map(([name, data], i) => (
                            <tr key={name}
                                style={{ borderBottom: i < recipesSold.length - 1 ? "1px solid var(--border)" : "none" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 500 }}>{name}</td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>{data.qty}</td>
                                <td style={{ padding: "12px 16px", fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700, color: "var(--accent)" }}>{data.revenue.toFixed(2)}€</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Margen por receta */}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                    Margen por producto
                    {fixedEnabled && <span style={{ fontSize: "11px", color: "var(--accent4)", fontFamily: "var(--font-body)", fontWeight: 400 }}>con gastos fijos +{fixedRate}%</span>}
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["Producto", "Coste", "Precio", "Margen", "Estado"].map(h => (
                                <th key={h} style={{ padding: "10px 16px", fontSize: "10px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>No hay productos</td></tr>
                        ) : recipes.map((r, i) => {
                            const cost = calculateCostWithExpenses(r);
                            const margin = r.sale_price > 0 ? ((r.sale_price - cost) / r.sale_price * 100) : 0;
                            return (
                                <tr key={r.id}
                                    style={{ borderBottom: i < recipes.length - 1 ? "1px solid var(--border)" : "none" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 500 }}>{r.name}</td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>{cost.toFixed(2)}€</td>
                                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700 }}>{r.sale_price}€</td>
                                    <td style={{ padding: "12px 16px", fontFamily: "var(--font-head)", fontSize: "13px", fontWeight: 700, color: getMarginColor(margin) }}>{margin.toFixed(1)}%</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{ background: getMarginColor(margin) + "22", color: getMarginColor(margin), fontSize: "11px", fontWeight: 600, padding: "3px 9px", borderRadius: "20px" }}>
                                            {getMarginLabel(margin)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    );
};