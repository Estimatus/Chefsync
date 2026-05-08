import React from "react";

export const DashboardIngredients = ({ ingredients, onNewIngredient, onEditIngredient }) => {
    return (
        <div>
            <button className="btn btn-warning mb-3" onClick={onNewIngredient}>
                <i className="fas fa-plus me-2"></i>Nuevo Ingrediente
            </button>
            <table className="table table-dark">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Unidad</th>
                        <th>Coste</th>
                        <th>Stock</th>
                        <th>Proveedor</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.map(ing => (
                        <tr key={ing.id}>
                            <td>{ing.name}</td>
                            <td>{ing.unit}</td>
                            <td>{ing.cost_per_unit}€/ud</td>
                            <td className={ing.current_stock < 5 ? "text-danger" : ""}>
                                {ing.current_stock} {ing.unit}
                            </td>
                            <td>{ing.supplier || "-"}</td>
                            <td>
                                {ing.current_stock > 0
                                    ? <span className="badge bg-success">✓</span>
                                    : <span className="badge bg-warning">Comprar</span>}
                            </td>
                            <td>
                                <button className="btn btn-sm btn-outline-warning me-1" onClick={() => onEditIngredient(ing)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
