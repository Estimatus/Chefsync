// =============================================================================
// ARCHIVO: RecipesPanel.jsx
// DESCRIPCIÓN: Panel de gestión de recetas.
// Muestra catálogo con búsqueda, paginación y cálculos de costo/margen.
// =============================================================================

import React, { useState, useMemo } from 'react';
import { DashboardRecipes } from '../DashboardRecipes.jsx';

// =============================================================================
// COMPONENTE: RecipesPanel
// =============================================================================
// Panel con tabla de recetas, búsqueda y paginación.
// Props: recipes, onViewRecipe, onDelete, onNewRecipe, onExport,
//        calculateCost, calculateMargin
// =============================================================================
export const RecipesPanel = ({ recipes, onViewRecipe, onDelete, onNewRecipe, onExport, calculateCost, calculateMargin }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

    // Filtrar recetas por nombre
    const filteredData = useMemo(() => {
        if (!searchTerm) return recipes;
        const term = searchTerm.toLowerCase();
        return recipes.filter(rec =>
            rec.name?.toLowerCase().includes(term)
        );
    }, [recipes, searchTerm]);

    // Recetas de la página actual
    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.perPage;
        return filteredData.slice(start, start + pagination.perPage);
    }, [filteredData, pagination.page, pagination.perPage]);

    // Total de páginas
    const totalPages = Math.ceil(filteredData.length / pagination.perPage);

    // Manejar búsqueda (reset a página 1)
    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination(p => ({ ...p, page: 1 }));
    };

    // Cambiar de página
    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPagination(p => ({ ...p, page: newPage }));
        }
    };

    return (
        <>
            {/* Header con botón, búsqueda y exportar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <button className="btn-primary" onClick={onNewRecipe}>
                    + Nueva Receta
                </button>
                <input
                    type="text"
                    placeholder="Buscar receta..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '280px' }}
                />
                <div style={{ marginLeft: 'auto' }}>
                    <button className="btn-secondary" onClick={onExport} style={{ padding: '8px 15px' }}>
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Tabla de recetas */}
            <DashboardRecipes
                recipes={paginatedData}
                calculateCost={calculateCost}
                calculateMargin={calculateMargin}
                onViewRecipe={onViewRecipe}
                onDelete={onDelete}
                onNewRecipe={onNewRecipe}
            />

            {/* Paginación */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <button className="btn-secondary" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page === 1} style={{ padding: '5px 10px' }}>‹</button>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Página {pagination.page} de {totalPages}</span>
                    <button className="btn-secondary" onClick={() => changePage(pagination.page + 1)} disabled={pagination.page === totalPages} style={{ padding: '5px 10px' }}>›</button>
                </div>
            )}
            <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '10px', fontSize: '12px' }}>
                Mostrando {paginatedData.length} de {filteredData.length} recetas
            </p>
        </>
    );
};