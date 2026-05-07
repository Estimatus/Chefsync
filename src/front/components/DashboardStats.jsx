import React from "react";

export const DashboardStats = ({ orders, recipes, calculateCost }) => {
    const completedOrders = orders.filter(o => o.status === "completed" || o.status === "sent");
    
    const totalRevenue = completedOrders.reduce((a, b) => a + ((b.items?.reduce((sum, item) => sum + (item.recipe_price || 0) * item.quantity, 0)) || 0), 0);
    
    const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
    
    const inProductionCount = orders.filter(o => o.status === "in_production").length;
    const pendingCount = orders.filter(o => o.status === "pending").length;
    
    const recipesSold = Object.entries(orders.flatMap(o => o.items || []).reduce((acc, item) => {
        const key = item.recipe_name || 'Unknown';
        acc[key] = (acc[key] || {qty: 0, revenue: 0});
        acc[key].qty += item.quantity || 0;
        acc[key].revenue += (item.recipe_price || 0) * (item.quantity || 0);
        return acc;
    }, {})).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <h4>Ingresos Totales</h4>
                <h3>{totalRevenue.toFixed(2)}€</h3>
            </div>
            <div className="stat-card">
                <h4>Pedidos Completados</h4>
                <h3>{completedOrders.length}</h3>
            </div>
            <div className="stat-card">
                <h4>Ticket Promedio</h4>
                <h3>{averageTicket.toFixed(2)}€</h3>
            </div>
            <div className="stat-card">
                <h4>Pedidos en Producción</h4>
                <h3>{inProductionCount}</h3>
            </div>
            <hr style={{width: '100%', borderColor: '#3d3d5c'}}/>
            <div className="stat-card full-width">
                <h4>Estado de Pedidos</h4>
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <div style={{flex: 1, textAlign: 'center'}}>
                        <div style={{fontSize: '24px', color: '#f59e0b'}}>{pendingCount}</div>
                        <small>Pending</small>
                    </div>
                    <div style={{flex: 1, textAlign: 'center'}}>
                        <div style={{fontSize: '24px', color: '#3b82f6'}}>{inProductionCount}</div>
                        <small>In Production</small>
                    </div>
                    <div style={{flex: 1, textAlign: 'center'}}>
                        <div style={{fontSize: '24px', color: '#22c55e'}}>{orders.filter(o => o.status === "completed").length}</div>
                        <small>Completed</small>
                    </div>
                    <div style={{flex: 1, textAlign: 'center'}}>
                        <div style={{fontSize: '24px', color: '#8b5cf6'}}>{orders.filter(o => o.status === "sent").length}</div>
                        <small>Sent</small>
                    </div>
                </div>
            </div>
            <hr style={{width: '100%', borderColor: '#3d3d5c'}}/>
            <div className="stat-card full-width">
                <h4>Recetas Más Vendidas</h4>
                <table style={{width: '100%', marginTop: '10px', color: 'white'}}>
                    <thead><tr><th>Receta</th><th>Cantidad</th><th>Ingresos</th></tr></thead>
                    <tbody>
                        {recipesSold.map(([name, data]) => (
                            <tr key={name}>
                                <td>{name}</td>
                                <td>{data.qty}</td>
                                <td>{data.revenue.toFixed(2)}€</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="stat-card full-width">
                <h4>Margen por Receta</h4>
                <table style={{width: '100%', marginTop: '10px', color: 'white'}}>
                    <thead><tr><th>Receta</th><th>Coste</th><th>Precio</th><th>Margen</th></tr></thead>
                    <tbody>
                        {recipes.map(r => {
                            const cost = calculateCost(r);
                            const margin = r.sale_price > 0 ? ((r.sale_price - cost) / r.sale_price * 100) : 0;
                            return (
                                <tr key={r.id}>
                                    <td>{r.name}</td>
                                    <td>{cost.toFixed(2)}€</td>
                                    <td>{r.sale_price}€</td>
                                    <td style={{color: margin >= 30 ? '#22c55e' : '#ef4444'}}>{margin.toFixed(1)}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};