import React from "react";

export const Toast = ({ message, type, onClose }) => {
    if (!message) return null;

    const styles = {
        success: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#22c55e',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            zIndex: 999999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        error: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            zIndex: 999999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }
    };

    return (
        <div style={type === 'error' ? styles.error : styles.success}>
            <i className={type === 'error' ? "fas fa-exclamation-circle" : "fas fa-check-circle"}></i>
            {message}
            <button onClick={onClose} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '10px'}}>
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export const LoadingOverlay = ({ show }) => {
    if (!show) return null;

    return (
        <div className="dashboard-submitting">
            <div className="spinner-container">
                <div className="spinner-border text-warning" style={{width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Guardando...</span>
                </div>
                <p>Guardando cambios...</p>
            </div>
        </div>
    );
};
