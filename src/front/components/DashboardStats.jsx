import React from 'react';

export const DashboardStats = ({ orders, recipes, calculateCost, fixedExpenses }) => {
    const { enabled: fixedEnabled, rate: fixedRate, totalMonthly, expenses } = fixedExpenses || { enabled: false, rate: 0, totalMonthly: 0, expenses: [] };

    const completedOrders = orders.filter(o =>
        o.status === "completed" || o.status === "sent" || o.status === "delivered" || o.status === "ready"
    );

    const calculateCostWithExpenses = (recipe) => {
        const baseCost = calculateCost(recipe);
        if (!fixedEnabled || fixedRate <= 0) return baseCost;
        return baseCost * (1 + fixedRate / 100);
    };

    const totalRevenue = completedOrders.reduce((a, b) =>
        a + ((b.items?.reduce((sum, item) => sum + (item.recipe_price || 0) * item.quantity, 0)) || 0), 0
    );

    const totalCost = completedOrders.reduce((a, b) =>
        a + ((b.items?.reduce((sum, item) => {
            const baseCost = (item.recipe_cost || 0) * item.quantity;
            return sum + (fixedEnabled ? baseCost * (1 + fixedRate / 100) : baseCost);
        }, 0)) || 0), 0
    );

    const totalProfit = totalRevenue - totalCost;
    const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    const inProductionCount = orders.filter(o => o.status === "in_production").length;
    const pendingCount = orders.filter(o => o.status === "pending").length;
    const cancelledCount = orders.filter(o => o.status === "cancelled").length;

    const recipesSold = Object.entries(orders.flatMap(o => o.items || []).reduce((acc, item) => {
        const key = item.recipe_name || 'Unknown';
        acc[key] = (acc[key] || { qty: 0, revenue: 0 });
        acc[key].qty += item.quantity || 0;
        acc[key].revenue += (item.recipe_price || 0) * (item.quantity || 0);
        return acc;
    }, {})).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

    const getMarginColor = (margin) => {
        if (margin >= 50) return '#22c55e';
        if (margin >= 30) return '#f59e0b';
        return '#ef4444';
    };

    const getMarginLabel = (margin) => {
        if (margin >= 50) return 'Excelente';
        if (margin >= 30) return 'Bueno';
        if (margin >= 15) return 'Bajo';
        return 'Crítico';
    };

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <h4>Ingresos Totales</h4>
                <h3>{totalRevenue.toFixed(2)}€</h3>
            </div>
            <div className="stat-card" style={{ backgroundColor: '#1a3d1a', border: '1px solid #22c55e' }}>
                <h4>Ganancia Neta</h4>
                <h3 style={{ color: '#22c55e' }}>{totalProfit.toFixed(2)}€</h3>
            </div>
            <div className="stat-card">
                <h4>Pedidos Entregados</h4>
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
            {fixedEnabled && totalMonthly > 0 && (
                <div className="stat-card" style={{ backgroundColor: '#3d2d1a', border: '1px solid #f59e0b' }}>
                    <h4>Gastos Fijos Mensuales</h4>
                    <h3 style={{ color: '#f59e0b' }}>{totalMonthly.toFixed(2)}€</h3>
                    <small style={{ color: '#aaa' }}>{fixedRate}% overhead</small>
                </div>
            )}
            <hr style={{ width: '100%', borderColor: '#3d3d5c' }} />
            <div className="stat-card full-width">
                <h4>Estado de Pedidos</h4>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', color: '#f59e0b' }}>{pendingCount}</div>
                        <small>Pendientes</small>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', color: '#3b82f6' }}>{inProductionCount}</div>
                        <small>En Producción</small>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', color: '#22c55e' }}>{completedOrders.length}</div>
                        <small>Entregados</small>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', color: '#ef4444' }}>{cancelledCount}</div>
                        <small>Cancelados</small>
                    </div>
                </div>
                {cancelledCount > 0 && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>
                        Tasa de cancelación: {((cancelledCount / orders.length) * 100).toFixed(1)}%
                    </div>
                )}
            </div>
            <hr style={{ width: '100%', borderColor: '#3d3d5c' }} />
            <div className="stat-card full-width">
                <h4>Recetas Más Vendidas</h4>
                <table style={{ width: '100%', marginTop: '10px', color: 'white' }}>
                    <thead><tr><th>Receta</th><th>Cantidad</th><th>Ingresos</th></tr></thead>
                    <tbody>
                        {recipesSold.length > 0 ? recipesSold.map(([name, data]) => (
                            <tr key={name}>
                                <td>{name}</td>
                                <td>{data.qty}</td>
                                <td>{data.revenue.toFixed(2)}€</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3" style={{ textAlign: 'center', color: '#666' }}>No hay datos</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="stat-card full-width">
                <h4>
                    Margen por Receta
                    {fixedEnabled && <span style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '10px' }}>(con gastos fijos)</span>}
                </h4>
                <table style={{ width: '100%', marginTop: '10px', color: 'white' }}>
                    <thead>
                        <tr>
                            <th>Receta</th>
                            <th>Coste{fixedEnabled ? ` (+${fixedRate}%)` : ''}</th>
                            <th>Precio</th>
                            <th>Margen</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recipes.map(r => {
                            const cost = calculateCostWithExpenses(r);
                            const margin = r.sale_price > 0 ? ((r.sale_price - cost) / r.sale_price * 100) : 0;
                            return (
                                <tr key={r.id}>
                                    <td>{r.name}</td>
                                    <td>{cost.toFixed(2)}€</td>
                                    <td>{r.sale_price}€</td>
                                    <td style={{ color: getMarginColor(margin) }}>{margin.toFixed(1)}%</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            backgroundColor: getMarginColor(margin) + '33',
                                            color: getMarginColor(margin)
                                        }}>
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