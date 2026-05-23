// =============================================================================
// ARCHIVO: store.js
// DESCRIPCIÓN: Estado global de la aplicación y reducer para el store.
// Gestiona usuario, tenant, ingredientes, recetas, pedidos, clientes y alertas.
// Los datos persisten en localStorage.
// =============================================================================

// =============================================================================
// FUNCIÓN: initialStore
// =============================================================================
// Inicializa el estado global cargando datos desde localStorage.
// Returns: Object con estado inicial completo
// =============================================================================
export const initialStore = () => {
    let user = null;
    try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) user = JSON.parse(savedUser);
    } catch (e) {
        console.error("Error parsing user from localStorage:", e);
    }

    // Cargar gastos fijos desde localStorage
    let fixedExpenses = { enabled: false, rate: 0 };
    try {
        const savedFixedExpenses = localStorage.getItem("fixedExpenses");
        if (savedFixedExpenses) fixedExpenses = JSON.parse(savedFixedExpenses);
    } catch (e) {
        console.error("Error parsing fixedExpenses from localStorage:", e);
    }

    return {
        user: user,
        isAuthenticated: !!user,
        tenant: user?.tenant || null,
        message: null,
        ingredients: [],
        recipes: [],
        clients: [],
        orders: [],
        alerts: {
            lowStock: [],
            marginAlerts: [],
        },
        settings: {
            fixedExpenses: fixedExpenses
        }
    }
}

// =============================================================================
// FUNCIÓN: storeReducer
// =============================================================================
// Reducer central para actualizar el estado global.
// Actions: set_user, set_tenant, set_message, set_ingredients,
//          set_recipes, set_clients, set_orders, set_low_stock_alerts,
//          set_margin_alerts, set_fixed_expenses
// Params: store (Object) - estado actual, action (Object) - acción con type y payload
// Returns: Object - nuevo estado
// =============================================================================
export default function storeReducer(store, action = {}) {
    switch (action.type) {
        case 'set_user':
            // Guardar usuario en localStorage para persistencia
            if (action.payload) {
                localStorage.setItem("user", JSON.stringify(action.payload));
            } else {
                localStorage.removeItem("user");
            }
            return {
                ...store,
                user: action.payload,
                isAuthenticated: !!action.payload,
                tenant: action.payload?.tenant || null,
            };

        case 'set_tenant':
            return { ...store, tenant: action.payload };

        case 'set_message':
            return { ...store, message: action.payload };

        case 'set_ingredients':
            return { ...store, ingredients: action.payload };

        case 'set_recipes':
            return { ...store, recipes: action.payload };

        case 'set_clients':
            return { ...store, clients: action.payload };

        case 'set_orders':
            return { ...store, orders: action.payload };

        case 'set_low_stock_alerts':
            return {
                ...store,
                alerts: { ...store.alerts, lowStock: action.payload }
            };

        case 'set_margin_alerts':
            return {
                ...store,
                alerts: { ...store.alerts, marginAlerts: action.payload }
            };

        case 'set_fixed_expenses':
            // Persistir gastos fijos en localStorage
            localStorage.setItem("fixedExpenses", JSON.stringify(action.payload));
            return {
                ...store,
                settings: { ...store.settings, fixedExpenses: action.payload }
            };

        default:
            throw Error('Unknown action: ' + action.type);
    }
}