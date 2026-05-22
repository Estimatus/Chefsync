import React, { useRef } from "react";
import { animate } from "animejs";

export const OrderStatusSelect = ({ order, onStatusChange, onStartProduction, onEditOrder }) => {
    const selectRef = useRef(null);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'confirmed': return '#3b82f6';
            case 'in_production': return '#3b82f6';
            case 'ready': return '#8b5cf6';
            case 'delivered': return '#22c55e';
            case 'cancelled': return '#6b7280';
            default: return '#ef4444';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'in_production': 'En Producción',
            'ready': 'Listo',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return labels[status] || status;
    };

    const handleClick = () => {
        animate(selectRef.current, {
            scale: [1, 1.1, 1],
            duration: 300,
            easing: 'easeOutElastic(1, .5)'
        });
    };

    return (
        <select
            ref={selectRef}
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            onClick={handleClick}
            style={{
                padding: '5px',
                backgroundColor: getStatusColor(order.status),
                color: 'white',
                border: 'none',
                borderRadius: '4px'
            }}
        >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="in_production">En Producción</option>
            <option value="ready">Listo</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
        </select>
    );
};

export const OrderActions = ({ order, onStatusChange, onStartProduction, onEditOrder }) => {
    return (
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
    );
};
