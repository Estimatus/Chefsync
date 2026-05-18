import React, { useEffect, useRef } from "react";
import { animate } from "animejs";

export const DashboardRecipes = ({ recipes, calculateCost, calculateMargin, onViewRecipe, onDelete, onNewRecipe }) => {
    const tableRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (tableRef.current) {
            const rows = tableRef.current.querySelectorAll("tr");
            rows.forEach((row, index) => {
                animate(row, {
                    translateY: [20, 0],
                    opacity: [0, 1],
                    delay: index * 80,
                    easing: "easeOutQuad",
                    duration: 500
                });
            });
        }
    }, [recipes]);

    const handleButtonHover = () => {
        animate(buttonRef.current, {
            scale: 1.1,
            easing: "easeOutElastic(1, .8)",
            duration: 400
        });
    };

    const handleButtonLeave = () => {
        animate(buttonRef.current, {
            scale: 1,
            easing: "easeOutQuad",
            duration: 200
        });
    };

    const handleButtonClick = () => {
        animate(buttonRef.current, {
            keyframes: [
                { scale: 0.9, duration: 100 },
                { scale: 1.15, duration: 200 },
                { scale: 1, duration: 200 }
            ],
            easing: "easeOutElastic(1, .5)"
        });
        onNewRecipe();
    };

    return (
        <div>
            <button
                ref={buttonRef}
                className="btn btn-warning mb-3"
                onClick={handleButtonClick}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
            >
                <i className="fas fa-plus me-2"></i>Nueva Receta
            </button>
            <table className="table table-dark">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Coste</th>
                        <th>Margen</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody ref={tableRef}>
                    {recipes.map(recipe => {
                        const cost = calculateCost(recipe);
                        const margin = calculateMargin(recipe);
                        return (
                            <tr key={recipe.id}>
                                <td style={{cursor: 'pointer', color: '#f59e0b'}} onClick={() => onViewRecipe(recipe)}>
                                    {recipe.name}
                                </td>
                                <td>{recipe.category || 'Sin categoría'}</td>
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