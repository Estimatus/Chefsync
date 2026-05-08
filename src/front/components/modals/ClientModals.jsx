import React from "react";

export const NewClientModal = ({ show, onClose, newClient, setNewClient, onSave }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content small" onClick={e => e.stopPropagation()}>
                <h3>Nuevo Cliente</h3>
                <div style={{marginBottom: '15px'}}>
                    <label>Nombre *</label>
                    <input value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="Nombre" className="form-input"/>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                    <div>
                        <label>Email</label>
                        <input type="email" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="email@ejemplo.com" className="form-input"/>
                    </div>
                    <div>
                        <label>Teléfono</label>
                        <input value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="600 000 000" className="form-input"/>
                    </div>
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label>Dirección</label>
                    <input value={newClient.address || ''} onChange={e => setNewClient({...newClient, address: e.target.value})} placeholder="Dirección" className="form-input"/>
                </div>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onSave} className="btn-primary">Crear</button>
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

export const ConfirmModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center'}}>
                <h3>{title || '¿Continuar?'}</h3>
                <p>{message}</p>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-primary">Confirmar</button>
                </div>
            </div>
        </div>
    );
};
