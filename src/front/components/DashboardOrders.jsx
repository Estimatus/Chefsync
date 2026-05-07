import React from "react";

export const DashboardOrders = ({ orders, onStatusChange, onEditOrder, onStartProduction }) => {
    return (
        <div>
            <button className="btn btn-warning mb-3" onClick={() => {}}>
                <i className="fas fa-plus me-2"></i>Nuevo Pedido
            </button>
            <table className="table table-dark">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Items</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.client_name}</td>
                            <td>{order.delivery_date}</td>
                            <td>{order.items?.length || 0}</td>
                            <td>
                                <select 
                                    value={order.status} 
                                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                                    style={{
                                        padding: '5px', 
                                        backgroundColor: 
                                            order.status === 'pending' ? '#f59e0b' : 
                                            order.status === 'in_production' ? '#3b82f6' : 
                                            order.status === 'completed' ? '#22c55e' : '#ef4444', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px'
                                    }}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_production">In Production</option>
                                    <option value="completed">Completed</option>
                                    <option value="sent">Sent</option>
                                </select>
                            </td>
                            <td>
                                <button className="btn btn-sm btn-outline-warning me-1" onClick={() => onEditOrder(order)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-primary" 
                                    onClick={() => onStartProduction(order.id)}
                                    disabled={order.status !== "pending"}
                                >
                                    Producir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};