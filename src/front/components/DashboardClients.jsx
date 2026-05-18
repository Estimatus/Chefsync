import React from "react";

export const DashboardClients = ({ clients }) => {
    return (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["Nombre", "Email", "Teléfono", "Dirección"].map(h => (
                            <th key={h} style={{ padding: "12px 16px", fontSize: "10px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "left" }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {!clients || clients.length === 0 ? (
                        <tr>
                            <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                                No hay clientes registrados
                            </td>
                        </tr>
                    ) : clients.map((c, i) => (
                        <tr key={c.id}
                            style={{ borderBottom: i < clients.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.12s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                            <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "30px", height: "30px", borderRadius: "8px",
                                        background: "var(--bg4)", display: "flex", alignItems: "center",
                                        justifyContent: "center", fontSize: "11px", fontWeight: 700,
                                        color: "var(--accent)", fontFamily: "var(--font-head)", flexShrink: 0
                                    }}>
                                        {c.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: "13px", fontWeight: 500 }}>{c.name}</span>
                                </div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>{c.email || "—"}</td>
                            <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>{c.phone || "—"}</td>
                            <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--muted)" }}>{c.address || "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};