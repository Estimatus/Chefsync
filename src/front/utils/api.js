// =============================================================================
// ARCHIVO: api.js
// DESCRIPCIÓN: Helper para hacer peticiones al backend con tenant_id automático.
// Añade el header X-Tenant-ID desde localStorage a todas las peticiones.
// =============================================================================

export const apiFetch = (url, options = {}) => {
    // Obtener tenant_id del usuario en localStorage
    let tenantId = null;
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        tenantId = user?.tenant_id || user?.tenant?.id || null;
    } catch (e) {}

    // Construir headers con Content-Type y X-Tenant-ID
    const headers = {
        "Content-Type": "application/json",
        ...(tenantId ? { "X-Tenant-ID": String(tenantId) } : {}),
        ...(options.headers || {}),
    };

    // Ejecutar fetch con headers merged
    return fetch(url, { ...options, headers });
};