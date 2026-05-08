import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";
import { useSocket } from "../../hooks/useSocket.jsx";
import { useOfflineOrders, usePushNotifications } from "../../hooks/useOfflineOrders.jsx";
import { useIngredients } from "../../hooks/useIngredients.js";
import { useRecipes } from "../../hooks/useRecipes.js";
import { useOrders } from "../../hooks/useOrders.js";
import { useClients } from "../../hooks/useClients.js";
import { DashboardSidebar } from "../layout/DashboardSidebar.jsx";
import { Toast, LoadingOverlay } from "../shared/ToastNotifications.jsx";
import { IngredientsPanel } from "../panels/IngredientsPanel.jsx";
import { RecipesPanel } from "../panels/RecipesPanel.jsx";
import { OrdersPanel } from "../panels/OrdersPanel.jsx";
import { ClientsPanel } from "../panels/ClientsPanel.jsx";
import { OverviewPanel } from "../panels/OverviewPanel.jsx";
import { StatsPanel } from "../panels/StatsPanel.jsx";
import { NewOrderModal, DeleteConfirmModal, ProductionConfirmModal, EditOrderModal } from "../modals/OrderModals.jsx";
import { NewIngredientModal, EditIngredientModal } from "../modals/IngredientModals.jsx";
import { NewClientModal, ConfirmModal } from "../modals/ClientModals.jsx";
import { RecipeViewModal } from "../modals/RecipeViewModal.jsx";
import { NewRecipeModal } from "../modals/RecipeModals.jsx";
import "../css/Dashboard.css";

