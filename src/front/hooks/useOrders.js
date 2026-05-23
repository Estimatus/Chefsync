// =============================================================================
// ARCHIVO: useOrders.js
// DESCRIPCIÓN: Hook de React para gestionar pedidos.
// Provee CRUD de pedidos, items, cambio de estado e inicio de producción.
// =============================================================================

import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

// =============================================================================
// HOOK: useOrders
// =============================================================================
// Hook personalizado para operaciones con pedidos.
// Params: backendUrl (string), dispatch (function)
// Returns: Object con loading, error, y funciones de gestión de pedidos
// =============================================================================
export const useOrders = (backendUrl, dispatch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // =============================================================================
    // FUNCIÓN: fetchOrders
    // =============================================================================
    // Obtiene lista de pedidos del backend.
    // Returns: Array de pedidos
    // =============================================================================
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/orders`);
            const data = await resp.json();
            dispatch({ type: 'set_orders', payload: data });
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, dispatch]);

    // =============================================================================
    // FUNCIÓN: createOrder
    // =============================================================================
    // Crea un pedido con sus items (recetas con cantidades).
    // Params: order (Object) - datos del pedido, items (Array) - items del pedido
    // Returns: boolean
    // =============================================================================
    const createOrder = useCallback(async (order, items) => {
        try {
            setLoading(true);
            const r = await apiFetch(`${backendUrl}/api/orders`, {
                method: 'POST',
                body: JSON.stringify({ ...order, client_id: parseInt(order.client_id) })
            });
            const createdOrder = await r.json();

            // Agregar cada item al pedido
            for (const item of items) {
                await apiFetch(`${backendUrl}/api/orders/${createdOrder.id}/items`, {
                    method: 'POST',
                    body: JSON.stringify({ recipe_id: item.id, quantity: item.quantity })
                });
            }

            await fetchOrders();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchOrders]);

    // =============================================================================
    // FUNCIÓN: updateOrderStatus
    // =============================================================================
    // Cambia el estado de un pedido (ej: pending -> completed).
    // Params: orderId (int), newStatus (string)
    // Returns: boolean
    // =============================================================================
    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        try {
            setLoading(true);
            await apiFetch(`${backendUrl}/api/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });

            // Recargar pedidos e ingredientes después del cambio
            const [ordersResp, ingResp] = await Promise.all([
                apiFetch(`${backendUrl}/api/orders`),
                apiFetch(`${backendUrl}/api/ingredients`)
            ]);
            dispatch({ type: 'set_orders', payload: await ordersResp.json() });
            dispatch({ type: 'set_ingredients', payload: await ingResp.json() });
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, dispatch]);

    // =============================================================================
    // FUNCIÓN: startProduction
    // =============================================================================
    // Inicia la producción del pedido: descuenta stock de ingredientes.
// Verifica stock suficiente y emite alertas si quedan很低.
// Params: orderId (int)
// Returns: boolean - true si se inició correctamente
// =============================================================================
    const startProduction = useCallback(async (orderId) => {
        try {
            setLoading(true);
            const r = await apiFetch(`${backendUrl}/api/orders/${orderId}/production`, { method: 'PUT' });
            if (!r.ok) {
                const data = await r.json();
                throw new Error(data.errors?.join(', ') || 'Error al iniciar producción');
            }

            // Recargar datos después de iniciar producción
            const [orders, lowStock, marginAlerts] = await Promise.all([
                apiFetch(`${backendUrl}/api/orders`),
                apiFetch(`${backendUrl}/api/ingredients/low-stock`),
                apiFetch(`${backendUrl}/api/recipes/alerts`)
            ]);
            dispatch({ type: 'set_orders', payload: await orders.json() });
            dispatch({ type: 'set_low_stock_alerts', payload: await lowStock.json() });
            dispatch({ type: 'set_margin_alerts', payload: await marginAlerts.json() });
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, dispatch]);

    // =============================================================================
    // FUNCIÓN: updateOrder
    // =============================================================================
    // Actualiza datos del pedido y gestiona items (agrega/elimina).
    // Params: orderId, orderData, currentItems, newItems
    // Returns: boolean
    // =============================================================================
    const updateOrder = useCallback(async (orderId, orderData, currentItems, newItems) => {
        try {
            setLoading(true);
            // Actualizar datos básicos del pedido
            await apiFetch(`${backendUrl}/api/orders/${orderId}`, {
                method: 'PUT',
                body: JSON.stringify({ delivery_date: orderData.delivery_date, notes: orderData.notes })
            });

            const currentItemIds = (currentItems || []).map(i => i.recipe_id);
            const newItemIds = newItems.map(i => i.id);

            // Eliminar items que ya no están
            for (const currentId of currentItemIds) {
                if (!newItemIds.includes(currentId)) {
                    await apiFetch(`${backendUrl}/api/orders/${orderId}/items/${currentId}`, { method: 'DELETE' });
                }
            }

            // Agregar items nuevos
            for (const item of newItems) {
                if (!currentItemIds.includes(item.id)) {
                    await apiFetch(`${backendUrl}/api/orders/${orderId}/items`, {
                        method: 'POST',
                        body: JSON.stringify({ recipe_id: item.id, quantity: item.quantity })
                    });
                }
            }

            await fetchOrders();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchOrders]);

    return {
        loading, error,
        fetchOrders, createOrder, updateOrderStatus, startProduction, updateOrder,
        clearError: () => setError(null)
    };
};