// =============================================================================
// ARCHIVO: OverviewPanel.jsx
// DESCRIPCIÓN: Panel de resumen general del dashboard.
// Muestra métricas principales del negocio.
// =============================================================================

import React from 'react';
import { DashboardOverview } from '../DashboardOverview.jsx';

// =============================================================================
// COMPONENTE: OverviewPanel
// =============================================================================
// Panel con métricas generales: recetas, ingredientes, pedidos pendientes.
// Props: totalRecipes, totalIngredients, pendingOrders, inProductionOrders
// =============================================================================
export const OverviewPanel = ({ totalRecipes, totalIngredients, pendingOrders, inProductionOrders }) => {
    return (
        <DashboardOverview
            totalRecipes={totalRecipes}
            totalIngredients={totalIngredients}
            pendingOrders={pendingOrders}
            inProductionOrders={inProductionOrders}
        />
    );
};