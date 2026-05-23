// =============================================================================
// ARCHIVO: OrdersPanel.jsx
// DESCRIPCIÓN: Panel de gestión de pedidos.
// Muestra lista de pedidos con búsqueda, paginación y acciones de estado.
// =============================================================================

import React, { useState, useMemo } from 'react';
import { DashboardOrders } from '../DashboardOrders.jsx';

// =============================================================================
// COMPONENTE: OrdersPanel
// =============================================================================
// Panel con tabla de pedidos, búsqueda y paginación.
// Props: orders, onStatusChange, onEditOrder, onStartProduction, onNewOrder, onExport
// =============================================================================
export const OrdersPanel = ({ orders, onStatusChange, onEditOrder, onStartProduction, onNewOrder, onExport }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

    // Filtrar pedidos por cliente, estado o fecha
    const filteredData = useMemo(() => {
        if (!searchTerm) return orders;
        const term = searchTerm.toLowerCase();
        return orders.filter(ord =>
            ord.client_name?.toLowerCase().includes(term) ||
            ord.status?.toLowerCase().includes(term) ||
            ord.delivery_date?.toLowerCase().includes(term)
        );
    }, [orders, searchTerm]);

    // Pedidos de la página actual
    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.perPage;
        return filteredData.slice(start, start + pagination.perPage);
    }, [filteredData, pagination.page, pagination.perPage]);

    // Total de páginas
    const totalPages = Math.ceil(filteredData.length / pagination.perPage);

    // Manejar búsqueda (reset a página 1)
    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination(p => ({ ...p, page: 1 }));
    };

    // Cambiar de página
    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPagination(p => ({ ...p, page: newPage }));
        }
    };

    return (
        <>
            {/* Header con botón, búsqueda y exportar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <button className="btn-primary" onClick={onNewOrder}>
                    + Nuevo Pedido
                </button>
                <input
                    type="text"
                    placeholder="Buscar por cliente, estado o fecha..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '300px' }}
                />
                <div style={{ marginLeft: 'auto' }}>
                    <button className="btn-secondary" onClick={onExport} style={{ padding: '8px 15px' }}>
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Tabla de pedidos */}
            <DashboardOrders
                orders={paginatedData}
                onStatusChange={onStatusChange}
                onEditOrder={onEditOrder}
                onStartProduction={onStartProduction}
                onNewOrder={onNewOrder}
            />

            {/* Paginación */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <button className="btn-secondary" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page === 1} style={{ padding: '5px 10px' }}>‹</button>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Página {pagination.page} de {totalPages}</span>
                    <button className="btn-secondary" onClick={() => changePage(pagination.page + 1)} disabled={pagination.page === totalPages} style={{ padding: '5px 10px' }}>›</button>
                </div>
            )}
            <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '10px', fontSize: '12px' }}>
                Mostrando {paginatedData.length} de {filteredData.length} pedidos
            </p>
        </>
    );
};