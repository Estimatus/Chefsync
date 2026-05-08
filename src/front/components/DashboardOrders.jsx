import React from "react";
import { DashboardSidebar } from "./layout/DashboardSidebar.jsx";
import { OrderStatusSelect, OrderActions } from "./shared/OrderComponents.jsx";

export const DashboardOrders = ({ orders, onStatusChange, onEditOrder, onStartProduction, onNewOrder }) => {
    return (
        <div>
            <button className="btn btn-warning mb-3" onClick={onNewOrder}>
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
                                <OrderStatusSelect
                                    order={order}
                                    onStatusChange={onStatusChange}
                                    onStartProduction={onStartProduction}
                                    onEditOrder={onEditOrder}
                                />
                            </td>
                            <td>
                                <button className="btn btn-sm btn-outline-warning me-1" onClick={() => onEditOrder(order)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-info me-1"
                                    onClick={() => onStartProduction(order.id)}
                                    disabled={order.status !== "pending" && order.status !== "confirmed"}
                                >
                                    <i className="fas fa-utensils"></i> Producir
                                </button>
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => onStatusChange(order.id, 'delivered')}
                                    disabled={order.status !== "ready"}
                                >
                                    <i className="fas fa-check"></i> Entregar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
