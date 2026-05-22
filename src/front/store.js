export const initialStore = () => {
    let user = null;
    try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) user = JSON.parse(savedUser);
    } catch (e) {
        console.error("Error parsing user from localStorage:", e);
    }

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

export default function storeReducer(store, action = {}) {
    switch (action.type) {
        case 'set_user':
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
            localStorage.setItem("fixedExpenses", JSON.stringify(action.payload));
            return {
                ...store,
                settings: { ...store.settings, fixedExpenses: action.payload }
            };

        default:
            throw Error('Unknown action: ' + action.type);
    }
}