// =============================================================================
// ARCHIVO: StatsPanel.jsx
// DESCRIPCIÓN: Panel de estadísticas y análisis.
// Muestra métricas financieras y de producción.
// =============================================================================

import React from 'react';
import { DashboardStats } from '../DashboardStats.jsx';
import useGlobalReducer from '../../hooks/useGlobalReducer.jsx';

// =============================================================================
// COMPONENTE: StatsPanel
// =============================================================================
// Panel con estadísticas de pedidos, recetas y costos.
// Props: orders, recipes, calculateCost
// =============================================================================
export const StatsPanel = ({ orders, recipes, calculateCost }) => {
    const { store } = useGlobalReducer();
    const fixedExpenses = store.settings?.fixedExpenses || { enabled: false, rate: 0 };

    return (
        <DashboardStats
            orders={orders}
            recipes={recipes}
            calculateCost={calculateCost}
            fixedExpenses={fixedExpenses}
        />
    );
};