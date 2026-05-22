import React from "react";

export const DashboardSidebar = ({ activeTab, setActiveTab, darkMode, toggleDarkMode, connected, isOnline, pendingCount, store, pendingOrders, isOpen, onClose }) => {
    const navMain = [
        {
            id: "overview",
            label: "Dashboard",
            badge: null,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        },
        {
            id: "orders",
            label: "Pedidos",
            badge: pendingOrders > 0 ? pendingOrders : null,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        },
        {
            id: "recipes",
            label: "Catálogo",
            badge: store.alerts?.marginAlerts?.length > 0 ? store.alerts.marginAlerts.length : null,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.97-1.67L23 6H6"/></svg>
        },
        {
            id: "ingredients",
            label: "Inventario",
            badge: store.alerts?.lowStock?.length > 0 ? store.alerts.lowStock.length : null,
            badgeColor: "var(--accent3)",
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        },
    ];

    const navBusiness = [
        {
            id: "clients",
            label: "Clientes",
            badge: null,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        },
        {
            id: "stats",
            label: "Analíticas",
            badge: null,
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        },
    ];

    const NavItem = ({ item }) => {
        const isActive = activeTab === item.id;
        return (
            <div
                onClick={() => { setActiveTab(item.id); onClose(); }}
                style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 10px", borderRadius: "9px", cursor: "pointer",
                    marginBottom: "2px", fontSize: "13px", position: "relative",
                    color: isActive ? "var(--accent)" : "var(--muted)",
                    background: isActive ? "rgba(200,240,96,0.12)" : "transparent",
                    fontWeight: isActive ? 500 : 400,
                    transition: "all 0.15s",
                    userSelect: "none",
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.color = "var(--text)"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}
            >
                {isActive && (
                    <div style={{ position: "absolute", left: 0, top: "6px", bottom: "6px", width: "3px", background: "var(--accent)", borderRadius: "0 3px 3px 0" }} />
                )}
                <div style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                </div>
                {item.label}
                {item.badge && (
                    <div style={{ marginLeft: "auto", background: item.badgeColor || "var(--accent3)", color: "#fff", fontSize: "10px", fontWeight: 600, padding: "1px 6px", borderRadius: "10px" }}>
                        {item.badge}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {isOpen && (
                <div onClick={onClose} style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    zIndex: 998, display: "block"
                }} />
            )}
            <aside style={{
                background: "var(--bg2)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                width: "220px",
                minHeight: "100vh",
                flexShrink: 0,
                position: "relative",
                zIndex: 999,
                transform: isOpen ? "translateX(0)" : undefined,
            }}>

                {/* Logo */}
                <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "34px", height: "34px", background: "var(--accent)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f0f11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                            </svg>
                        </div>
                        <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px", color: "var(--text)" }}>
                            Chef<span style={{ color: "var(--accent)" }}>sync</span>
                        </span>
                    </div>
                    {/* Dark mode toggle */}
                    <div onClick={toggleDarkMode} title={darkMode ? "Modo claro" : "Modo oscuro"} style={{ cursor: "pointer", color: "var(--muted)", fontSize: "14px", padding: "4px" }}>
                        {darkMode ? "☀️" : "🌙"}
                    </div>
                </div>

                {/* Status indicators */}
                <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: isOnline ? "var(--accent)" : "var(--accent3)" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: isOnline ? "var(--accent)" : "var(--accent3)" }} />
                        {isOnline ? "Online" : "Offline"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: connected ? "var(--accent)" : "var(--muted)" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: connected ? "var(--accent)" : "var(--muted)" }} />
                        WS
                    </div>
                    {pendingCount > 0 && (
                        <div style={{ marginLeft: "auto", fontSize: "10px", color: "var(--accent4)", display: "flex", alignItems: "center", gap: "4px" }}>
                            ↑ {pendingCount}
                        </div>
                    )}
                </div>

                {/* Tenant pill */}
                <div style={{ margin: "14px 14px 0", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #6c63ff, #c8f060)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#000", fontFamily: "var(--font-head)", flexShrink: 0 }}>
                        CS
                    </div>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text)" }}>Mi negocio</div>
                        <div style={{ fontSize: "10px", color: "var(--muted)" }}>Plan gratuito</div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ padding: "16px 12px", flex: 1 }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", padding: "0 8px", marginBottom: "6px", textTransform: "uppercase" }}>
                        Principal
                    </div>
                    {navMain.map(item => <NavItem key={item.id} item={item} />)}

                    <div style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--muted)", padding: "0 8px", marginBottom: "6px", marginTop: "20px", textTransform: "uppercase" }}>
                        Negocio
                    </div>
                    {navBusiness.map(item => <NavItem key={item.id} item={item} />)}
                </nav>

                {/* User + logout */}
                <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
                    <div
                        onClick={() => { localStorage.removeItem("user"); window.location.href = "/login"; }}
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "9px", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-head)", flexShrink: 0 }}>
                            {(() => { try { const u = JSON.parse(localStorage.getItem("user")); return u?.email?.charAt(0).toUpperCase() || "U"; } catch(e) { return "U"; } })()}
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {(() => { try { const u = JSON.parse(localStorage.getItem("user")); return u?.email?.split("@")[0] || "Usuario"; } catch(e) { return "Usuario"; } })()}
                            </div>
                            <div style={{ fontSize: "10px", color: "var(--muted)" }}>Cerrar sesión</div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </div>
                </div>
            </aside>
        </>
    );
};