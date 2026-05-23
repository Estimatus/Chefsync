// =============================================================================
// ARCHIVO: useIngredients.js
// DESCRIPCIÓN: Hook de React para gestionar ingredientes.
// Provee funciones para CRUD completo de ingredientes y fetch de stock bajo.
// =============================================================================

import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

// =============================================================================
// HOOK: useIngredients
// =============================================================================
// Hook personalizado para operaciones con ingredientes.
// Params: backendUrl (string) - URL base del backend, dispatch (function) - dispatch del store
// Returns: Object con loading, error, y funciones CRUD
// =============================================================================
export const useIngredients = (backendUrl, dispatch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // =============================================================================
    // FUNCIÓN: fetchIngredients
    // =============================================================================
    // Obtiene lista de ingredientes del backend y actualiza el store.
    // Returns: Array de ingredientes o lanza error
    // =============================================================================
    const fetchIngredients = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/ingredients`);
            const data = await resp.json();
            dispatch({ type: 'set_ingredients', payload: data });
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, dispatch]);

    // =============================================================================
    // FUNCIÓN: createIngredient
    // =============================================================================
    // Crea un nuevo ingrediente. Si ya existe, suma al stock.
    // Params: ingredient (Object) - datos del ingrediente
    // Returns: boolean - true si éxito, false si error
    // =============================================================================
    const createIngredient = useCallback(async (ingredient) => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/ingredients`, {
                method: 'POST',
                body: JSON.stringify({
                    ...ingredient,
                    cost_per_unit: parseFloat(ingredient.cost_per_unit) || 0,
                    current_stock: parseFloat(ingredient.current_stock) || 0,
                    min_stock: parseFloat(ingredient.min_stock) || 5,
                    category: ingredient.category || 'General',
                })
            });
            if (!resp.ok) throw new Error('Error al crear ingrediente');
            await fetchIngredients();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchIngredients]);

    // =============================================================================
    // FUNCIÓN: updateIngredient
    // =============================================================================
    // Actualiza un ingrediente existente por ID.
    // Params: id (int) - ID del ingrediente, ingredient (Object) - nuevos datos
    // Returns: boolean - true si éxito, false si error
    // =============================================================================
    const updateIngredient = useCallback(async (id, ingredient) => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/ingredients/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: ingredient.name,
                    unit: ingredient.unit,
                    cost_per_unit: parseFloat(ingredient.cost_per_unit) || 0,
                    current_stock: parseFloat(ingredient.current_stock) || 0,
                    min_stock: parseFloat(ingredient.min_stock) || 5,
                    category: ingredient.category || 'General',
                    supplier: ingredient.supplier || ''
                })
            });
            if (!resp.ok) throw new Error('Error al actualizar ingrediente');
            await fetchIngredients();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchIngredients]);

    // =============================================================================
    // FUNCIÓN: deleteIngredient
    // =============================================================================
    // Elimina lógicamente un ingrediente (is_active = false).
    // Params: id (int) - ID del ingrediente a eliminar
    // Returns: boolean - true si éxito, false si error
    // =============================================================================
    const deleteIngredient = useCallback(async (id) => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/ingredients/${id}`, {
                method: 'DELETE'
            });
            if (!resp.ok) throw new Error('Error al eliminar ingrediente');
            await fetchIngredients();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchIngredients]);

    // =============================================================================
    // FUNCIÓN: fetchLowStock
    // =============================================================================
    // Obtiene ingredientes con stock por debajo del mínimo.
    // Returns: Array de ingredientes con stock bajo
    // =============================================================================
    const fetchLowStock = useCallback(async () => {
        try {
            const resp = await apiFetch(`${backendUrl}/api/ingredients/low-stock`);
            const data = await resp.json();
            dispatch({ type: 'set_low_stock_alerts', payload: data });
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        }
    }, [backendUrl, dispatch]);

    return {
        loading,
        error,
        fetchIngredients,
        createIngredient,
        updateIngredient,
        deleteIngredient,
        fetchLowStock,
        clearError: () => setError(null)
    };
};