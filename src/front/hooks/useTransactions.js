// =============================================================================
// ARCHIVO: useTransactions.js
// DESCRIPCIÓN: Hook de React para gestionar transacciones de caja.
// Provee funciones para CRUD de transacciones y obtener resumen financiero.
// =============================================================================

import { useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';

// =============================================================================
// HOOK: useTransactions
// =============================================================================
// Hook personalizado para operaciones con transacciones.
// Params: backendUrl (string)
// Returns: Object con loading, error, transactions, summary, y funciones CRUD
// =============================================================================
export const useTransactions = (backendUrl) => {
    // Estados locales para UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);

    // =============================================================================
    // FUNCIÓN: fetchTransactions
    // =============================================================================
    // Obtiene lista de transacciones filtradas por mes/tipo.
    // Params: month (string, opcional) - "YYYY-MM", type (string, opcional) - "income"|"expense"
    // Returns: Array de transacciones
    // =============================================================================
    const fetchTransactions = useCallback(async (month = null, type = null) => {
        try {
            setLoading(true);

            // Construir URL con query params opcionales
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
    // FUNCIÓN: fetchSummary
    // =============================================================================
    // Obtiene resumen financiero (KPIs) del mes.
    // Params: month (string, opcional) - "YYYY-MM", default: mes actual
    // Returns: Object con total_income, total_expense, net, by_category, transaction_count
    // =============================================================================
    const fetchSummary = useCallback(async (month = null) => {
        try {
            const currentMonth = month || new Date().toISOString().slice(0, 7);

            const resp = await apiFetch(
                `${backendUrl}/api/transactions/summary?month=${currentMonth}`
            );
            const data = await resp.json();
            setSummary(data);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        }
    }, [backendUrl]);

    // =============================================================================
    // FUNCIÓN: createTransaction
    // =============================================================================
    // Registra un nuevo movimiento de caja.
    // Params: transaction (Object) - { type, amount, category, description, date }
    // Returns: boolean
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

            // Recargar después de crear
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
    // FUNCIÓN: deleteTransaction
    // =============================================================================
    // Elimina una transacción.
    // Params: id (int) - ID de la transacción
    // Returns: boolean
    // =============================================================================
    const deleteTransaction = useCallback(async (id) => {
        try {
            setLoading(true);

            await apiFetch(`${backendUrl}/api/transactions/${id}`, {
                method: 'DELETE'
            });

            // Recargar después de eliminar
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