import React from "react";

export const DashboardOverview = ({ totalRecipes, totalIngredients, pendingOrders, inProductionOrders }) => {
    return (
        <div className="metrics-grid">
            <div className="metric-card">
                <div className="metric-icon bg-primary"><i className="fas fa-book"></i></div>
                <div className="metric-info"><h3>{totalRecipes}</h3><p>Recetas</p></div>
            </div>
            <div className="metric-card">
                <div className="metric-icon bg-success"><i className="fas fa-carrot"></i></div>
                <div className="metric-info"><h3>{totalIngredients}</h3><p>Ingredientes</p></div>
            </div>
            <div className="metric-card">
                <div className="metric-icon bg-warning"><i className="fas fa-clipboard-list"></i></div>
                <div className="metric-info"><h3>{pendingOrders}</h3><p>Pedidos</p></div>
            </div>
            <div className="metric-card">
                <div className="metric-icon bg-info"><i className="fas fa-fire"></i></div>
                <div className="metric-info"><h3>{inProductionOrders}</h3><p>En Producción</p></div>
            </div>
        </div>
    );
};