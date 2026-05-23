// =============================================================================
// ARCHIVO: useRecipes.js
// DESCRIPCIÓN: Hook de React para gestionar recetas.
// Provee CRUD completo de recetas e ingredientes asociados.
// Incluye funciones utilitarias para cálculos de costo y margen.
// =============================================================================

import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

// =============================================================================
// FUNCIÓN: convertToBaseUnit
// =============================================================================
// Convierte cantidad de una unidad a otra (ej: g a kg).
// Params: value (number), fromUnit (string), baseUnit (string)
// Returns: number - valor convertido
// =============================================================================
const convertToBaseUnit = (value, fromUnit, baseUnit) => {
    if (baseUnit === 'kg' && fromUnit === 'g') return value / 1000;
    if (baseUnit === 'l' && fromUnit === 'ml') return value / 1000;
    return value;
};

// =============================================================================
// HOOK: useRecipes
// =============================================================================
// Hook personalizado para operaciones con recetas.
// Params: backendUrl (string), dispatch (function)
// Returns: Object con loading, error, funciones CRUD y utilitarias
// =============================================================================
export const useRecipes = (backendUrl, dispatch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // =============================================================================
    // FUNCIÓN: fetchRecipes
    // =============================================================================
    // Obtiene lista de recetas del backend.
    // Returns: Array de recetas
    // =============================================================================
    const fetchRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/recipes`);
            const data = await resp.json();
            dispatch({ type: 'set_recipes', payload: data });
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, dispatch]);

    // =============================================================================
    // FUNCIÓN: createRecipe
    // =============================================================================
    // Crea receta con ingredientes asociados en lote.
    // Params: recipe (Object), ingredients (Array) - ingredientes con cantidades
    // Returns: boolean - true si éxito
    // =============================================================================
    const createRecipe = useCallback(async (recipe, ingredients) => {
        try {
            setLoading(true);
            const r = await apiFetch(`${backendUrl}/api/recipes`, {
                method: 'POST',
                body: JSON.stringify({ ...recipe, sale_price: parseFloat(recipe.sale_price) })
            });
            const createdRecipe = await r.json();

            // Agregar cada ingrediente a la receta
            for (const ing of ingredients) {
                const baseUnit = ing.unit || 'kg';
                const displayUnit = ing.display_unit || baseUnit;
                const convertedQty = convertToBaseUnit(ing.quantity_needed, displayUnit, baseUnit);
                await apiFetch(`${backendUrl}/api/recipes/${createdRecipe.id}/ingredients`, {
                    method: 'POST',
                    body: JSON.stringify({ ingredient_id: ing.ingredient_id, quantity_needed: convertedQty })
                });
            }

            await fetchRecipes();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchRecipes]);

    // =============================================================================
    // FUNCIÓN: updateRecipe
    // =============================================================================
    // Actualiza receta y gestiona ingredientes (agrega, elimina, actualiza).
    // Params: id, recipe, editIngredients, originalIngredients
    // Returns: boolean
    // =============================================================================
    const updateRecipe = useCallback(async (id, recipe, editIngredients, originalIngredients) => {
        try {
            setLoading(true);
            // Actualizar datos básicos de la receta
            await apiFetch(`${backendUrl}/api/recipes/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...recipe, sale_price: parseFloat(recipe.sale_price) })
            });

            const currentIds = (originalIngredients || []).map(ing => ing.ingredient_id);
            // Ingredientes marcados para eliminar
            const toRemove = editIngredients.filter(ing => ing.checked && ing.id);

            // Eliminar ingredientes marcados
            for (const ing of toRemove) {
                if (ing.ingredient_id) {
                    await apiFetch(`${backendUrl}/api/recipes/${id}/ingredients/${ing.ingredient_id}`, { method: 'DELETE' });
                }
            }

            // Actualizar cantidades de ingredientes existentes
            const toUpdate = editIngredients.filter(ing => ing.id && currentIds.includes(ing.ingredient_id));
            for (const ing of toUpdate) {
                const convertedQty = convertToBaseUnit(ing.quantity_needed, ing.display_unit || 'kg', ing.unit);
                await apiFetch(`${backendUrl}/api/recipes/${id}/ingredients/${ing.ingredient_id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ quantity_needed: convertedQty })
                });
            }

            // Agregar nuevos ingredientes
            const toAdd = editIngredients.filter(ing => !currentIds.includes(ing.ingredient_id));
            for (const ing of toAdd) {
                const convertedQty = convertToBaseUnit(ing.quantity_needed, ing.display_unit || ing.unit || 'kg', ing.unit || 'kg');
                await apiFetch(`${backendUrl}/api/recipes/${id}/ingredients`, {
                    method: 'POST',
                    body: JSON.stringify({ ingredient_id: ing.ingredient_id, quantity_needed: convertedQty })
                });
            }

            await fetchRecipes();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchRecipes]);

    // =============================================================================
    // FUNCIÓN: deleteRecipe
    // =============================================================================
    // Elimina lógicamente una receta (is_active = false).
    // Params: id (int)
    // Returns: boolean
    // =============================================================================
    const deleteRecipe = useCallback(async (id) => {
        try {
            setLoading(true);
            await apiFetch(`${backendUrl}/api/recipes/${id}`, { method: 'DELETE' });
            await fetchRecipes();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchRecipes]);

    // =============================================================================
    // FUNCIÓN: calculateCost
    // =============================================================================
    // Calcula costo total de ingredientes de una receta.
    // Params: recipe (Object)
    // Returns: number - costo total
    // =============================================================================
    const calculateCost = (recipe) => recipe?.ingredients?.reduce((a, b) => a + (b.calculated_cost || 0), 0) || 0;

    // =============================================================================
    // FUNCIÓN: calculateMargin
    // =============================================================================
    // Calcula margen de ganancia de una receta en porcentaje.
    // Params: recipe (Object)
    // Returns: number - margen porcentual
    // =============================================================================
    const calculateMargin = (recipe) => {
        if (!recipe || recipe.sale_price <= 0) return 0;
        return ((recipe.sale_price - calculateCost(recipe)) / recipe.sale_price) * 100;
    };

    // =============================================================================
    // FUNCIÓN: calculateMaxPlates
    // =============================================================================
    // Calcula cuántas porciones máxima se pueden hacer según stock.
    // Params: recipe (Object)
    // Returns: number - cantidad máxima de porciones
    // =============================================================================
    const calculateMaxPlates = (recipe) => {
        if (!recipe?.ingredients) return 0;
        let max = Infinity;
        for (const ing of recipe.ingredients) {
            if (ing.quantity_needed > 0) max = Math.min(max, Math.floor(ing.current_stock / ing.quantity_needed));
        }
        return max === Infinity ? 0 : max;
    };

    return {
        loading, error,
        fetchRecipes, createRecipe, updateRecipe, deleteRecipe,
        calculateCost, calculateMargin, calculateMaxPlates,
        clearError: () => setError(null)
    };
};