// =============================================================================
// ARCHIVO: useClients.js
// DESCRIPCIÓN: Hook de React para gestionar clientes.
// Provee CRUD completo de clientes.
// =============================================================================

import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

// =============================================================================
// HOOK: useClients
// =============================================================================
// Hook personalizado para operaciones con clientes.
// Params: backendUrl (string), dispatch (function)
// Returns: Object con loading, error, y funciones CRUD
// =============================================================================
export const useClients = (backendUrl, dispatch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // =============================================================================
    // FUNCIÓN: fetchClients
    // =============================================================================
    // Obtiene lista de clientes activos del backend.
    // Returns: Array de clientes
    // =============================================================================
    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/clients`);
            const data = await resp.json();
            dispatch({ type: 'set_clients', payload: data });
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, dispatch]);

    // =============================================================================
    // FUNCIÓN: createClient
    // =============================================================================
    // Crea un nuevo cliente.
    // Params: client (Object) - datos del cliente
    // Returns: boolean - true si éxito
    // =============================================================================
    const createClient = useCallback(async (client) => {
        try {
            setLoading(true);
            await apiFetch(`${backendUrl}/api/clients`, {
                method: 'POST',
                body: JSON.stringify(client)
            });
            await fetchClients();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchClients]);

    // =============================================================================
    // FUNCIÓN: updateClient
    // =============================================================================
    // Actualiza un cliente existente.
    // Params: id (int), client (Object) - nuevos datos
    // Returns: boolean
    // =============================================================================
    const updateClient = useCallback(async (id, client) => {
        try {
            setLoading(true);
            await apiFetch(`${backendUrl}/api/clients/${id}`, {
                method: 'PUT',
                body: JSON.stringify(client)
            });
            await fetchClients();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchClients]);

    // =============================================================================
    // FUNCIÓN: deleteClient
    // =============================================================================
    // Elimina lógicamente un cliente (is_active = false).
    // Params: id (int)
    // Returns: boolean
    // =============================================================================
    const deleteClient = useCallback(async (id) => {
        try {
            setLoading(true);
            await apiFetch(`${backendUrl}/api/clients/${id}`, { method: 'DELETE' });
            await fetchClients();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchClients]);

    return {
        loading, error,
        fetchClients, createClient, updateClient, deleteClient,
        clearError: () => setError(null)
    };
};