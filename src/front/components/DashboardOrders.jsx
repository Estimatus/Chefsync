import React from "react";
import { OrderStatusSelect } from "./shared/OrderComponents.jsx";

const statusConfig = {
    pending:       { label: "Pendiente",    class: "badge-purple" },
    confirmed:     { label: "Confirmado",   class: "badge-blue" },
    in_production: { label: "En producción",class: "badge-amber" },
    ready:         { label: "Listo",        class: "badge-green" },
    delivered:     { label: "Entregado",    class: "badge-gray" },
    cancelled:     { label: "Cancelado",    class: "badge-red" },
};

export const DashboardOrders = ({ orders, onStatusChange, onEditOrder, onStartProduction }) => {
    return (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["ID", "Cliente", "Fecha", "Items", "Estado", "Acciones"].map(h => (
                            <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                                No hay pedidos
                            </td>
                        </tr>
                    ) : orders.map((order, i) => {
                        const status = statusConfig[order.status] || { label: order.status, class: "badge-gray" };
                        const canProduce = order.status === "pending" || order.status === "confirmed";
                        const canDeliver = order.status === "ready";
                        return (
                            <tr key={order.id}
                                style={{ borderBottom: i < orders.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.12s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "12px 16px", fontSize: "13px", fontFamily: "var(--font-head)", fontWeight: 700, color: "var(--muted)" }}>#{order.id}</td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 500 }}>{order.client_name}</td>
                                <td style={{ padding: "12px 16px", fontSize: "12px", color: "var(--muted)" }}>{order.delivery_date}</td>
                                <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>{order.items?.length || 0}</td>
                                <td style={{ padding: "12px 16px" }}>
                                    <span className={`badge ${status.class}`}>{status.label}</span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <button className="btn-icon" onClick={() => onEditOrder(order)} title="Editar">✏️</button>
                                        <button
                                            className="btn-secondary"
                                            style={{ fontSize: "11px", padding: "5px 10px", opacity: canProduce ? 1 : 0.4 }}
                                            onClick={() => onStartProduction(order.id)}
                                            disabled={!canProduce}
                                        >
                                            Producir
                                        </button>
                                        <button
                                            className="btn-primary"
                                            style={{ fontSize: "11px", padding: "5px 10px", opacity: canDeliver ? 1 : 0.4 }}
                                            onClick={() => onStatusChange(order.id, 'delivered')}
                                            disabled={!canDeliver}
                                        >
                                            Entregar
                                        </button>
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