export const Dashboard = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { connected } = useSocket();
    const { isOnline, offlineQueue, pendingCount, queueOrder } = useOfflineOrders(backendUrl);
    const { permission: notifPermission, requestPermission: requestNotifPermission, showNotification } = usePushNotifications();

    const ingredientsHook = useIngredients(backendUrl, dispatch);
    const recipesHook = useRecipes(backendUrl, dispatch);
    const ordersHook = useOrders(backendUrl, dispatch);
    const clientsHook = useClients(backendUrl, dispatch);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("darkMode");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showNewRecipe, setShowNewRecipe] = useState(false);
    const [showNewIngredient, setShowNewIngredient] = useState(false);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [showNewClient, setShowNewClient] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [productionConfirm, setProductionConfirm] = useState(null);
    const [selectedOrderEdit, setSelectedOrderEdit] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editConfirm, setEditConfirm] = useState(false);
    const [showNewIngredientEdit, setShowNewIngredientEdit] = useState(false);

    const [newRecipe, setNewRecipe] = useState({ name: '', sale_price: '', description: '' });
    const [newRecipeIngredients, setNewRecipeIngredients] = useState([]);
    const [selectedIngToAdd, setSelectedIngToAdd] = useState('');
    const [ingredientSource, setIngredientSource] = useState('');
    const [newIngredient, setNewIngredient] = useState({ name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: '' });
    const [editRecipe, setEditRecipe] = useState({ name: '', sale_price: 0 });
    const [editIngredients, setEditIngredients] = useState([]);
    const [selectedIngToEdit, setSelectedIngToEdit] = useState('');
    const [newIngredientEdit, setNewIngredientEdit] = useState({ name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: '' });

    const [newOrder, setNewOrder] = useState({ client_id: '', delivery_date: '', notes: '' });
    const [newOrderItems, setNewOrderItems] = useState([]);
    const [selectedRecipeForOrder, setSelectedRecipeForOrder] = useState('');
    const [orderItemQty, setOrderItemQty] = useState(1);
    const [editOrderItems, setEditOrderItems] = useState([]);
    const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
    const [calculatorQty, setCalculatorQty] = useState(10);

    const showError = (msg) => {
        setErrorMessage(msg);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const validateEmail = (email) => {
        if (!email) return true;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(!darkMode);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login");
            return;
        }
        try {
            const userData = JSON.parse(user);
            if (!userData.id || !userData.email) {
                localStorage.removeItem("user");
                navigate("/login");
            }
        } catch (e) {
            localStorage.removeItem("user");
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const checkSession = () => {
            const user = localStorage.getItem("user");
            if (!user) {
                showError('Sesión expirada. Por favor inicia sesión nuevamente.');
                navigate("/login");
            }
        };
        const interval = setInterval(checkSession, 300000);
        return () => clearInterval(interval);
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("user");
        showSuccess('Sesión cerrada correctamente');
        setTimeout(() => navigate("/login"), 1000);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ing, rec, ord, low, marg, cli] = await Promise.all([
                    fetch(`${backendUrl}/api/ingredients`),
                    fetch(`${backendUrl}/api/recipes`),
                    fetch(`${backendUrl}/api/orders`),
                    fetch(`${backendUrl}/api/ingredients/low-stock`),
                    fetch(`${backendUrl}/api/recipes/alerts`),
                    fetch(`${backendUrl}/api/clients`)
                ]);
                dispatch({ type: "set_ingredients", payload: await ing.json() });
                dispatch({ type: "set_recipes", payload: await rec.json() });
                dispatch({ type: "set_orders", payload: await ord.json() });
                dispatch({ type: "set_low_stock_alerts", payload: await low.json() });
                dispatch({ type: "set_margin_alerts", payload: await marg.json() });
                dispatch({ type: "set_clients", payload: await cli.json() });
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [backendUrl, dispatch]);

    useEffect(() => {
        if (notifPermission === 'default') {
            requestNotifPermission();
        }
    }, [notifPermission, requestNotifPermission]);

    useEffect(() => {
        const handleNewOrder = (event) => {
            const order = event.detail;
            showNotification('Nuevo Pedido', {
                body: `Pedido #${order.id} - ${order.status}`,
                tag: 'new-order'
            });
        };

        const handleOrderUpdate = (event) => {
            const order = event.detail;
            showNotification('Pedido Actualizado', {
                body: `Pedido #${order.id} ahora: ${order.status}`,
                tag: 'order-update'
            });
        };

        const handleStockAlert = (event) => {
            const ingredient = event.detail;
            showNotification('Alerta de Stock', {
                body: `${ingredient.name} - Stock bajo: ${ingredient.current_stock} ${ingredient.unit}`,
                tag: 'stock-alert'
            });
        };

        window.addEventListener('new_order', handleNewOrder);
        window.addEventListener('order_update', handleOrderUpdate);
        window.addEventListener('stock_alert', handleStockAlert);

        return () => {
            window.removeEventListener('new_order', handleNewOrder);
            window.removeEventListener('order_update', handleOrderUpdate);
            window.removeEventListener('stock_alert', handleStockAlert);
        };
    }, [showNotification]);

    const totalRecipes = store.recipes.length;
    const totalIngredients = store.ingredients.length;
    const pendingOrders = store.orders.filter(o => o.status === "pending").length;
    const inProductionOrders = store.orders.filter(o => o.status === "in_production").length;
    const selectedRecipe = selectedRecipeId ? store.recipes.find(r => r.id === selectedRecipeId) : null;

    const addIngredientToRecipe = () => {
        if (selectedIngToAdd > 0) {
            const ing = store.ingredients.find(i => i.id == selectedIngToAdd);
            if (ing && !newRecipeIngredients.find(i => i.ingredient_id == selectedIngToAdd)) {
                setNewRecipeIngredients([...newRecipeIngredients, { ...ing, ingredient_id: ing.id, quantity_needed: 1, display_unit: ing.unit }]);
            }
            setSelectedIngToAdd('');
        } else if (selectedIngToAdd === 'new') {
            if (newIngredient.name && newIngredient.unit && newIngredient.cost_per_unit) {
                createNewIngredientForRecipeStay();
            } else {
                setIngredientSource('recipe');
                setShowNewIngredient(true);
            }
        }
    };

    const createNewIngredientForRecipeStay = async () => {
        if (!newIngredient.name || !newIngredient.unit) return;
        try {
            const r = await fetch(`${backendUrl}/api/ingredients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newIngredient, cost_per_unit: parseFloat(newIngredient.cost_per_unit) || 0, current_stock: parseFloat(newIngredient.current_stock) || 0 })
            });
            const ing = await r.json();
            const resp = await fetch(`${backendUrl}/api/ingredients`);
            dispatch({ type: "set_ingredients", payload: await resp.json() });
            if (!newRecipeIngredients.find(i => i.ingredient_id == ing.id)) {
                setNewRecipeIngredients([...newRecipeIngredients, { ...ing, ingredient_id: ing.id, quantity_needed: 1, display_unit: ing.unit }]);
            }
            setNewIngredient({ name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: '' });
        } catch (err) { alert('Error: ' + err.message); }
    };

    const saveIngredientFromTab = async () => {
        if (!newIngredient.name || !newIngredient.unit || !newIngredient.cost_per_unit) {
            return showError('Nombre, unidad y precio son requeridos');
        }
        const success = await ingredientsHook.createIngredient(newIngredient);
        if (success) {
            setNewIngredient({ name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: '' });
            setShowNewIngredient(false);
            showSuccess('Ingrediente creado correctamente');
        } else {
            showError('Error al crear ingrediente: ' + ingredientsHook.error);
        }
    };

    const saveEditedIngredient = async () => {
        if (!editingIngredient || !editingIngredient.name || !editingIngredient.unit || !editingIngredient.cost_per_unit) {
            return showError('Nombre, unidad y precio son requeridos');
        }
        const success = await ingredientsHook.updateIngredient(editingIngredient.id, editingIngredient);
        if (success) {
            setEditingIngredient(null);
            showSuccess('Ingrediente actualizado correctamente');
        } else {
            showError('Error al actualizar ingrediente: ' + ingredientsHook.error);
        }
    };

    const handleNewRecipe = async () => {
        if (!newRecipe.name || !newRecipe.sale_price) {
            return showError('Nombre y precio son requeridos');
        }
        if (newRecipeIngredients.length === 0) {
            return showError('Debe agregar al menos un ingrediente');
        }
        setSubmitting(true);
        const success = await recipesHook.createRecipe(newRecipe, newRecipeIngredients);
        setSubmitting(false);
        if (success) {
            showSuccess('Receta creada correctamente');
            setShowNewRecipe(false);
            setNewRecipeIngredients([]);
        } else {
            showError('Error al crear receta: ' + recipesHook.error);
        }
    };

    const handleStartProduction = async (orderId) => {
        setProductionConfirm(orderId);
    };

    const handleConfirmProduction = async () => {
        const success = await ordersHook.startProduction(productionConfirm);
        setProductionConfirm(null);
        if (success) {
            showSuccess('Pedido en producción! Stock descontado.');
        } else {
            showError('Error: ' + ordersHook.error);
        }
    };

    const handleOrderStatusChange = async (orderId, newStatus) => {
        setSubmitting(true);
        const success = await ordersHook.updateOrderStatus(orderId, newStatus);
        setSubmitting(false);
        if (success) {
            if (newStatus === 'cancelled') {
                showSuccess('Pedido cancelado. Stock restaurado.');
            } else {
                showSuccess('Estado del pedido actualizado');
            }
        } else {
            showError('Error al cambiar estado: ' + ordersHook.error);
        }
    };

    const handleAddItemToNewOrder = () => {
        if (!selectedRecipeForOrder || orderItemQty < 1) return;
        const recipe = store.recipes.find(r => r.id == selectedRecipeForOrder);
        if (recipe && !newOrderItems.find(i => i.id == selectedRecipeForOrder)) {
            setNewOrderItems([...newOrderItems, { ...recipe, quantity: orderItemQty }]);
        }
        setSelectedRecipeForOrder('');
        setOrderItemQty(1);
    };

    const handleAddItemToEditOrder = () => {
        if (!selectedRecipeForOrder || orderItemQty < 1) return;
        const recipe = store.recipes.find(r => r.id == selectedRecipeForOrder);
        if (recipe && !editOrderItems.find(i => i.recipe_id == selectedRecipeForOrder)) {
            setEditOrderItems([...editOrderItems, { ...recipe, quantity: orderItemQty }]);
        }
        setSelectedRecipeForOrder('');
        setOrderItemQty(1);
    };

    const handleSaveOrderEdit = async () => {
        if (!selectedOrderEdit) return;
        setSubmitting(true);
        const success = await ordersHook.updateOrder(
            selectedOrderEdit.id,
            selectedOrderEdit,
            selectedOrderEdit.items,
            editOrderItems
        );
        setSubmitting(false);
        if (success) {
            setSelectedOrderEdit(null);
            showSuccess('Pedido actualizado correctamente');
        } else {
            showError('Error al actualizar pedido: ' + ordersHook.error);
        }
    };

    const handleSaveNewOrder = async () => {
        if (!newOrder.client_id || !newOrder.delivery_date || newOrderItems.length === 0) {
            return alert('Cliente, fecha y al menos un item son requeridos');
        }
        try {
            if (!navigator.onLine) {
                const offlineOrder = {
                    ...newOrder,
                    client_id: parseInt(newOrder.client_id),
                    items: newOrderItems.map(item => ({ recipe_id: item.id, quantity: item.quantity }))
                };
                await queueOrder(offlineOrder);
                setShowNewOrder(false);
                setNewOrder({ client_id: '', delivery_date: '', notes: '' });
                setNewOrderItems([]);
                showSuccess(`Pedido guardado offline (${offlineQueue.length + 1} pendientes)`);
                return;
            }
            setSubmitting(true);
            const success = await ordersHook.createOrder(newOrder, newOrderItems);
            setSubmitting(false);
            if (success) {
                setShowNewOrder(false);
                setNewOrder({ client_id: '', delivery_date: '', notes: '' });
                setNewOrderItems([]);
                showSuccess('Pedido creado correctamente');
            } else {
                throw new Error(ordersHook.error);
            }
        } catch (err) {
            setSubmitting(false);
            const offlineOrder = {
                ...newOrder,
                client_id: parseInt(newOrder.client_id),
                items: newOrderItems.map(item => ({ recipe_id: item.id, quantity: item.quantity }))
            };
            await queueOrder(offlineOrder);
            setShowNewOrder(false);
            setNewOrder({ client_id: '', delivery_date: '', notes: '' });
            setNewOrderItems([]);
            showSuccess('Pedido guardado offline');
        }
    };

    const handleSaveNewClient = async () => {
        if (!newClient.name) {
            return showError('El nombre es requerido');
        }
        if (newClient.email && !validateEmail(newClient.email)) {
            return showError('El formato del email no es válido');
        }
        setSubmitting(true);
        const success = await clientsHook.createClient(newClient);
        setSubmitting(false);
        if (success) {
            setShowNewClient(false);
            setNewClient({ name: '', email: '', phone: '', address: '' });
            showSuccess('Cliente creado correctamente');
        } else {
            showError('Error al crear cliente: ' + clientsHook.error);
        }
    };

    const handleStartEditRecipe = () => {
        setEditRecipe({
            name: selectedRecipe.name,
            sale_price: selectedRecipe.sale_price,
            description: selectedRecipe.description || '',
            category: selectedRecipe.category || ''
        });
        setEditIngredients((selectedRecipe.ingredients || []).map(ing => ({ ...ing, checked: false, display_unit: 'kg' })));
    };

    const toggleIngredientEdit = (id) => {
        setEditIngredients(editIngredients.map(ing => ing.id === id ? { ...ing, checked: !ing.checked } : ing));
    };

    const removeCheckedIngredients = () => {
        setEditIngredients(editIngredients.filter(ing => !ing.checked));
    };

    const addIngredientToEdit = () => {
        if (selectedIngToEdit > 0) {
            const ing = store.ingredients.find(i => i.id == selectedIngToEdit);
            if (ing && !editIngredients.find(i => i.ingredient_id == selectedIngToEdit)) {
                setEditIngredients([...editIngredients, { ...ing, id: Date.now(), ingredient_id: ing.id, quantity_needed: 1, checked: false, display_unit: ing.unit }]);
            }
            setSelectedIngToEdit('');
        } else if (selectedIngToEdit === 'new') {
            setShowNewIngredientEdit(true);
        }
    };

    const createNewIngredientForRecipeEdit = async () => {
        if (!newIngredientEdit.name || !newIngredientEdit.unit || !newIngredientEdit.cost_per_unit) return;
        try {
            const r = await fetch(`${backendUrl}/api/ingredients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newIngredientEdit, cost_per_unit: parseFloat(newIngredientEdit.cost_per_unit) || 0, current_stock: parseFloat(newIngredientEdit.current_stock) || 0 })
            });
            const ing = await r.json();
            const resp = await fetch(`${backendUrl}/api/ingredients`);
            dispatch({ type: "set_ingredients", payload: await resp.json() });
            if (!editIngredients.find(i => i.ingredient_id == ing.id)) {
                setEditIngredients([...editIngredients, { ...ing, id: Date.now(), ingredient_id: ing.id, quantity_needed: 1, checked: false }]);
            }
            setNewIngredientEdit({ name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: '' });
            setShowNewIngredientEdit(false);
        } catch (err) { alert('Error: ' + err.message); }
    };

    const handleSaveRecipeEdit = async () => {
        setSubmitting(true);
        const success = await recipesHook.updateRecipe(selectedRecipe.id, editRecipe, editIngredients, selectedRecipe.ingredients);
        setSubmitting(false);
        if (success) {
            setEditConfirm(false);
            setShowModal(false);
            showSuccess('Receta actualizada correctamente');
        } else {
            showError('Error al actualizar receta: ' + recipesHook.error);
        }
    };

    const handleDeleteRecipe = async (id) => {
        const success = await recipesHook.deleteRecipe(id);
        setDeleteConfirm(null);
        if (success) {
            showSuccess('Receta eliminada correctamente');
        } else {
            showError('Error al eliminar receta: ' + recipesHook.error);
        }
    };

    const exportToCSV = (data, filename, headers) => {
        if (!data || data.length === 0) {
            showError('No hay datos para exportar');
            return;
        }

        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const key = h.toLowerCase().replace(' ', '_');
                const value = row[key] !== undefined ? row[key] : '';
                return typeof value === 'string' ? `"${value}"` : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showSuccess(`${filename} exportado correctamente`);
    };

    const exportIngredients = () => {
        const data = store.ingredients.map(ing => ({
            name: ing.name,
            unit: ing.unit,
            cost_per_unit: ing.cost_per_unit,
            current_stock: ing.current_stock,
            supplier: ing.supplier || ''
        }));
        exportToCSV(data, 'ingredientes', ['Name', 'Unit', 'Cost_per_unit', 'Current_stock', 'Supplier']);
    };

    const exportRecipes = () => {
        const data = store.recipes.map(rec => ({
            name: rec.name,
            sale_price: rec.sale_price,
            description: rec.description || ''
        }));
        exportToCSV(data, 'recetas', ['Name', 'Sale_price', 'Description']);
    };

    const exportOrders = () => {
        const data = store.orders.map(ord => ({
            id: ord.id,
            client_name: ord.client_name,
            delivery_date: ord.delivery_date,
            status: ord.status,
            items_count: ord.items?.length || 0
        }));
        exportToCSV(data, 'pedidos', ['Id', 'Client_name', 'Delivery_date', 'Status', 'Items_count']);
    };

    const exportClients = () => {
        exportToCSV(store.clients || [], 'clientes', ['Name', 'Email', 'Phone', 'Address']);
    };

    const calculateForQty = (recipe, qty) => recipe?.ingredients?.map(ing => ({
        name: ing.ingredient_name,
        unit: ing.unit,
        total: (ing.quantity_needed * qty).toFixed(2),
        perPlate: ing.quantity_needed
    })) || [];

    const inputStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2d2d3f', color: 'white', width: '100%' };

    if (loading) return (
        <div className="dashboard-loading">
            <div className="spinner-container">
                <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-light">Cargando datos del Dashboard...</p>
            </div>
        </div>
    );

    return (
        <>
            <Toast message={errorMessage} type="error" onClose={() => setErrorMessage(null)} />
            <Toast message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />
            <LoadingOverlay show={submitting} />
            <div className={`dashboard ${!darkMode ? 'light-mode' : ''}`}>
                <DashboardSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    connected={connected}
                    isOnline={isOnline}
                    pendingCount={pendingCount}
                    store={store}
                    pendingOrders={pendingOrders}
                />
                <div className="main-content">
                    <h2>
                        {activeTab === "overview" && "Resumen"}
                        {activeTab === "ingredients" && "Ingredientes"}
                        {activeTab === "recipes" && "Recetas"}
                        {activeTab === "orders" && "Pedidos"}
                        {activeTab === "clients" && "Clientes"}
                        {activeTab === "stats" && "Estadísticas"}
                    </h2>

                    {activeTab === "overview" && (
                        <OverviewPanel
                            totalRecipes={totalRecipes}
                            totalIngredients={totalIngredients}
                            pendingOrders={pendingOrders}
                            inProductionOrders={inProductionOrders}
                        />
                    )}

                    {activeTab === "ingredients" && (
                        <IngredientsPanel
                            ingredients={store.ingredients}
                            onNewIngredient={() => { setIngredientSource('tab'); setShowNewIngredient(true); }}
                            onEditIngredient={(ing) => setEditingIngredient(ing)}
                            onExport={exportIngredients}
                        />
                    )}

                    {activeTab === "recipes" && (
                        <RecipesPanel
                            recipes={store.recipes}
                            onViewRecipe={(recipe) => { setSelectedRecipeId(recipe.id); setShowModal(true); }}
                            onDelete={(id) => setDeleteConfirm(id)}
                            onNewRecipe={() => setShowNewRecipe(true)}
                            onExport={exportRecipes}
                            calculateCost={recipesHook.calculateCost}
                            calculateMargin={recipesHook.calculateMargin}
                        />
                    )}

                    {activeTab === "orders" && (
                        <OrdersPanel
                            orders={store.orders}
                            onStatusChange={handleOrderStatusChange}
                            onEditOrder={(order) => { setSelectedOrderEdit(order); setEditOrderItems(order.items || []); }}
                            onStartProduction={handleStartProduction}
                            onNewOrder={() => setShowNewOrder(true)}
                            onExport={exportOrders}
                        />
                    )}

                    {activeTab === "clients" && (
                        <ClientsPanel
                            clients={store.clients}
                            onNewClient={() => setShowNewClient(true)}
                            onExport={exportClients}
                        />
                    )}

                    {activeTab === "stats" && (
                        <StatsPanel
                            orders={store.orders}
                            recipes={store.recipes}
                            calculateCost={recipesHook.calculateCost}
                        />
                    )}
                </div>

                {deleteConfirm && (
                    <div className="modal-overlay">
                        <div style={{ backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center' }}>
                            <h3>¿Eliminar receta?</h3>
                            <div className="modal-actions center">
                                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancelar</button>
                                <button onClick={() => { handleDeleteRecipe(deleteConfirm); setDeleteConfirm(null); }} className="btn-danger">Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}

                {showModal && selectedRecipe && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto' }} onClick={() => { setShowModal(false); setEditConfirm(false); }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            {editConfirm ? (
                                <>
                                    <h2>Editar Receta</h2>
                                    <div className="modal-grid">
                                        <div><label>Nombre</label><input value={editRecipe.name} onChange={e => setEditRecipe({ ...editRecipe, name: e.target.value })} className="form-input" /></div>
                                        <div><label>Precio €</label><input type="number" value={editRecipe.sale_price} onChange={e => setEditRecipe({ ...editRecipe, sale_price: e.target.value })} className="form-input" /></div>
                                        <div><label>Categoría</label>
                                            <select value={editRecipe.category || ''} onChange={e => setEditRecipe({ ...editRecipe, category: e.target.value })} className="form-input">
                                                <option value="">Sin categoría</option>
                                                <option value="Entrantes">Entrantes</option>
                                                <option value="Primeros">Primeros</option>
                                                <option value="Segundos">Segundos</option>
                                                <option value="Postres">Postres</option>
                                                <option value="Bebidas">Bebidas</option>
                                                <option value="Aperitivos">Aperitivos</option>
                                            </select>
                                        </div>
                                    </div>
                                    <hr />
                                    <h4><i className="fas fa-carrot me-2"></i>Ingredientes</h4>
                                    {editIngredients.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                                            {editIngredients.map((ing) => (
                                                <div key={ing.id} style={{ backgroundColor: ing.checked ? '#3d2d2d' : '#2d2d3f', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: ing.checked ? 0.6 : 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <strong style={{ color: '#f59e0b' }}>{ing.ingredient_name || ing.name}</strong>
                                                        <input type="checkbox" checked={ing.checked || false} onChange={() => toggleIngredientEdit(ing.id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                        <input type="number" step="0.01" value={ing.quantity_needed} onChange={e => setEditIngredients(editIngredients.map(item => item.id === ing.id ? { ...item, quantity_needed: parseFloat(e.target.value) || 0 } : item))} style={{ width: '70px', padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px', textAlign: 'center' }} />
                                                        <select value={ing.display_unit || ing.unit} onChange={e => setEditIngredients(editIngredients.map(item => item.id === ing.id ? { ...item, display_unit: e.target.value } : item))} style={{ padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px' }}>
                                                            <option value={ing.unit}>{ing.unit}</option>
                                                            {ing.unit === 'kg' && <option value="g">g</option>}
                                                            {ing.unit === 'l' && <option value="ml">ml</option>}
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '20px', color: '#666', marginBottom: '15px' }}>
                                            <i className="fas fa-inbox fa-2x mb-2"></i>
                                            <p style={{ margin: 0 }}>No hay ingredientes</p>
                                        </div>
                                    )}
                                    {editIngredients.some(ing => ing.checked) && <button onClick={removeCheckedIngredients} style={{ backgroundColor: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '5px', color: 'white', marginBottom: '15px' }}><i className="fas fa-trash me-1"></i>Eliminar marcados</button>}
                                    <hr />
                                    <h5><i className="fas fa-plus me-2"></i>Agregar ingrediente</h5>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                        <select value={selectedIngToEdit} onChange={e => { setSelectedIngToEdit(e.target.value); if (e.target.value === 'new') setShowNewIngredientEdit(true); }} style={{ ...inputStyle, flex: 1, minWidth: '200px' }}>
                                            <option value="">Seleccionar existente...</option>
                                            <option value="new" style={{ color: '#f59e0b' }}>+ Crear nuevo</option>
                                            {store.ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                                        </select>
                                        <button onClick={() => { if (selectedIngToEdit === 'new') setShowNewIngredientEdit(true); else addIngredientToEdit(); }} className="btn-primary"><i className="fas fa-plus me-1"></i>Agregar</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setEditConfirm(false); }} className="btn-secondary">Cancelar</button>
                                        <button onClick={() => setEditConfirm(true)} className="btn-primary">Guardar Cambios</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2>{selectedRecipe.name}</h2>
                                    <div style={{ backgroundColor: '#22c55e', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>MÁXIMO: {recipesHook.calculateMaxPlates(selectedRecipe)} unidades</span>
                                    </div>
                                    <p><strong>Precio:</strong> {selectedRecipe.sale_price}€ | <strong>Coste:</strong> <span style={{ color: '#f59e0b' }}>{recipesHook.calculateCost(selectedRecipe).toFixed(2)}€</span> | <strong>Margen:</strong> <span style={{ color: recipesHook.calculateMargin(selectedRecipe) < 30 ? '#ef4444' : '#22c55e' }}>{recipesHook.calculateMargin(selectedRecipe).toFixed(1)}%</span></p>
                                    <hr />
                                    <h4>Calculadora</h4>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <input type="number" value={calculatorQty} onChange={e => setCalculatorQty(parseInt(e.target.value) || 0)} style={{ padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2d2d3f', color: 'white', width: '100px' }} />
                                        <span style={{ alignSelf: 'center' }}>unidades</span>
                                    </div>
                                    {calculatorQty > 0 && (
                                        <table style={{ width: '100%', marginBottom: '20px' }}>
                                            <thead><tr><th>Ingrediente</th><th>x1</th><th>Total</th></tr></thead>
                                            <tbody>
                                                {calculateForQty(selectedRecipe, calculatorQty).map((ing, i) => <tr key={i}><td>{ing.name}</td><td>{ing.perPlate} {ing.unit}</td><td style={{ color: '#f59e0b' }}>{ing.total} {ing.unit}</td></tr>)}
                                            </tbody>
                                        </table>
                                    )}
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setShowModal(false)} className="btn-secondary">Cerrar</button>
                                        <button onClick={handleStartEditRecipe} className="btn-primary">Editar</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {showNewRecipe && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto' }} onClick={() => { setShowNewRecipe(false); setNewRecipeIngredients([]); setSelectedIngToAdd(''); }}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h2>Nueva Receta</h2>
                            <div className="modal-grid">
                                <div><label>Nombre *</label><input value={newRecipe.name} onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} placeholder="Nombre" className="form-input" /></div>
                                <div><label>Precio € *</label><input type="number" value={newRecipe.sale_price} onChange={e => setNewRecipe({ ...newRecipe, sale_price: e.target.value })} placeholder="0.00" className="form-input" /></div>
                                <div><label>Categoría</label>
                                    <select value={newRecipe.category || ''} onChange={e => setNewRecipe({ ...newRecipe, category: e.target.value })} className="form-input">
                                        <option value="">Sin categoría</option>
                                        <option value="Entrantes">Entrantes</option>
                                        <option value="Primeros">Primeros</option>
                                        <option value="Segundos">Segundos</option>
                                        <option value="Postres">Postres</option>
                                        <option value="Bebidas">Bebidas</option>
                                        <option value="Aperitivos">Aperitivos</option>
                                    </select>
                                </div>
                            </div>
                            <hr />
                            <h4><i className="fas fa-carrot me-2"></i>Ingredientes</h4>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                <select value={selectedIngToAdd} onChange={e => { setSelectedIngToAdd(e.target.value); if (e.target.value === 'new') { setIngredientSource('recipe'); setShowNewIngredient(true); } }} style={{ ...inputStyle, flex: 1, minWidth: '200px' }}>
                                    <option value="">Seleccionar existente...</option>
                                    <option value="new" style={{ color: '#f59e0b' }}>+ Crear nuevo</option>
                                    {store.ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                                </select>
                                <button onClick={() => { if (selectedIngToAdd === 'new') { setIngredientSource('recipe'); setShowNewIngredient(true); } else { addIngredientToRecipe(); } }} className="btn-primary"><i className="fas fa-plus me-1"></i>Agregar</button>
                            </div>
                            {newRecipeIngredients.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                                    {newRecipeIngredients.map(ing => (
                                        <div key={ing.ingredient_id} style={{ backgroundColor: '#2d2d3f', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <strong style={{ color: '#f59e0b' }}>{ing.name}</strong>
                                                <button onClick={() => setNewRecipeIngredients(newRecipeIngredients.filter(i => i.ingredient_id !== ing.ingredient_id))} style={{ backgroundColor: '#ef4444', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', color: 'white', fontSize: '12px' }}>X</button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                <input type="number" step="0.01" value={ing.quantity_needed} onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? { ...i, quantity_needed: parseFloat(e.target.value) || 0 } : i))} style={{ width: '70px', padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px', textAlign: 'center' }} />
                                                <select value={ing.display_unit || ing.unit} onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? { ...i, display_unit: e.target.value } : i))} style={{ padding: '5px', backgroundColor: '#1e1e2f', border: 'none', color: 'white', borderRadius: '4px' }}>
                                                    <option value={ing.unit}>{ing.unit}</option>
                                                    {ing.unit === 'kg' && <option value="g">g</option>}
                                                    {ing.unit === 'l' && <option value="ml">ml</option>}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666', marginBottom: '20px' }}>
                                    <i className="fas fa-inbox fa-2x mb-2"></i>
                                    <p style={{ margin: 0 }}>No hay ingredientes agregados</p>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => { setShowNewRecipe(false); setNewRecipeIngredients([]); }} className="btn-secondary">Cancelar</button>
                                <button onClick={handleNewRecipe} className="btn-primary">Guardar Receta</button>
                            </div>
                        </div>
                    </div>
                )}

                {showNewIngredient && (
                    <div className="modal-overlay" onClick={() => { setShowNewIngredient(false); setIngredientSource(''); }}>
                        <div className="modal-content small" onClick={e => e.stopPropagation()}>
                            <h3>{ingredientSource === 'recipe' ? 'Nuevo Ingrediente para Receta' : 'Nuevo Ingrediente'}</h3>
                            <div style={{ marginBottom: '15px' }}><label>Nombre *</label><input value={newIngredient.name} onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })} placeholder="Ej: Queso azul" className="form-input" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                <div><label>Unidad *</label><select value={newIngredient.unit} onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })} className="form-input"><option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="ml">ml</option><option value="ud">ud</option></select></div>
                                <div><label>Precio € *</label><input type="number" step="0.01" value={newIngredient.cost_per_unit} onChange={e => setNewIngredient({ ...newIngredient, cost_per_unit: e.target.value })} placeholder="0.00" className="form-input" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                <div><label>Stock</label><input type="number" value={newIngredient.current_stock} onChange={e => setNewIngredient({ ...newIngredient, current_stock: e.target.value })} placeholder="0" className="form-input" /></div>
                                <div><label>Proveedor</label><input value={newIngredient.supplier || ''} onChange={e => setNewIngredient({ ...newIngredient, supplier: e.target.value })} placeholder="Nombre" className="form-input" /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                {ingredientSource === 'recipe' ? (
                                    <>
                                        <button onClick={() => { setShowNewIngredient(false); setIngredientSource(''); setNewIngredient({ name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: '' }); }} className="btn-secondary">Cerrar</button>
                                        <button onClick={() => { if (newIngredient.name && newIngredient.unit && newIngredient.cost_per_unit) { createNewIngredientForRecipeStay(); } }} className="btn-primary">Crear y agregar otro</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setShowNewIngredient(false); setIngredientSource(''); }} className="btn-secondary">Cancelar</button>
                                        <button onClick={() => { if (newIngredient.name && newIngredient.unit && newIngredient.cost_per_unit) { saveIngredientFromTab(); } }} className="btn-primary">Crear</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {editingIngredient && (
                    <div className="modal-overlay" onClick={() => setEditingIngredient(null)}>
                        <div className="modal-content small" onClick={e => e.stopPropagation()}>
                            <h3>Editar Ingrediente</h3>
                            <div style={{ marginBottom: '15px' }}><label>Nombre *</label><input value={editingIngredient.name} onChange={e => setEditingIngredient({ ...editingIngredient, name: e.target.value })} placeholder="Ej: Queso azul" className="form-input" /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                <div><label>Unidad *</label><select value={editingIngredient.unit} onChange={e => setEditingIngredient({ ...editingIngredient, unit: e.target.value })} className="form-input"><option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="ml">ml</option><option value="ud">ud</option></select></div>
                                <div><label>Precio € *</label><input type="number" step="0.01" value={editingIngredient.cost_per_unit} onChange={e => setEditingIngredient({ ...editingIngredient, cost_per_unit: e.target.value })} placeholder="0.00" className="form-input" /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                                <div><label>Stock</label><input type="number" value={editingIngredient.current_stock} onChange={e => setEditingIngredient({ ...editingIngredient, current_stock: e.target.value })} placeholder="0" className="form-input" /></div>
                                <div><label>Proveedor</label><input value={editingIngredient.supplier || ''} onChange={e => setEditingIngredient({ ...editingIngredient, supplier: e.target.value })} placeholder="Nombre" className="form-input" /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingIngredient(null)} className="btn-secondary">Cancelar</button>
                                <button onClick={saveEditedIngredient} className="btn-primary">Guardar</button>
                            </div>
                        </div>
                    </div>
                )}

                {editConfirm && <ConfirmModal show={editConfirm} onClose={() => setEditConfirm(false)} onConfirm={handleSaveRecipeEdit} title="¿Guardar cambios?" message="Se modificarán nombre, precio e ingredientes." />}

                {showNewIngredientEdit && <NewIngredientModal show={showNewIngredientEdit} onClose={() => setShowNewIngredientEdit(false)} ingredient={newIngredientEdit} onSave={(ing) => { createNewIngredientForRecipeEdit(); setShowNewIngredientEdit(false); }} isNew={true} />}

                {showNewOrder && <NewOrderModal show={showNewOrder} onClose={() => { setShowNewOrder(false); setNewOrderItems([]); }} newOrder={newOrder} setNewOrder={setNewOrder} newOrderItems={newOrderItems} setNewOrderItems={setNewOrderItems} selectedRecipe={selectedRecipeForOrder} setSelectedRecipe={setSelectedRecipeForOrder} orderItemQty={orderItemQty} setOrderItemQty={setOrderItemQty} store={store} onAddItem={handleAddItemToNewOrder} onSave={handleSaveNewOrder} />}

                {showNewClient && <NewClientModal show={showNewClient} onClose={() => setShowNewClient(false)} newClient={newClient} setNewClient={setNewClient} onSave={handleSaveNewClient} />}

                {productionConfirm && <ProductionConfirmModal show={productionConfirm} onClose={() => setProductionConfirm(null)} onConfirm={handleConfirmProduction} orderId={productionConfirm} />}

                {selectedOrderEdit && <EditOrderModal show={selectedOrderEdit} onClose={() => setSelectedOrderEdit(null)} order={selectedOrderEdit} setOrder={setSelectedOrderEdit} editOrderItems={editOrderItems} setEditOrderItems={setEditOrderItems} selectedRecipe={selectedRecipeForOrder} setSelectedRecipe={setSelectedRecipeForOrder} orderItemQty={orderItemQty} setOrderItemQty={setOrderItemQty} store={store} onAddItem={handleAddItemToEditOrder} onSave={handleSaveOrderEdit} />}
            </div>
        </>
    );
};