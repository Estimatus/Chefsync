import React from "react";

const ModalWrapper = ({ onClose, children, size = "small" }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className={`modal-content ${size}`} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

export const NewIngredientModal = ({ show, onClose, newIngredient, setNewIngredient, onSave, ingredientSource }) => {
    if (!show) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <h3>{ingredientSource === 'recipe' ? 'Nuevo Ingrediente para Receta' : 'Nuevo Ingrediente'}</h3>

            <div style={{ marginBottom: "16px" }}>
                <label>Nombre *</label>
                <input value={newIngredient.name} onChange={e => setNewIngredient({...newIngredient, name: e.target.value})} placeholder="Ej: Queso azul" className="form-input"/>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                    <label>Unidad *</label>
                    <select value={newIngredient.unit} onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})} className="form-input">
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="ud">ud</option>
                    </select>
                </div>
                <div>
                    <label>Precio € *</label>
                    <input type="number" step="0.01" value={newIngredient.cost_per_unit} onChange={e => setNewIngredient({...newIngredient, cost_per_unit: e.target.value})} placeholder="0.00" className="form-input"/>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div>
                    <label>Stock inicial</label>
                    <input type="number" value={newIngredient.current_stock} onChange={e => setNewIngredient({...newIngredient, current_stock: e.target.value})} placeholder="0" className="form-input"/>
                </div>
                <div>
                    <label>Proveedor</label>
                    <input value={newIngredient.supplier || ''} onChange={e => setNewIngredient({...newIngredient, supplier: e.target.value})} placeholder="Nombre" className="form-input"/>
                </div>
            </div>

            <div className="modal-actions">
                <button onClick={onClose} className="btn-secondary">
                    {ingredientSource === 'recipe' ? 'Cerrar' : 'Cancelar'}
                </button>
                <button onClick={onSave} className="btn-primary">
                    {ingredientSource === 'recipe' ? 'Crear y agregar otro' : 'Crear'}
                </button>
            </div>
        </ModalWrapper>
    );
};

export const EditIngredientModal = ({ show, ingredient, onClose, onSave }) => {
    if (!show || !ingredient) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <h3>Editar Ingrediente</h3>

            <div style={{ marginBottom: "16px" }}>
                <label>Nombre *</label>
                <input value={ingredient.name} onChange={e => onSave({...ingredient, name: e.target.value})} placeholder="Ej: Queso azul" className="form-input"/>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                    <label>Unidad *</label>
                    <select value={ingredient.unit} onChange={e => onSave({...ingredient, unit: e.target.value})} className="form-input">
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="ud">ud</option>
                    </select>
                </div>
                <div>
                    <label>Precio € *</label>
                    <input type="number" step="0.01" value={ingredient.cost_per_unit} onChange={e => onSave({...ingredient, cost_per_unit: e.target.value})} placeholder="0.00" className="form-input"/>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div>
                    <label>Stock</label>
                    <input type="number" value={ingredient.current_stock} onChange={e => onSave({...ingredient, current_stock: e.target.value})} placeholder="0" className="form-input"/>
                </div>
                <div>
                    <label>Proveedor</label>
                    <input value={ingredient.supplier || ''} onChange={e => onSave({...ingredient, supplier: e.target.value})} placeholder="Nombre" className="form-input"/>
                </div>
            </div>

            <div className="modal-actions">
                <button onClick={onClose} className="btn-secondary">Cancelar</button>
                <button onClick={() => onSave(ingredient)} className="btn-primary">Guardar</button>
            </div>
        </ModalWrapper>
    );
};