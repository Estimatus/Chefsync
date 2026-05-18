import { useState, useCallback } from 'react';

export const useOrders = (backendUrl, dispatch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await fetch(`${backendUrl}/api/orders`);
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

    const createOrder = useCallback(async (order, items) => {
        try {
            setLoading(true);
            const r = await fetch(`${backendUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...order, client_id: parseInt(order.client_id) })
            });
            const createdOrder = await r.json();

            for (const item of items) {
                await fetch(`${backendUrl}/api/orders/${createdOrder.id}/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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

    const updateOrderStatus = useCallback(async (orderId, newStatus) => {
        try {
            setLoading(true);
            await fetch(`${backendUrl}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (newStatus === 'cancelled') {
                const orderResp = await fetch(`${backendUrl}/api/orders/${orderId}`);
                const order = await orderResp.json();
                if (order?.items) {
                    for (const item of order.items) {
                        if (item.recipe?.ingredients) {
                            for (const ing of item.recipe.ingredients) {
                                const currentStock = parseFloat(ing.current_stock || 0);
                                const toRestore = parseFloat(ing.quantity_needed || 0) * parseInt(item.quantity || 1);
                                await fetch(`${backendUrl}/api/ingredients/${ing.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ current_stock: currentStock + toRestore })
                                });
                            }
                        }
                    }
                }
            }

            const [ordersResp, ingResp] = await Promise.all([
                fetch(`${backendUrl}/api/orders`),
                fetch(`${backendUrl}/api/ingredients`)
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

    const startProduction = useCallback(async (orderId) => {
        try {
            setLoading(true);
            const r = await fetch(`${backendUrl}/api/orders/${orderId}/production`, { method: 'PUT' });
            if (!r.ok) {
                const data = await r.json();
                throw new Error(data.errors?.join(', ') || 'Error al iniciar producción');
            }

            const [orders, lowStock, marginAlerts] = await Promise.all([
                fetch(`${backendUrl}/api/orders`),
                fetch(`${backendUrl}/api/ingredients/low-stock`),
                fetch(`${backendUrl}/api/recipes/alerts`)
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

    const updateOrder = useCallback(async (orderId, orderData, currentItems, newItems) => {
        try {
            setLoading(true);
            await fetch(`${backendUrl}/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delivery_date: orderData.delivery_date, notes: orderData.notes })
            });

            const currentItemIds = (currentItems || []).map(i => i.recipe_id);
            const newItemIds = newItems.map(i => i.id);

            for (const currentId of currentItemIds) {
                if (!newItemIds.includes(currentId)) {
                    await fetch(`${backendUrl}/api/orders/${orderId}/items/${currentId}`, { method: 'DELETE' });
                }
            }

            for (const item of newItems) {
                if (!currentItemIds.includes(item.id)) {
                    await fetch(`${backendUrl}/api/orders/${orderId}/items`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
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
        loading,
        error,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        startProduction,
        updateOrder,
        clearError: () => setError(null)
    };
};