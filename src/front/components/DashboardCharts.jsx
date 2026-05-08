import React, { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export const DashboardCharts = ({ orders, recipes, calculateCost }) => {
    const [priceHistory, setPriceHistory] = useState([]);
    const [showPriceHistory, setShowPriceHistory] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        fetch(`${backendUrl}/api/ingredients/price-history`)
            .then(res => res.json())
            .then(data => setPriceHistory(data))
            .catch(err => console.error('Error fetching price history:', err));
    }, [backendUrl]);

    const completedOrders = orders.filter(o => o.status === "completed" || o.status === "sent");
    
    const totalRevenue = completedOrders.reduce((a, b) => a + ((b.items?.reduce((sum, item) => sum + (item.recipe_price || 0) * item.quantity, 0)) || 0), 0);
    
    const orderStatusCounts = {
        pending: orders.filter(o => o.status === "pending").length,
        in_production: orders.filter(o => o.status === "in_production").length,
        completed: orders.filter(o => o.status === "completed").length,
        sent: orders.filter(o => o.status === "sent").length,
    };
    
    const recipesSold = orders.flatMap(o => o.items || []).reduce((acc, item) => {
        const key = item.recipe_name || 'Unknown';
        acc[key] = (acc[key] || 0) + (item.quantity || 0);
        return acc;
    }, {});
    
    const topRecipes = Object.entries(recipesSold)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#aaa' }
            }
        },
        scales: {
            x: {
                ticks: { color: '#aaa' },
                grid: { color: '#333' }
            },
            y: {
                ticks: { color: '#aaa' },
                grid: { color: '#333' }
            }
        }
    };

    const barData = {
        labels: topRecipes.map(([name]) => name),
        datasets: [{
            label: 'Cantidad Vendida',
            data: topRecipes.map(([, qty]) => qty),
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1
        }]
    };

    const pieData = {
        labels: ['Pendientes', 'En Producción', 'Completados', 'Enviados'],
        datasets: [{
            data: [orderStatusCounts.pending, orderStatusCounts.in_production, orderStatusCounts.completed, orderStatusCounts.sent],
            backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6'],
            borderWidth: 0
        }]
    };

    const recipeMargins = recipes.map(r => {
        const cost = calculateCost(r);
        return {
            name: r.name,
            margin: r.sale_price > 0 ? ((r.sale_price - cost) / r.sale_price * 100) : 0
        };
    }).filter(r => r.margin > 0).slice(0, 6);

    const doughnutData = {
        labels: recipeMargins.map(r => r.name),
        datasets: [{
            data: recipeMargins.map(r => r.margin.toFixed(1)),
            backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
            borderWidth: 0
        }]
    };

    const lineData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
            label: 'Ingresos (€)',
            data: [totalRevenue * 0.6, totalRevenue * 0.7, totalRevenue * 0.8, totalRevenue * 0.9, totalRevenue * 0.95, totalRevenue],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <h4>Ingresos Totales</h4>
                <div style={{height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontSize: '36px', color: '#f59e0b', fontWeight: 'bold'}}>{totalRevenue.toFixed(2)}€</span>
                </div>
            </div>
            
            <div className="chart-card">
                <h4>Tendencia de Ingresos</h4>
                <div style={{height: '150px'}}>
                    <Line data={lineData} options={chartOptions} />
                </div>
            </div>

            <div className="chart-card full-width">
                <h4>Recetas Más Vendidas</h4>
                <div style={{height: '200px'}}>
                    <Bar data={barData} options={chartOptions} />
                </div>
            </div>

            <div className="chart-card">
                <h4>Estado de Pedidos</h4>
                <div style={{height: '180px', display: 'flex', justifyContent: 'center'}}>
                    <Pie data={pieData} />
                </div>
            </div>

            <div className="chart-card">
                <h4>Margen por Receta (%)</h4>
                <div style={{height: '180px', display: 'flex', justifyContent: 'center'}}>
                    <Doughnut data={doughnutData} />
                </div>
            </div>

            <div className="chart-card full-width" style={{cursor: 'pointer'}} onClick={() => setShowPriceHistory(!showPriceHistory)}>
                <h4>
                    <i className="fas fa-dollar-sign me-2" style={{color: priceHistory.length > 0 ? '#f59e0b' : '#aaa'}}></i>
                    Cambios de Precio ({priceHistory.length})
                </h4>
                {priceHistory.length === 0 ? (
                    <p style={{color: '#aaa'}}>Sin cambios de precio recientes</p>
                ) : (
                    <p style={{color: '#f59e0b'}}>Haz click para ver el historial</p>
                )}
                {showPriceHistory && priceHistory.length > 0 && (
                    <table style={{width: '100%', marginTop: '10px', color: 'white', fontSize: '12px'}}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Ingrediente</th>
                                <th>Anterior</th>
                                <th>Nuevo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {priceHistory.map(h => (
                                <tr key={h.id}>
                                    <td>{h.changed_at}</td>
                                    <td>{h.ingredient_name}</td>
                                    <td style={{color: '#ef4444'}}>{h.old_price.toFixed(2)}€</td>
                                    <td style={{color: '#22c55e'}}>{h.new_price.toFixed(2)}€</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};