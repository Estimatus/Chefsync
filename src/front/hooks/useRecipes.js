import { useState, useCallback } from 'react';

const convertToBaseUnit = (value, fromUnit, baseUnit) => {
    if (baseUnit === 'kg' && fromUnit === 'g') return value / 1000;
    if (baseUnit === 'l' && fromUnit === 'ml') return value / 1000;
    if (baseUnit === 'kg' && fromUnit === 'kg') return value;
    if (baseUnit === 'l' && fromUnit === 'l') return value;
    return value;
};

export const useRecipes = (backendUrl, dispatch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await fetch(`${backendUrl}/api/recipes`);
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

    const createRecipe = useCallback(async (recipe, ingredients) => {
        try {
            setLoading(true);
            const r = await fetch(`${backendUrl}/api/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...recipe, sale_price: parseFloat(recipe.sale_price) })
            });
            const createdRecipe = await r.json();

            for (const ing of ingredients) {
                const baseUnit = ing.unit || 'kg';
                const displayUnit = ing.display_unit || baseUnit;
                const convertedQty = convertToBaseUnit(ing.quantity_needed, displayUnit, baseUnit);
                await fetch(`${backendUrl}/api/recipes/${createdRecipe.id}/ingredients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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

    const updateRecipe = useCallback(async (id, recipe, editIngredients, originalIngredients) => {
        try {
            setLoading(true);
            await fetch(`${backendUrl}/api/recipes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...recipe, sale_price: parseFloat(recipe.sale_price) })
            });

            const currentIds = (originalIngredients || []).map(ing => ing.ingredient_id);
            const toRemove = editIngredients.filter(ing => ing.checked && ing.id);

            for (const ing of toRemove) {
                if (ing.ingredient_id) {
                    await fetch(`${backendUrl}/api/recipes/${id}/ingredients/${ing.ingredient_id}`, { method: 'DELETE' });
                }
            }

            const toUpdate = editIngredients.filter(ing => ing.id && currentIds.includes(ing.ingredient_id));
            for (const ing of toUpdate) {
                const baseUnit = ing.unit;
                const displayUnit = ing.display_unit || 'kg';
                const convertedQty = convertToBaseUnit(ing.quantity_needed, displayUnit, baseUnit);
                await fetch(`${backendUrl}/api/recipes/${id}/ingredients/${ing.ingredient_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity_needed: convertedQty })
                });
            }

            const toAdd = editIngredients.filter(ing => !currentIds.includes(ing.ingredient_id));
            for (const ing of toAdd) {
                const baseUnit = ing.unit || 'kg';
                const displayUnit = ing.display_unit || baseUnit;
                const convertedQty = convertToBaseUnit(ing.quantity_needed, displayUnit, baseUnit);
                await fetch(`${backendUrl}/api/recipes/${id}/ingredients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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

    const deleteRecipe = useCallback(async (id) => {
        try {
            setLoading(true);
            await fetch(`${backendUrl}/api/recipes/${id}`, { method: 'DELETE' });
            await fetchRecipes();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchRecipes]);

    const calculateCost = (recipe) => recipe?.ingredients?.reduce((a, b) => a + (b.calculated_cost || 0), 0) || 0;

    const calculateMargin = (recipe) => {
        if (!recipe || recipe.sale_price <= 0) return 0;
        return ((recipe.sale_price - calculateCost(recipe)) / recipe.sale_price) * 100;
    };

    const calculateMaxPlates = (recipe) => {
        if (!recipe?.ingredients) return 0;
        let max = Infinity;
        for (const ing of recipe.ingredients) {
            if (ing.quantity_needed > 0) max = Math.min(max, Math.floor(ing.current_stock / ing.quantity_needed));
        }
        return max === Infinity ? 0 : max;
    };

    return {
        loading,
        error,
        fetchRecipes,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        calculateCost,
        calculateMargin,
        calculateMaxPlates,
        clearError: () => setError(null)
    };
};