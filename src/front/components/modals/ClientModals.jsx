import React from "react";

const ModalWrapper = ({ onClose, children, size = "small" }) => (
    <div className="modal-overlay" onClick={onClose}>
        <div className={`modal-content ${size}`} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    </div>
);

export const NewClientModal = ({ show, onClose, newClient, setNewClient, onSave }) => {
    if (!show) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <h3>Nuevo Cliente</h3>

            <div style={{ marginBottom: "16px" }}>
                <label>Nombre *</label>
                <input value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="Nombre completo" className="form-input"/>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                    <label>Email</label>
                    <input type="email" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="email@ejemplo.com" className="form-input"/>
                </div>
                <div>
                    <label>Teléfono</label>
                    <input value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="600 000 000" className="form-input"/>
                </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
                <label>Dirección</label>
                <input value={newClient.address || ''} onChange={e => setNewClient({...newClient, address: e.target.value})} placeholder="Dirección de entrega" className="form-input"/>
            </div>

            <div className="modal-actions">
                <button onClick={onClose} className="btn-secondary">Cancelar</button>
                <button onClick={onSave} className="btn-primary">Crear Cliente</button>
            </div>
        </ModalWrapper>
    );
};

export const ProductionConfirmModal = ({ show, onClose, onConfirm, orderId }) => {
    if (!show) return null;
    return (
        <ModalWrapper onClose={onClose}>
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

export const ConfirmModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
                <h3 style={{ marginBottom: "8px" }}>{title || "¿Continuar?"}</h3>
                <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "24px" }}>{message}</p>
                <div className="modal-actions center">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-primary">Confirmar</button>
                </div>
            </div>
        </ModalWrapper>
    );
};