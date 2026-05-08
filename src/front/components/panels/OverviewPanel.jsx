import React from 'react';
import { DashboardOverview } from '../DashboardOverview.jsx';

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