import { useState, useCallback } from 'react';

export const useClients = (backendUrl, dispatch) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await fetch(`${backendUrl}/api/clients`);
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

    const createClient = useCallback(async (client) => {
        try {
            setLoading(true);
            await fetch(`${backendUrl}/api/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const updateClient = useCallback(async (id, client) => {
        try {
            setLoading(true);
            await fetch(`${backendUrl}/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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

    const deleteClient = useCallback(async (id) => {
        try {
            setLoading(true);
            await fetch(`${backendUrl}/api/clients/${id}`, { method: 'DELETE' });
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
        loading,
        error,
        fetchClients,
        createClient,
        updateClient,
        deleteClient,
        clearError: () => setError(null)
    };
};