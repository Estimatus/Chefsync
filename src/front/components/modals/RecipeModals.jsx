import React from "react";

export const NewRecipeModal = ({ show, onClose, newRecipe, setNewRecipe, ingredients, newRecipeIngredients, setNewRecipeIngredients, selectedIngToAdd, setSelectedIngToAdd, onAddIngredient, onSave }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                <h3>Nueva Receta</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <div>
                        <label>Nombre *</label>
                        <input value={newRecipe.name} onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} placeholder="Nombre del producto" className="form-input"/>
                    </div>
                    <div>
                        <label>Precio € *</label>
                        <input type="number" step="0.01" value={newRecipe.sale_price} onChange={e => setNewRecipe({...newRecipe, sale_price: e.target.value})} placeholder="0.00" className="form-input"/>
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

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginBottom: "16px" }}>
                    <label style={{ marginBottom: "10px" }}>Ingredientes / Materiales</label>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                        <select value={selectedIngToAdd} onChange={e => setSelectedIngToAdd(e.target.value)} className="form-input" style={{ flex: 1 }}>
                            <option value="">Seleccionar ingrediente...</option>
                            <option value="new" style={{ color: "var(--accent)" }}>+ Crear nuevo</option>
                            {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                        </select>
                        <button onClick={onAddIngredient} className="btn-primary" style={{ whiteSpace: "nowrap" }}>+ Agregar</button>
                    </div>

                    {newRecipeIngredients.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px", color: "var(--muted)", fontSize: "13px", background: "var(--bg3)", borderRadius: "10px" }}>
                            No hay ingredientes agregados
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                            {newRecipeIngredients.map(ing => (
                                <div key={ing.ingredient_id} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--accent)" }}>{ing.name}</span>
                                        <button
                                            onClick={() => setNewRecipeIngredients(newRecipeIngredients.filter(i => i.ingredient_id !== ing.ingredient_id))}
                                            className="btn-icon" style={{ color: "var(--accent3)", width: "22px", height: "22px", fontSize: "10px" }}
                                        >✕</button>
                                    </div>
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <input
                                            type="number" step="0.01" value={ing.quantity_needed}
                                            onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? {...i, quantity_needed: parseFloat(e.target.value) || 0} : i))}
                                            className="form-input" style={{ width: "70px", padding: "5px 8px", textAlign: "center" }}
                                        />
                                        <select
                                            value={ing.display_unit || ing.unit}
                                            onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? {...i, display_unit: e.target.value} : i))}
                                            className="form-input" style={{ padding: "5px 8px" }}
                                        >
                                            <option value={ing.unit}>{ing.unit}</option>
                                            {ing.unit === 'kg' && <option value="g">g</option>}
                                            {ing.unit === 'l' && <option value="ml">ml</option>}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onSave} className="btn-primary">Guardar Receta</button>
                </div>
            </div>
        </div>
    );
};