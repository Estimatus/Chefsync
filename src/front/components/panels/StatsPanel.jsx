import React from 'react';
import { DashboardStats } from '../DashboardStats.jsx';
import useGlobalReducer from '../../hooks/useGlobalReducer.jsx';

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