import React, { useState, useMemo } from 'react';
import { DashboardRecipes } from '../DashboardRecipes.jsx';

export const RecipesPanel = ({ recipes, onViewRecipe, onDelete, onNewRecipe, onExport, calculateCost, calculateMargin }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

    const filteredData = useMemo(() => {
        if (!searchTerm) return recipes;
        const term = searchTerm.toLowerCase();
        return recipes.filter(rec =>
            rec.name?.toLowerCase().includes(term)
        );
    }, [recipes, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.perPage;
        return filteredData.slice(start, start + pagination.perPage);
    }, [filteredData, pagination.page, pagination.perPage]);

    const totalPages = Math.ceil(filteredData.length / pagination.perPage);

    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination(p => ({ ...p, page: 1 }));
    };

    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPagination(p => ({ ...p, page: newPage }));
        }
    };

    return (
        <>
            <div style={{ marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Buscar receta..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="form-input"
                    style={{ maxWidth: '300px' }}
                />
                <button className="btn-secondary" onClick={onExport} style={{ padding: '8px 15px' }}>
                    <i className="fas fa-download me-2"></i>Exportar CSV
                </button>
            </div>
            <DashboardRecipes
                recipes={paginatedData}
                calculateCost={calculateCost}
                calculateMargin={calculateMargin}
                onViewRecipe={onViewRecipe}
                onDelete={onDelete}
                onNewRecipe={onNewRecipe}
            />
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => changePage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        style={{ padding: '5px 10px' }}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <span style={{ color: '#aaa' }}>Página {pagination.page} de {totalPages}</span>
                    <button
                        className="btn-secondary"
                        onClick={() => changePage(pagination.page + 1)}
                        disabled={pagination.page === totalPages}
                        style={{ padding: '5px 10px' }}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
            <p style={{ textAlign: 'center', color: '#aaa', marginTop: '10px' }}>
                Mostrando {paginatedData.length} de {filteredData.length} recetas
            </p>
        </>
    );
};