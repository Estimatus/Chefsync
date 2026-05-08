import React from "react";

export const DashboardSidebar = ({ activeTab, setActiveTab, darkMode, toggleDarkMode, connected, isOnline, pendingCount, store, pendingOrders }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <h4><i className="fas fa-utensils text-warning me-2"></i>ChefSync</h4>
                    <button
                        onClick={toggleDarkMode}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#f59e0b',
                            fontSize: '18px'
                        }}
                        title={darkMode ? "Modo claro" : "Modo oscuro"}
                    >
                        <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>
                    </button>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
                    <span className="badge bg-warning text-dark">Admin</span>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px'}}>
                        <span style={{color: isOnline ? '#22c55e' : '#ef4444'}} title="Red">
                            <i className={`fas fa-wifi ${isOnline ? 'text-success' : 'text-danger'}`}></i>
                        </span>
                        <span style={{color: connected ? '#22c55e' : '#ef4444'}} title="WebSocket">
                            <i className={`fas fa-plug ${connected ? 'text-success' : 'text-danger'}`}></i>
                        </span>
                        {pendingCount > 0 && (
                            <span style={{color: '#f59e0b'}} title={`${pendingCount} pedidos sin enviar`}>
                                <i className="fas fa-cloud-upload-alt"></i> {pendingCount}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <nav className="sidebar-nav">
                <a className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}><i className="fas fa-chart-line me-2"></i>Resumen</a>
                <a className={activeTab === "ingredients" ? "active" : ""} onClick={() => setActiveTab("ingredients")}><i className="fas fa-carrot me-2"></i>Ingredientes<span className="badge bg-danger">{store.alerts.lowStock.length}</span></a>
                <a className={activeTab === "recipes" ? "active" : ""} onClick={() => setActiveTab("recipes")}><i className="fas fa-book me-2"></i>Recetas<span className="badge bg-warning">{store.alerts.marginAlerts.length}</span></a>
                <a className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}><i className="fas fa-clipboard-list me-2"></i>Pedidos<span className="badge bg-info">{pendingOrders}</span></a>
                <a className={activeTab === "clients" ? "active" : ""} onClick={() => setActiveTab("clients")}><i className="fas fa-users me-2"></i>Clientes</a>
                <a className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}><i className="fas fa-chart-bar me-2"></i>Estadísticas</a>
                <a onClick={() => window.location.href = "/settings"}><i className="fas fa-cog me-2"></i>Configuración</a>
                <a className="logout" onClick={() => {localStorage.removeItem("user"); window.location.href = "/login";}}><i className="fas fa-sign-out-alt me-2"></i>Salir</a>
            </nav>
        </div>
    );
};
