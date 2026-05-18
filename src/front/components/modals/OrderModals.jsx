import React from "react";

const ModalWrapper = ({ onClose, children, size = "" }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className={`modal-content ${size}`} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

const FormField = ({ label, children }) => (
    <div style={{ marginBottom: "16px" }}>
        <label>{label}</label>
        {children}
    </div>
);

export const NewOrderModal = ({ show, onClose, newOrder, setNewOrder, newOrderItems, setNewOrderItems, selectedRecipe, setSelectedRecipe, orderItemQty, setOrderItemQty, store, onAddItem, onSave }) => {
    if (!show) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <h3>Nuevo Pedido</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <FormField label="Cliente *">
                    <select value={newOrder.client_id} onChange={e => setNewOrder({...newOrder, client_id: e.target.value})} className="form-input">
                        <option value="">Seleccionar cliente...</option>
                        {store.clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </FormField>
                <FormField label="Fecha entrega *">
                    <input type="date" value={newOrder.delivery_date} onChange={e => setNewOrder({...newOrder, delivery_date: e.target.value})} className="form-input"/>
                </FormField>
            </div>

            <FormField label="Notas">
                <textarea
                    value={newOrder.notes || ''}
                    onChange={e => setNewOrder({...newOrder, notes: e.target.value})}
                    placeholder="Notas del pedido..."
                    className="form-input"
                    style={{ minHeight: "70px", resize: "vertical" }}
                />
            </FormField>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginBottom: "16px" }}>
                <label style={{ marginBottom: "10px" }}>Productos</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <select value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)} className="form-input" style={{ flex: 1 }}>
                        <option value="">Seleccionar producto...</option>
                        {store.recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <input
                        type="number" min="1" value={orderItemQty}
                        onChange={e => setOrderItemQty(parseInt(e.target.value) || 1)}
                        className="form-input" style={{ width: "70px" }}
                    />
                    <button onClick={onAddItem} className="btn-primary" style={{ whiteSpace: "nowrap" }}>+ Agregar</button>
                </div>

                {newOrderItems.length > 0 && (
                    <div style={{ background: "var(--bg3)", borderRadius: "10px", overflow: "hidden" }}>
                        {newOrderItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < newOrderItems.length - 1 ? "1px solid var(--border)" : "none" }}>
                                <span style={{ fontSize: "13px" }}>{item.name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>×{item.quantity}</span>
                                    <button onClick={() => setNewOrderItems(newOrderItems.filter((_, idx) => idx !== i))} className="btn-icon" style={{ color: "var(--accent3)", fontSize: "11px" }}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="modal-actions">
                <button onClick={onClose} className="btn-secondary">Cancelar</button>
                <button onClick={onSave} className="btn-primary">Crear Pedido</button>
            </div>
        </ModalWrapper>
    );
};

export const EditOrderModal = ({ show, onClose, order, setOrder, editOrderItems, setEditOrderItems, selectedRecipe, setSelectedRecipe, orderItemQty, setOrderItemQty, store, onAddItem, onSave }) => {
    if (!show || !order) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <h3>Editar Pedido #{order.id}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <FormField label="Fecha entrega">
                    <input type="date" value={order.delivery_date} onChange={e => setOrder({...order, delivery_date: e.target.value})} className="form-input"/>
                </FormField>
                <FormField label="Notas">
                    <input value={order.notes || ''} onChange={e => setOrder({...order, notes: e.target.value})} placeholder="Notas" className="form-input"/>
                </FormField>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginBottom: "16px" }}>
                <label style={{ marginBottom: "10px" }}>Productos</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <select value={selectedRecipe} onChange={e => setSelectedRecipe(e.target.value)} className="form-input" style={{ flex: 1 }}>
                        <option value="">Seleccionar producto...</option>
                        {store.recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <input type="number" min="1" value={orderItemQty} onChange={e => setOrderItemQty(parseInt(e.target.value) || 1)} className="form-input" style={{ width: "70px" }}/>
                    <button onClick={onAddItem} className="btn-primary" style={{ whiteSpace: "nowrap" }}>+ Agregar</button>
                </div>

                {editOrderItems.length > 0 && (
                    <div style={{ background: "var(--bg3)", borderRadius: "10px", overflow: "hidden" }}>
                        {editOrderItems.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < editOrderItems.length - 1 ? "1px solid var(--border)" : "none" }}>
                                <span style={{ fontSize: "13px" }}>{item.name || item.recipe_name}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>×{item.quantity}</span>
                                    <button onClick={() => setEditOrderItems(editOrderItems.filter((_, idx) => idx !== i))} className="btn-icon" style={{ color: "var(--accent3)", fontSize: "11px" }}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="modal-actions">
                <button onClick={onClose} className="btn-secondary">Cancelar</button>
                <button onClick={onSave} className="btn-primary">Guardar</button>
            </div>
        </ModalWrapper>
    );
};

export const DeleteConfirmModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;
    return (
        <ModalWrapper onClose={onClose} size="small">
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗑️</div>
                <h3 style={{ marginBottom: "8px" }}>{title || "¿Eliminar?"}</h3>
                <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "24px" }}>{message || "Esta acción no se puede deshacer"}</p>
                <div className="modal-actions center">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Eliminar</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export const ProductionConfirmModal = ({ show, onClose, onConfirm, orderId }) => {
    if (!show) return null;
    return (
        <ModalWrapper onClose={onClose} size="small">
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🍳</div>
                <h3 style={{ marginBottom: "8px" }}>¿Iniciar producción?</h3>
                <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "24px" }}>
                    Se descontará el inventario automáticamente para el pedido #{orderId}.
                </p>
                <div className="modal-actions center">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-primary">Confirmar</button>
                </div>
            </div>
        </ModalWrapper>
    );
};