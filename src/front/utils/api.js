/**
 * Helper para hacer fetch al backend con tenant_id automático.
 * Usa este helper en lugar de fetch() directo en todos los hooks.
 */
export const apiFetch = (url, options = {}) => {
    // Obtener tenant_id del usuario en localStorage
    let tenantId = null;
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        tenantId = user?.tenant_id || user?.tenant?.id || null;
    } catch (e) {}

    const headers = {
        "Content-Type": "application/json",
        ...(tenantId ? { "X-Tenant-ID": String(tenantId) } : {}),
        ...(options.headers || {}),
    };

    return fetch(url, { ...options, headers });
};