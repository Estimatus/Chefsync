import React from "react";

export const DashboardClients = ({ clients, onNewClient }) => {
    return (
        <div>
            <button className="btn btn-warning mb-3" onClick={onNewClient}>
                <i className="fas fa-plus me-2"></i>Nuevo Cliente
            </button>
            <table className="table table-dark">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                    </tr>
                </thead>
                <tbody>
                    {clients?.map(c => (
                        <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.email || '-'}</td>
                            <td>{c.phone || '-'}</td>
                            <td>{c.address || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};