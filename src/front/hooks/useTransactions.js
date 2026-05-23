// =============================================================================
// HOOK: useTransactions
// Hook de React para manejar transacciones de caja desde el frontend.
// =============================================================================

import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

export const useTransactions = (backendUrl) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);

    // =============================================================================
    // FETCH TRANSACTIONS - Obtener lista de transacciones
    // Params: month (YYYY-MM), type (income|expense)
    // =============================================================================
    const fetchTransactions = useCallback(async (month = null, type = null) => {
        try {
            setLoading(true);
            let url = `${backendUrl}/api/transactions`;
            const params = new URLSearchParams();
            if (month) params.append('month', month);
            if (type) params.append('type', type);
            if (params.toString()) url += `?${params.toString()}`;

            const resp = await apiFetch(url);
            const data = await resp.json();
            setTransactions(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [backendUrl]);

    // =============================================================================
    // FETCH SUMMARY - Obtener resumen financiero (KPIs)
    // =============================================================================
    const fetchSummary = useCallback(async (month = null) => {
        try {
            const currentMonth = month || new Date().toISOString().slice(0, 7);
            const resp = await apiFetch(`${backendUrl}/api/transactions/summary?month=${currentMonth}`);
            const data = await resp.json();
            setSummary(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [backendUrl]);

    // =============================================================================
    // CREATE TRANSACTION - Registrar nuevo movimiento
    // =============================================================================
    const createTransaction = useCallback(async (transaction) => {
        try {
            setLoading(true);
            const resp = await apiFetch(`${backendUrl}/api/transactions`, {
                method: 'POST',
                body: JSON.stringify({
                    ...transaction,
                    amount: parseFloat(transaction.amount) || 0,
                })
            });
            if (!resp.ok) throw new Error('Error al crear transacción');
            await fetchTransactions();
            await fetchSummary();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchTransactions, fetchSummary]);

    // =============================================================================
    // DELETE TRANSACTION - Eliminar un movimiento
    // =============================================================================
    const deleteTransaction = useCallback(async (id) => {
        try {
            setLoading(true);
            await apiFetch(`${backendUrl}/api/transactions/${id}`, { method: 'DELETE' });
            await fetchTransactions();
            await fetchSummary();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [backendUrl, fetchTransactions, fetchSummary]);

    return {
        loading,
        error,
        transactions,
        summary,
        fetchTransactions,
        fetchSummary,
        createTransaction,
        deleteTransaction,
        clearError: () => setError(null)
    };
};