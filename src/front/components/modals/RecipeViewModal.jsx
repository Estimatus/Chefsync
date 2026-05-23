// =============================================================================
// ARCHIVO: RecipeViewModal.jsx
// DESCRIPCIÓN: Modal para ver y editar recetas.
// Modo visualización y modo edición con gestión de ingredientes.
// =============================================================================

import React from "react";

// =============================================================================
// COMPONENTE: RecipeViewModal
// =============================================================================
// Modal completo para ver/editar receta.
// Props: show, recipe, editMode, setEditMode, editRecipe, setEditRecipe,
//        editIngredients, setEditIngredients, selectedIngToEdit, setSelectedIngToEdit,
//        store, onClose, onEditIngredient, onRemoveChecked, onAddIngredient, onSave
// =============================================================================
export const RecipeViewModal = ({ show, recipe, editMode, setEditMode, editRecipe, setEditRecipe, editIngredients, setEditIngredients, selectedIngToEdit, setSelectedIngToEdit, store, onClose, onEditIngredient, onRemoveChecked, onAddIngredient, onSave }) => {
    if (!show || !recipe) return null;

    return (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {/* MODO VISUALIZACIÓN */}
                {!editMode ? (
                    <>
                        <h2>{recipe.name}</h2>
                        <div style={{backgroundColor: '#22c55e', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px'}}>
                            <h3 style={{margin: 0}}>{recipe.sale_price}€</h3>
                            <small>Precio de venta</small>
                        </div>
                        <div style={{marginBottom: '20px'}}>
                            <strong>Categoría:</strong> {recipe.category || 'Sin categoría'}
                        </div>
                        <div style={{marginBottom: '20px'}}>
                            <strong>Ingredientes:</strong>
                            <ul style={{maxHeight: '200px', overflowY: 'auto'}}>
                                {recipe.ingredients?.map((ing, i) => (
                                    <li key={i}>{ing.ingredient_name}: {ing.quantity_needed} {ing.unit}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                            <button onClick={onClose} className="btn-secondary">Cerrar</button>
                            <button onClick={() => setEditMode(true)} className="btn-primary">Editar</button>
                        </div>
                    </>
                ) : (
                    /* MODO EDICIÓN */
                    <>
                        <h2>Editar Receta</h2>
                        <div className="modal-grid">
                            <div><label>Nombre</label><input value={editRecipe.name} onChange={e => setEditRecipe({...editRecipe, name: e.target.value})} className="form-input"/></div>
                            <div><label>Precio €</label><input type="number" value={editRecipe.sale_price} onChange={e => setEditRecipe({...editRecipe, sale_price: e.target.value})} className="form-input"/></div>
                            <div><label>Categoría</label>
                                <select value={editRecipe.category || ''} onChange={e => setEditRecipe({...editRecipe, category: e.target.value})} className="form-input">
                                    <option value="">Sin categoría</option>
                                    <option value="Entrantes">Entrantes</option>
                                    <option value="Primeros">Primeros</option>
                                    <option value="Segundos">Segundos</option>
                                    <option value="Postres">Postres</option>
                                    <option value="Bebidas">Bebidas</option>
                                    <option value="Aperitivos">Aperitivos</option>
                                </select>
                            </div>
                        </div>
                        <hr/>
                        <h4><i className="fas fa-carrot me-2"></i>Ingredientes</h4>
                        {/* Lista de ingredientes editables */}
                        {editIngredients.length > 0 ? (
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px'}}>
                                {editIngredients.map((ing) => (
                                    <div key={ing.id} style={{backgroundColor: ing.checked ? '#3d2d2d' : '#2d2d3f', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: ing.checked ? 0.6 : 1}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <strong style={{color: '#f59e0b'}}>{ing.ingredient_name || ing.name}</strong>
                                            <input type="checkbox" checked={ing.checked || false} onChange={() => onEditIngredient(ing.id)} style={{width: '18px', height: '18px', cursor: 'pointer'}}/>
                                        </div>
                                        <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                                            <input type="number" step="0.01" value={ing.quantity_needed} onChange={e => setEditIngredients(editIngredients.map(item => item.id === ing.id ? {...item, quantity_needed: parseFloat(e.target.value) || 0} : item))} style={{width: '70px', padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px', textAlign: 'center'}}/>
                                            <select value={ing.display_unit || ing.unit} onChange={e => setEditIngredients(editIngredients.map(item => item.id === ing.id ? {...item, display_unit: e.target.value} : item))} style={{padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px'}}>
                                                <option value={ing.unit}>{ing.unit}</option>
                                                {ing.unit === 'kg' && <option value="g">g</option>}
                                                {ing.unit === 'l' && <option value="ml">ml</option>}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{textAlign: 'center', padding: '20px', color: '#666', marginBottom: '15px'}}>
                                <i className="fas fa-inbox fa-2x mb-2"></i>
                                <p style={{margin: 0}}>No hay ingredientes</p>
                            </div>
                        )}
                        {/* Botón para eliminar ingredientes marcados */}
                        {editIngredients.some(ing => ing.checked) && <button onClick={onRemoveChecked} style={{backgroundColor: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '5px', color: 'white', marginBottom: '15px'}}><i className="fas fa-trash me-1"></i>Eliminar marcados</button>}
                        <hr/>
                        <h5><i className="fas fa-plus me-2"></i>Agregar ingrediente</h5>
                        <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                            <select value={selectedIngToEdit} onChange={e => setSelectedIngToEdit(e.target.value)} style={{flex: 1, minWidth: '200px', padding: '10px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}>
                                <option value="">Seleccionar existente...</option>
                                <option value="new" style={{color: '#f59e0b'}}>+ Crear nuevo</option>
                                {store.ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                            </select>
                            <button onClick={onAddIngredient} className="btn-primary"><i className="fas fa-plus me-1"></i>Agregar</button>
                        </div>
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                            <button onClick={() => {setEditMode(false);}} className="btn-secondary">Cancelar</button>
                            <button onClick={onSave} className="btn-primary">Guardar Cambios</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};