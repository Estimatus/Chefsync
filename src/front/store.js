// Estado inicial de la aplicación
export const initialStore = () => {
    // Intentar recuperar usuario del localStorage
    let user = null;
    try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            user = JSON.parse(savedUser);
        }
    } catch (e) {
        console.error("Error parsing user from localStorage:", e);
    }

    return {
        // Estado de autenticación
        user: user,
        isAuthenticated: !!user,
        
        // Datos para la aplicación
        message: null,
        
        // Datos del dashboard
        ingredients: [],
        recipes: [],
        clients: [],
        orders: [],
        alerts: {
            lowStock: [],
            marginAlerts: [],
        }
    }
}

// Reducer para manejar acciones
export default function storeReducer(store, action = {}) {
    switch (action.type) {
        case 'set_user':
            // Guardar en localStorage
            if (action.payload) {
                localStorage.setItem("user", JSON.stringify(action.payload));
            } else {
                localStorage.removeItem("user");
            }
            return {
                ...store,
                user: action.payload,
                isAuthenticated: !!action.payload
            };
            
        case 'set_message':
            return {
                ...store,
                message: action.payload
            };
            
        case 'set_ingredients':
            return {
                ...store,
                ingredients: action.payload
            };
            
        case 'set_recipes':
            return {
                ...store,
                recipes: action.payload
            };
            
        case 'set_clients':
            return {
                ...store,
                clients: action.payload
            };
            
        case 'set_orders':
            return {
                ...store,
                orders: action.payload
            };
            
        case 'set_low_stock_alerts':
            return {
                ...store,
                alerts: {
                    ...store.alerts,
                    lowStock: action.payload
                }
            };
            
        case 'set_margin_alerts':
            return {
                ...store,
                alerts: {
                    ...store.alerts,
                    marginAlerts: action.payload
                }
            };
            
        default:
            throw Error('Unknown action.');
    }
}