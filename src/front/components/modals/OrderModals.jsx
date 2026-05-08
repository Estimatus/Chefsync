import React from "react";

const inputStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2d2d3f', color: 'white', width: '100%' };

export const NewOrderModal = ({ show, onClose, newOrder, setNewOrder, newOrderItems, setNewOrderItems, selectedRecipe, setSelectedRecipe, orderItemQty, setOrderItemQty, store, onAddItem, onSave }) => {
    if (!show) return null;

    return (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Nuevo Pedido</h2>
                <div className="modal-grid">
                    <div><label>Cliente *</label><select value={newOrder.client_id} onChange={e => setNewOrder({...newOrder, client_id: e.target.value})} className="form-input">
                        <option value="">Seleccionar cliente...</option>
                        {store.clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select></div>
                    <div><label>Fecha entrega *</label><input type="date" value={newOrder.delivery_date} onChange={e => setNewOrder({...newOrder, delivery_date: e.target.value})} className="form-input"/></div>
                </div>
                <div style={{marginBottom: '20px'}}><label>Notas</label><textarea value={newOrder.notes || ''} onChange={e => setNewOrder({...newOrder, notes: e.target.value})} placeholder="Notas del pedido..." style={{...inputStyle, width: '100%', minHeight: '60px'}}/></div>
                <hr/>
                <h4>Items</h4>
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                    <select value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)} style={{...inputStyle, flex: 1, minWidth: '200px'}}>
                        <option value="">Seleccionar receta...</option>
                        {store.recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <input type="number" min="1" value={orderItemQty} onChange={e => setOrderItemQty(parseInt(e.target.value) || 1)} style={{width: '80px', padding: '10px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}/>
                    <button onClick={onAddItem} className="btn-primary">Agregar</button>
                </div>
                {newOrderItems.length > 0 && <table style={{width: '100%', marginBottom: '20px'}}><thead><tr><th>Receta</th><th>Cantidad</th><th></th></tr></thead><tbody>
                    {newOrderItems.map((item, i) => <tr key={i}><td>{item.name}</td><td>{item.quantity}</td><td><button onClick={() => setNewOrderItems(newOrderItems.filter((_, idx) => idx !== i))} style={{backgroundColor: '#ef4444', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>X</button></td></tr>)}
                </tbody></table>}
                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onSave} className="btn-primary">Crear Pedido</button>
                </div>
            </div>
        </div>
    );
};

export const EditOrderModal = ({ show, onClose, order, setOrder, editOrderItems, setEditOrderItems, selectedRecipe, setSelectedRecipe, orderItemQty, setOrderItemQty, store, onAddItem, onSave }) => {
    if (!show || !order) return null;

    return (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Editar Pedido #{order.id}</h3>
                <div className="modal-grid">
                    <div><label>Fecha entrega</label><input type="date" value={order.delivery_date} onChange={e => setOrder({...order, delivery_date: e.target.value})} className="form-input"/></div>
                    <div><label>Notas</label><input value={order.notes || ''} onChange={e => setOrder({...order, notes: e.target.value})} placeholder="Notas" className="form-input"/></div>
                </div>
                <hr/>
                <h4>Items</h4>
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                    <select value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)} style={{...inputStyle, flex: 1, minWidth: '200px'}}>
                        <option value="">Seleccionar receta...</option>
                        {store.recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <input type="number" min="1" value={orderItemQty} onChange={e => setOrderItemQty(parseInt(e.target.value) || 1)} style={{width: '80px', padding: '10px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}/>
                    <button onClick={onAddItem} className="btn-primary">Agregar</button>
                </div>
                {editOrderItems.length > 0 && <table style={{width: '100%', marginBottom: '20px'}}><thead><tr><th>Receta</th><th>Cantidad</th><th></th></tr></thead><tbody>
                    {editOrderItems.map((item, i) => <tr key={i}><td>{item.name || item.recipe_name}</td><td>{item.quantity}</td><td><button onClick={() => setEditOrderItems(editOrderItems.filter((_, idx) => idx !== i))} style={{backgroundColor: '#ef4444', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>X</button></td></tr>)}
                </tbody></table>}
                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onSave} className="btn-primary">Guardar</button>
                </div>
            </div>
        </div>
    );
};

export const DeleteConfirmModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center'}}>
                <h3>{title || '¿Eliminar?'}</h3>
                <p>{message || 'Esta acción no se puede deshacer'}</p>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Eliminar</button>
                </div>
            </div>
        </div>
    );
};

export const ProductionConfirmModal = ({ show, onClose, onConfirm, orderId }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center'}}>
                <h3><i className="fas fa-utensils text-warning me-2"></i>¿Iniciar producción?</h3>
                <p>Se descontará el inventario automáticamente.</p>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-primary">Confirmar</button>
                </div>
            </div>
        </div>
    );
};
