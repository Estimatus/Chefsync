import React from "react";

export const NewRecipeModal = ({ show, onClose, newRecipe, setNewRecipe, ingredients, newRecipeIngredients, setNewRecipeIngredients, selectedIngToAdd, setSelectedIngToAdd, onAddIngredient, onSave }) => {
    if (!show) return null;

    const inputStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2d2d3f', color: 'white', width: '100%' };

    return (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Nueva Receta</h2>
                <div className="modal-grid">
                    <div>
                        <label>Nombre *</label>
                        <input value={newRecipe.name} onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} placeholder="Nombre" className="form-input"/>
                    </div>
                    <div>
                        <label>Precio € *</label>
                        <input type="number" value={newRecipe.sale_price} onChange={e => setNewRecipe({...newRecipe, sale_price: e.target.value})} placeholder="0.00" className="form-input"/>
                    </div>
                    <div>
                        <label>Categoría</label>
                        <select value={newRecipe.category || ''} onChange={e => setNewRecipe({...newRecipe, category: e.target.value})} className="form-input">
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
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                    <select value={selectedIngToAdd} onChange={e => setSelectedIngToAdd(e.target.value)} style={{...inputStyle, flex: 1, minWidth: '200px'}}>
                        <option value="">Seleccionar existente...</option>
                        <option value="new" style={{color: '#f59e0b'}}>+ Crear nuevo</option>
                        {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                    </select>
                    <button onClick={onAddIngredient} className="btn-primary"><i className="fas fa-plus me-1"></i>Agregar</button>
                </div>
                {newRecipeIngredients.length > 0 ? (
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px'}}>
                        {newRecipeIngredients.map(ing => (
                            <div key={ing.ingredient_id} style={{backgroundColor: '#2d2d3f', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <strong style={{color: '#f59e0b'}}>{ing.name}</strong>
                                    <button onClick={() => setNewRecipeIngredients(newRecipeIngredients.filter(i => i.ingredient_id !== ing.ingredient_id))} style={{backgroundColor: '#ef4444', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', color: 'white', fontSize: '12px'}}>X</button>
                                </div>
                                <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                                    <input type="number" step="0.01" value={ing.quantity_needed} onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? {...i, quantity_needed: parseFloat(e.target.value) || 0} : i))} style={{width: '70px', padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px', textAlign: 'center'}}/>
                                    <select value={ing.display_unit || ing.unit} onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? {...i, display_unit: e.target.value} : i))} style={{padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px'}}>
                                        <option value={ing.unit}>{ing.unit}</option>
                                        {ing.unit === 'kg' && <option value="g">g</option>}
                                        {ing.unit === 'l' && <option value="ml">ml</option>}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666', marginBottom: '20px'}}>
                        <i className="fas fa-inbox fa-2x mb-2"></i>
                        <p style={{margin: 0}}>No hay ingredientes agregados</p>
                    </div>
                )}
                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onSave} className="btn-primary">Guardar Receta</button>
                </div>
            </div>
        </div>
    );
};
