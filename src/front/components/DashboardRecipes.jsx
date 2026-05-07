import React from "react";

export const DashboardRecipes = ({ recipes, calculateCost, calculateMargin, onViewRecipe, onDelete }) => {
    return (
        <div>
            <button className="btn btn-warning mb-3" onClick={() => {}}>
                <i className="fas fa-plus me-2"></i>Nueva Receta
            </button>
            <table className="table table-dark">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Coste</th>
                        <th>Margen</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {recipes.map(recipe => {
                        const cost = calculateCost(recipe);
                        const margin = calculateMargin(recipe);
                        return (
                            <tr key={recipe.id}>
                                <td style={{cursor: 'pointer', color: '#f59e0b'}} onClick={() => onViewRecipe(recipe)}>
                                    {recipe.name}
                                </td>
                                <td>{recipe.sale_price}€</td>
                                <td>{cost.toFixed(2)}€</td>
                                <td className={margin < 30 ? "text-danger" : "text-success"}>
                                    {margin.toFixed(1)}%
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-outline-warning me-1" onClick={() => onViewRecipe(recipe)}>
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(recipe.id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};