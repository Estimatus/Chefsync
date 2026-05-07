import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { DashboardOverview } from "../components/DashboardOverview.jsx";
import { DashboardIngredients } from "../components/DashboardIngredients.jsx";
import { DashboardRecipes } from "../components/DashboardRecipes.jsx";
import { DashboardOrders } from "../components/DashboardOrders.jsx";
import { DashboardClients } from "../components/DashboardClients.jsx";
import { DashboardStats } from "../components/DashboardStats.jsx";

export const Dashboard = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [calculatorQty, setCalculatorQty] = useState(10);
    const [showNewRecipe, setShowNewRecipe] = useState(false);
    const [newRecipe, setNewRecipe] = useState({name: '', sale_price: '', description: ''});
    const [newRecipeIngredients, setNewRecipeIngredients] = useState([]);
    const [selectedIngToAdd, setSelectedIngToAdd] = useState('');
    const [showNewIngredient, setShowNewIngredient] = useState(false);
    const [ingredientSource, setIngredientSource] = useState(''); // 'tab' or 'recipe'
    const [newIngredient, setNewIngredient] = useState({name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: ''});
    const [editMode, setEditMode] = useState(false);
    const [editRecipe, setEditRecipe] = useState({name: '', sale_price: 0});
    const [editIngredients, setEditIngredients] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedIngToEdit, setSelectedIngToEdit] = useState('');
    const [showNewIngredientEdit, setShowNewIngredientEdit] = useState(false);
    const [newIngredientEdit, setNewIngredientEdit] = useState({name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: ''});
    const [editConfirm, setEditConfirm] = useState(false);
    const [showNewOrder, setShowNewOrder] = useState(false);
    const [newOrder, setNewOrder] = useState({client_id: '', delivery_date: '', notes: ''});
    const [newOrderItems, setNewOrderItems] = useState([]);
    const [selectedRecipeForOrder, setSelectedRecipeForOrder] = useState('');
    const [orderItemQty, setOrderItemQty] = useState(1);
    const [showOrderConfirm, setShowOrderConfirm] = useState(false);
    const [orderErrors, setOrderErrors] = useState([]);
    const [showNewClient, setShowNewClient] = useState(false);
    const [newClient, setNewClient] = useState({name: '', email: '', phone: '', address: ''});
    const [productionConfirm, setProductionConfirm] = useState(null);
    const [orderStatusChange, setOrderStatusChange] = useState(null);
    const [selectedOrderEdit, setSelectedOrderEdit] = useState(null);
    const [editOrderItems, setEditOrderItems] = useState([]);
    const [statsData, setStatsData] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) navigate("/login");
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("user");
        navigate("/login");
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

    const totalRecipes = store.recipes.length;
    const totalIngredients = store.ingredients.length;
    const pendingOrders = store.orders.filter(o => o.status === "pending").length;
    const inProductionOrders = store.orders.filter(o => o.status === "in_production").length;
    const selectedRecipe = selectedRecipeId ? store.recipes.find(r => r.id === selectedRecipeId) : null;

    const calculateCost = (recipe) => recipe?.ingredients?.reduce((a, b) => a + (b.calculated_cost || 0), 0) || 0;
    const calculateMargin = (recipe) => {
        if (!recipe || recipe.sale_price <= 0) return 0;
        return ((recipe.sale_price - calculateCost(recipe)) / recipe.sale_price) * 100;
    };
    const calculateMaxPlates = (recipe) => {
        if (!recipe?.ingredients) return 0;
        let max = Infinity;
        for (const ing of recipe.ingredients) {
            if (ing.quantity_needed > 0) max = Math.min(max, Math.floor(ing.current_stock / ing.quantity_needed));
        }
        return max === Infinity ? 0 : max;
    };
    const calculateForQty = (recipe, qty) => recipe?.ingredients?.map(ing => ({
        name: ing.ingredient_name, unit: ing.unit,
        total: (ing.quantity_needed * qty).toFixed(2), perPlate: ing.quantity_needed
    })) || [];

    const addIngredientToRecipe = () => {
        if (selectedIngToAdd > 0) {
            const ing = store.ingredients.find(i => i.id == selectedIngToAdd);
            if (ing && !newRecipeIngredients.find(i => i.ingredient_id == selectedIngToAdd)) {
                setNewRecipeIngredients([...newRecipeIngredients, {...ing, ingredient_id: ing.id, quantity_needed: 1, display_unit: ing.unit}]);
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
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...newIngredient, cost_per_unit: parseFloat(newIngredient.cost_per_unit) || 0, current_stock: parseFloat(newIngredient.current_stock) || 0})
            });
            const ing = await r.json();
            const resp = await fetch(`${backendUrl}/api/ingredients`);
            dispatch({ type: "set_ingredients", payload: await resp.json() });
            if (!newRecipeIngredients.find(i => i.ingredient_id == ing.id)) {
                setNewRecipeIngredients([...newRecipeIngredients, {...ing, ingredient_id: ing.id, quantity_needed: 1, display_unit: ing.unit}]);
            }
            setNewIngredient({name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: ''});
        } catch (err) { alert('Error: ' + err.message); }
    };

    const saveIngredientFromTab = async () => {
        if (!newIngredient.name || !newIngredient.unit || !newIngredient.cost_per_unit) return alert('Nombre, unidad y precio son requeridos');
        try {
            await fetch(`${backendUrl}/api/ingredients`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...newIngredient, cost_per_unit: parseFloat(newIngredient.cost_per_unit) || 0, current_stock: parseFloat(newIngredient.current_stock) || 0})
            });
            const resp = await fetch(`${backendUrl}/api/ingredients`);
            dispatch({ type: "set_ingredients", payload: await resp.json() });
            setNewIngredient({name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: ''});
            setShowNewIngredient(false);
        } catch (err) { alert('Error: ' + err.message); }
    };

    const saveNewRecipe = async () => {
        if (!newRecipe.name || !newRecipe.sale_price) return alert('Nombre y precio requeridos');
        try {
            const r = await fetch(`${backendUrl}/api/recipes`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...newRecipe, sale_price: parseFloat(newRecipe.sale_price)})
            });
            const recipe = await r.json();
            for (const ing of newRecipeIngredients) {
                const baseUnit = ing.unit || 'kg';
                const displayUnit = ing.display_unit || baseUnit;
                const convertedQty = convertToBaseUnit(ing.quantity_needed, displayUnit, baseUnit);
                await fetch(`${backendUrl}/api/recipes/${recipe.id}/ingredients`, {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ingredient_id: ing.ingredient_id, quantity_needed: convertedQty})
                });
            }
            alert('Receta creada!'); setShowNewRecipe(false); window.location.reload();
        } catch (err) { alert('Error: ' + err.message); }
    };

    const startProduction = async (orderId) => {
        setProductionConfirm(orderId);
    };

    const confirmProduction = async () => {
        try {
            const r = await fetch(`${backendUrl}/api/orders/${productionConfirm}/production`, {method: 'PUT'});
            if (r.ok) {
                alert('Pedido en producción! Stock descontado.');
                setProductionConfirm(null);
                window.location.reload();
            } else {
                const data = await r.json();
                alert('Error: ' + data.errors?.join(', '));
                setProductionConfirm(null);
            }
        } catch (err) { alert('Error: ' + err.message); setProductionConfirm(null); }
    };

    const changeOrderStatus = async (orderId, newStatus) => {
        try {
            await fetch(`${backendUrl}/api/orders/${orderId}`, {
                method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({status: newStatus})
            });
window.location.reload();
        } catch (err) { alert('Error: ' + err.message); }
    };

    const addItemToEditOrder = () => {
        if (!selectedRecipeForOrder || orderItemQty < 1) return;
        const recipe = store.recipes.find(r => r.id == selectedRecipeForOrder);
        if (recipe && !editOrderItems.find(i => i.recipe_id == selectedRecipeForOrder)) {
            setEditOrderItems([...editOrderItems, {...recipe, quantity: orderItemQty}]);
        }
        setSelectedRecipeForOrder('');
        setOrderItemQty(1);
    };

    const saveOrderEdit = async () => {
        if (!selectedOrderEdit) return;
        try {
            await fetch(`${backendUrl}/api/orders/${selectedOrderEdit.id}`, {
                method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({delivery_date: selectedOrderEdit.delivery_date, notes: selectedOrderEdit.notes})
            });
            const currentItemIds = (selectedOrderEdit.items || []).map(i => i.recipe_id);
            const newItemIds = editOrderItems.map(i => i.id);
            for (const currentId of currentItemIds) {
                if (!newItemIds.includes(currentId)) {
                    await fetch(`${backendUrl}/api/orders/${selectedOrderEdit.id}/items/${currentId}`, {method: 'DELETE'});
                }
            }
            for (const item of editOrderItems) {
                if (!currentItemIds.includes(item.id)) {
                    await fetch(`${backendUrl}/api/orders/${selectedOrderEdit.id}/items`, {
                        method: 'POST', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({recipe_id: item.id, quantity: item.quantity})
                    });
                }
            }
            setSelectedOrderEdit(null);
            window.location.reload();
        } catch (err) { alert('Error: ' + err.message); }
    };

    const saveNewOrder = async () => {
        if (!newOrder.client_id || !newOrder.delivery_date || newOrderItems.length === 0) {
            return alert('Cliente, fecha y al menos un item son requeridos');
        }
        try {
            const r = await fetch(`${backendUrl}/api/orders`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...newOrder, client_id: parseInt(newOrder.client_id)})
            });
            const order = await r.json();
            for (const item of newOrderItems) {
                await fetch(`${backendUrl}/api/orders/${order.id}/items`, {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({recipe_id: item.id, quantity: item.quantity})
                });
            }
            setShowNewOrder(false);
            setNewOrder({client_id: '', delivery_date: '', notes: ''});
            setNewOrderItems([]);
            window.location.reload();
        } catch (err) { alert('Error: ' + err.message); }
    };

    const saveNewClient = async () => {
        if (!newClient.name) return alert('Nombre requerido');
        try {
            await fetch(`${backendUrl}/api/clients`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newClient)
            });
            const resp = await fetch(`${backendUrl}/api/clients`);
            dispatch({ type: "set_clients", payload: await resp.json() });
            setShowNewClient(false);
            setNewClient({name: '', email: '', phone: '', address: ''});
        } catch (err) { alert('Error: ' + err.message); }
    };

    const startEditRecipe = () => {
        setEditRecipe({name: selectedRecipe.name, sale_price: selectedRecipe.sale_price, description: selectedRecipe.description || ''});
        setEditIngredients((selectedRecipe.ingredients || []).map(ing => ({...ing, checked: false, display_unit: 'kg'})));
        setEditMode(true);
    };

    const convertToBaseUnit = (value, fromUnit, baseUnit) => {
        if (baseUnit === 'kg' && fromUnit === 'g') return value / 1000;
        if (baseUnit === 'l' && fromUnit === 'ml') return value / 1000;
        if (baseUnit === 'kg' && fromUnit === 'kg') return value;
        if (baseUnit === 'l' && fromUnit === 'l') return value;
        return value;
    };

    const toggleIngredientEdit = (id) => {
        setEditIngredients(editIngredients.map(ing => ing.id === id ? {...ing, checked: !ing.checked} : ing));
    };

    const removeCheckedIngredients = () => {
        setEditIngredients(editIngredients.filter(ing => !ing.checked));
    };

    const addIngredientToEdit = async () => {
        if (selectedIngToEdit > 0) {
            const ing = store.ingredients.find(i => i.id == selectedIngToEdit);
            if (ing && !editIngredients.find(i => i.ingredient_id == selectedIngToEdit)) {
                setEditIngredients([...editIngredients, {...ing, id: Date.now(), ingredient_id: ing.id, quantity_needed: 1, checked: false, display_unit: ing.unit}]);
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
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...newIngredientEdit, cost_per_unit: parseFloat(newIngredientEdit.cost_per_unit) || 0, current_stock: parseFloat(newIngredientEdit.current_stock) || 0})
            });
            const ing = await r.json();
            const resp = await fetch(`${backendUrl}/api/ingredients`);
            dispatch({ type: "set_ingredients", payload: await resp.json() });
            if (!editIngredients.find(i => i.ingredient_id == ing.id)) {
                setEditIngredients([...editIngredients, {...ing, id: Date.now(), ingredient_id: ing.id, quantity_needed: 1, checked: false}]);
            }
            setNewIngredientEdit({name: '', unit: 'kg', cost_per_unit: '', current_stock: 0, supplier: ''});
            setShowNewIngredientEdit(false);
        } catch (err) { alert('Error: ' + err.message); }
    };

    const saveRecipeEdit = async () => {
        try {
            await fetch(`${backendUrl}/api/recipes/${selectedRecipe.id}`, {
                method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...editRecipe, sale_price: parseFloat(editRecipe.sale_price)})
            });
            const toRemove = editIngredients.filter(ing => ing.checked && ing.id);
            for (const ing of toRemove) {
                if (ing.ingredient_id) {
                    await fetch(`${backendUrl}/api/recipes/${selectedRecipe.id}/ingredients/${ing.ingredient_id}`, {method: 'DELETE'});
                }
            }
            const currentIds = (selectedRecipe.ingredients || []).map(ing => ing.ingredient_id);
            const toUpdate = editIngredients.filter(ing => ing.id && currentIds.includes(ing.ingredient_id));
            for (const ing of toUpdate) {
                const baseUnit = ing.unit;
                const displayUnit = ing.display_unit || 'kg';
                const convertedQty = convertToBaseUnit(ing.quantity_needed, displayUnit, baseUnit);
                await fetch(`${backendUrl}/api/recipes/${selectedRecipe.id}/ingredients/${ing.ingredient_id}`, {
                    method: 'PUT', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({quantity_needed: convertedQty})
                });
            }
            const toAdd = editIngredients.filter(ing => !currentIds.includes(ing.ingredient_id));
            for (const ing of toAdd) {
                const baseUnit = ing.unit || 'kg';
                const displayUnit = ing.display_unit || baseUnit;
                const convertedQty = convertToBaseUnit(ing.quantity_needed, displayUnit, baseUnit);
                await fetch(`${backendUrl}/api/recipes/${selectedRecipe.id}/ingredients`, {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ingredient_id: ing.ingredient_id, quantity_needed: convertedQty})
                });
            }
            setEditConfirm(false); window.location.reload();
        } catch (err) { alert('Error: ' + err.message); }
    };

    const deleteRecipe = async (id) => {
        try {
            await fetch(`${backendUrl}/api/recipes/${id}`, {method: 'DELETE'});
            window.location.reload();
        } catch (err) { alert('Error: ' + err.message); }
    };

    const inputStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2d2d3f', color: 'white', width: '100%' };
    const btnStyle = { padding: '10px 20px', backgroundColor: '#f59e0b', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>;

    return (
        <div className="dashboard">
            <div className="sidebar">
                <div className="sidebar-header"><h4><i className="fas fa-utensils text-warning me-2"></i>ChefSync</h4><span className="badge bg-warning text-dark">Admin</span></div>
                <nav className="sidebar-nav">
                    <a className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}><i className="fas fa-chart-line me-2"></i>Resumen</a>
                    <a className={activeTab === "ingredients" ? "active" : ""} onClick={() => setActiveTab("ingredients")}><i className="fas fa-carrot me-2"></i>Ingredientes<span className="badge bg-danger">{store.alerts.lowStock.length}</span></a>
                    <a className={activeTab === "recipes" ? "active" : ""} onClick={() => setActiveTab("recipes")}><i className="fas fa-book me-2"></i>Recetas<span className="badge bg-warning">{store.alerts.marginAlerts.length}</span></a>
                    <a className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}><i className="fas fa-clipboard-list me-2"></i>Pedidos<span className="badge bg-info">{pendingOrders}</span></a>
                    <a className={activeTab === "clients" ? "active" : ""} onClick={() => setActiveTab("clients")}><i className="fas fa-users me-2"></i>Clientes</a>
                    <a className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}><i className="fas fa-chart-bar me-2"></i>Estadísticas</a>
                    <a onClick={logout} className="logout"><i className="fas fa-sign-out-alt me-2"></i>Salir</a>
                </nav>
            </div>
            <div className="main-content">
                <h2>{activeTab === "overview" && "Resumen"}{activeTab === "ingredients" && "Ingredientes"}{activeTab === "recipes" && "Recetas"}{activeTab === "orders" && "Pedidos"}{activeTab === "clients" && "Clientes"}{activeTab === "stats" && "Estadísticas"}</h2>
                
                {activeTab === "overview" && <DashboardOverview 
                    totalRecipes={totalRecipes} 
                    totalIngredients={totalIngredients} 
                    pendingOrders={pendingOrders} 
                    inProductionOrders={inProductionOrders} 
                />}

                {activeTab === "ingredients" && <DashboardIngredients 
                    ingredients={store.ingredients} 
                    onNewIngredient={() => {setIngredientSource('tab'); setShowNewIngredient(true);}}
                />}

                {activeTab === "recipes" && <DashboardRecipes 
                    recipes={store.recipes} 
                    calculateCost={calculateCost}
                    calculateMargin={calculateMargin}
                    onViewRecipe={(recipe) => {setSelectedRecipeId(recipe.id); setShowModal(true);}}
                    onDelete={(id) => setDeleteConfirm(id)}
                />}

{activeTab === "orders" && <DashboardOrders 
                    orders={store.orders} 
                    onStatusChange={changeOrderStatus}
                    onEditOrder={(order) => {setSelectedOrderEdit(order); setEditOrderItems(order.items || []);}}
                    onStartProduction={startProduction}
                />}

                {activeTab === "clients" && <DashboardClients 
                    clients={store.clients} 
                    onNewClient={() => setShowNewClient(true)}
                />}

                {activeTab === "stats" && <DashboardStats 
                    orders={store.orders} 
                    recipes={store.recipes}
                    calculateCost={calculateCost}
                />}
            </div>

            {deleteConfirm && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999}}>
                <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center'}}>
                    <h3>¿Eliminar receta?</h3>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                        <button onClick={() => setDeleteConfirm(null)} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={() => {deleteRecipe(deleteConfirm); setDeleteConfirm(null);}} style={{...btnStyle, backgroundColor: '#ef4444'}}>Eliminar</button>
                    </div>
                </div>
            </div>}

            {showModal && selectedRecipe && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={() => {setShowModal(false); setEditMode(false); setEditConfirm(false);}}>
                <div style={{backgroundColor: '#1e1e2f', padding: '40px', borderRadius: '15px', maxWidth: '700px', width: '90%', color: 'white'}} onClick={e => e.stopPropagation()}>
                    {editMode ? (
                        <>
                            <h2>Editar Receta</h2>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                                <div><label>Nombre</label><input value={editRecipe.name} onChange={e => setEditRecipe({...editRecipe, name: e.target.value})} style={{...inputStyle, width: '100%'}}/></div>
                                <div><label>Precio €</label><input type="number" value={editRecipe.sale_price} onChange={e => setEditRecipe({...editRecipe, sale_price: e.target.value})} style={{...inputStyle, width: '100%'}}/></div>
                            </div>
                            <hr/>
                            <h4>Ingredientes <small>(marca para eliminar)</small></h4>
                            {editIngredients.length > 0 && <table style={{width: '100%', marginBottom: '15px'}}><thead><tr><th style={{width: '40px'}}>X</th><th>Nombre</th><th>Cantidad</th><th>Unidad</th></tr></thead><tbody>
                                {editIngredients.map((ing, i) => <tr key={i}><td><input type="checkbox" checked={ing.checked || false} onChange={() => toggleIngredientEdit(ing.id)}/></td><td>{ing.ingredient_name || ing.name}</td><td><input type="number" step="0.01" value={ing.quantity_needed} onChange={e => setEditIngredients(editIngredients.map(item => item.id === ing.id ? {...item, quantity_needed: parseFloat(e.target.value) || 0} : item))} style={{width: '80px', padding: '5px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}/></td><td><select value={ing.display_unit || 'kg'} onChange={e => setEditIngredients(editIngredients.map(item => item.id === ing.id ? {...item, display_unit: e.target.value} : item))} style={{padding: '5px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}><option value="kg">{ing.unit === 'kg' ? 'kg' : ing.unit === 'l' ? 'l' : 'ud'}</option><option value="g">{ing.unit === 'kg' ? 'g' : ''}</option><option value="ml">{ing.unit === 'l' ? 'ml' : ''}</option></select></td></tr>)}
                            </tbody></table>}
                            {editIngredients.some(ing => ing.checked) && <button onClick={removeCheckedIngredients} style={{backgroundColor: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '5px', color: 'white', marginBottom: '15px'}}>Eliminar marcados</button>}
                            <hr/>
                            <h5>Agregar ingrediente</h5>
                            <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                                <select value={selectedIngToEdit} onChange={e => {setSelectedIngToEdit(e.target.value); if(e.target.value === 'new') setShowNewIngredientEdit(true);}} style={{...inputStyle, flex: 1, minWidth: '200px'}}>
                                    <option value="">Seleccionar existente...</option>
                                    <option value="new" style={{color: '#f59e0b'}}>+ Crear nuevo</option>
                                    {store.ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                                </select>
                                <button onClick={() => {if(selectedIngToEdit === 'new') setShowNewIngredientEdit(true); else addIngredientToEdit();}} style={btnStyle}>Agregar</button>
                            </div>
                            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                <button onClick={() => {setEditMode(false); setEditConfirm(false);}} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                                <button onClick={() => setEditConfirm(true)} style={btnStyle}>Guardar</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2>{selectedRecipe.name}</h2>
                            <div style={{backgroundColor: '#22c55e', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px'}}>
                                <span style={{fontSize: '24px', fontWeight: 'bold'}}>MÁXIMO: {calculateMaxPlates(selectedRecipe)} unidades</span>
                            </div>
                            <p><strong>Precio:</strong> {selectedRecipe.sale_price}€ | <strong>Coste:</strong> <span style={{color: '#f59e0b'}}>{calculateCost(selectedRecipe).toFixed(2)}€</span> | <strong>Margen:</strong> <span style={{color: calculateMargin(selectedRecipe) < 30 ? '#ef4444' : '#22c55e'}}>{calculateMargin(selectedRecipe).toFixed(1)}%</span></p>
                            <hr/>
                            <h4>Calculadora</h4>
                            <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                                <input type="number" value={calculatorQty} onChange={e => setCalculatorQty(parseInt(e.target.value) || 0)} style={{padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#2d2d3f', color: 'white', width: '100px'}}/>
                                <span style={{alignSelf: 'center'}}>unidades</span>
                            </div>
                            {calculatorQty > 0 && <table style={{width: '100%', marginBottom: '20px'}}><thead><tr><th>Ingrediente</th><th>x1</th><th>Total</th></tr></thead><tbody>
                                {calculateForQty(selectedRecipe, calculatorQty).map((ing, i) => <tr key={i}><td>{ing.name}</td><td>{ing.perPlate} {ing.unit}</td><td style={{color: '#f59e0b'}}>{ing.total} {ing.unit}</td></tr>)}
                            </tbody></table>}
                            <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                <button onClick={() => setShowModal(false)} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cerrar</button>
                                <button onClick={startEditRecipe} style={btnStyle}>Editar</button>
                            </div>
                        </>
                    )}
                </div>
            </div>}

            {showNewRecipe && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={() => {setShowNewRecipe(false); setNewRecipeIngredients([]); setSelectedIngToAdd('');}}>
                <div style={{backgroundColor: '#1e1e2f', padding: '40px', borderRadius: '15px', maxWidth: '700px', width: '90%', color: 'white'}} onClick={e => e.stopPropagation()}>
                    <h2>Nueva Receta</h2>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                        <div><label>Nombre *</label><input value={newRecipe.name} onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} placeholder="Nombre" style={{...inputStyle, width: '100%'}}/></div>
                        <div><label>Precio € *</label><input type="number" value={newRecipe.sale_price} onChange={e => setNewRecipe({...newRecipe, sale_price: e.target.value})} placeholder="0.00" style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <hr/>
                    <h4>Ingredientes</h4>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                        <select value={selectedIngToAdd} onChange={e => {setSelectedIngToAdd(e.target.value); if(e.target.value === 'new') setShowNewIngredient(true);}} style={{...inputStyle, flex: 1, minWidth: '200px'}}>
                            <option value="">Seleccionar existente...</option>
                            <option value="new" style={{color: '#f59e0b'}}>+ Crear nuevo</option>
                            {store.ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                        </select>
                        <button onClick={() => {if(selectedIngToAdd === 'new') setShowNewIngredient(true); else addIngredientToRecipe();}} style={btnStyle}>Agregar</button>
                    </div>
                    {newRecipeIngredients.length > 0 && <table style={{width: '100%', marginBottom: '20px'}}><thead><tr><th>Ingrediente</th><th>Cantidad x1</th><th>Unidad</th><th></th></tr></thead><tbody>
                        {newRecipeIngredients.map(ing => <tr key={ing.ingredient_id}><td>{ing.name}</td><td><input type="number" step="0.01" value={ing.quantity_needed} onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? {...i, quantity_needed: parseFloat(e.target.value) || 0} : i))} style={{width: '80px', padding: '5px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}/></td><td><select value={ing.display_unit || ing.unit} onChange={e => setNewRecipeIngredients(newRecipeIngredients.map(i => i.ingredient_id == ing.ingredient_id ? {...i, display_unit: e.target.value} : i))} style={{padding: '5px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}><option value={ing.unit}>{ing.unit}</option><option value="g">{ing.unit === 'kg' ? 'g' : ''}</option><option value="ml">{ing.unit === 'l' ? 'ml' : ''}</option></select></td><td><button onClick={() => setNewRecipeIngredients(newRecipeIngredients.filter(i => i.ingredient_id !== ing.ingredient_id))} style={{backgroundColor: '#ef4444', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>X</button></td></tr>)}
                    </tbody></table>}
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        <button onClick={() => {setShowNewRecipe(false); setNewRecipeIngredients([]);}} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={saveNewRecipe} style={btnStyle}>Guardar</button>
                    </div>
                </div>
            </div>}

            {showNewIngredient && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999}} onClick={() => {setShowNewIngredient(false); setIngredientSource('');}}>
                <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', maxWidth: '500px', width: '90%', color: 'white'}} onClick={e => e.stopPropagation()}>
                    <h3>Nuevo Ingrediente</h3>
                    <div style={{marginBottom: '15px'}}><label>Nombre *</label><input value={newIngredient.name} onChange={e => setNewIngredient({...newIngredient, name: e.target.value})} placeholder="Ej: Queso azul" style={{...inputStyle, width: '100%'}}/></div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                        <div><label>Unidad *</label><select value={newIngredient.unit} onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})} style={{...inputStyle, width: '100%'}}><option value="kg">kg</option><option value="g">g</option><option value="l">l</option><option value="ml">ml</option><option value="ud">ud</option></select></div>
                        <div><label>Precio € *</label><input type="number" step="0.01" value={newIngredient.cost_per_unit} onChange={e => setNewIngredient({...newIngredient, cost_per_unit: e.target.value})} placeholder="0.00" style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px'}}>
                        <div><label>Stock</label><input type="number" value={newIngredient.current_stock} onChange={e => setNewIngredient({...newIngredient, current_stock: e.target.value})} placeholder="0" style={{...inputStyle, width: '100%'}}/></div>
                        <div><label>Proveedor</label><input value={newIngredient.supplier || ''} onChange={e => setNewIngredient({...newIngredient, supplier: e.target.value})} placeholder="Nombre" style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        <button onClick={() => {setShowNewIngredient(false); setIngredientSource('');}} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={() => {if(newIngredient.name && newIngredient.unit && newIngredient.cost_per_unit) {ingredientSource === 'tab' ? saveIngredientFromTab() : createNewIngredientForRecipeStay(); setShowNewIngredient(false); setIngredientSource('');}}} style={btnStyle}>Crear</button>
                    </div>
                </div>
            </div>}

            <style>{`
                .dashboard { display: flex; min-height: 100vh; background: #0f0f1a; }
                .sidebar { width: 250px; background: #1a1a2e; padding: 20px; position: fixed; height: 100vh; }
                .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .sidebar-header h4 { color: white; margin: 0; }
                .sidebar-nav a { display: flex; align-items: center; padding: 12px 15px; color: #aaa; text-decoration: none; border-radius: 8px; margin-bottom: 5px; cursor: pointer; }
                .sidebar-nav a:hover, .sidebar-nav a.active { background: #2d2d3f; color: white; }
                .sidebar-nav .badge { margin-left: auto; font-size: 10px; }
                .sidebar-nav .logout { margin-top: 30px; color: #ef4444; }
                .main-content { margin-left: 250px; flex: 1; padding: 30px; }
                .main-content h2 { color: white; margin-bottom: 30px; }
                .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                .metric-card { background: #1e1e2f; padding: 20px; borderRadius: 15px; display: flex; align-items: center; }
                .metric-icon { width: 60px; height: 60px; borderRadius: 12px; display: flex; align-items: center; justify-content: center; fontSize: 24px; margin-right: 15px; }
                .metric-info h3 { color: white; margin: 0; fontSize: 28px; }
                .metric-info p { color: #aaa; margin: 0; }
                .table-dark { background: #1e1e2f; }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                .stat-card { background: #1e1e2f; padding: 20px; borderRadius: 15px; }
                .stat-card h4 { color: #aaa; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; }
                .stat-card h3 { color: white; margin: 0; font-size: 32px; }
                .stat-card.full-width { grid-column: span 2; }
            `}</style>

            {editConfirm && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999}}>
                <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center'}}>
                    <h3>¿Guardar cambios?</h3>
                    <p>Se modified nombre, precio y ingredientes.</p>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                        <button onClick={() => setEditConfirm(false)} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={saveRecipeEdit} style={btnStyle}>Confirmar</button>
                    </div>
                </div>
            </div>}

            {showNewIngredientEdit && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999}} onClick={() => setShowNewIngredientEdit(false)}>
                <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', maxWidth: '500px', width: '90%', color: 'white'}} onClick={e => e.stopPropagation()}>
                    <h3>Nuevo Ingrediente</h3>
                    <div style={{marginBottom: '15px'}}><label>Nombre *</label><input value={newIngredientEdit.name} onChange={e => setNewIngredientEdit({...newIngredientEdit, name: e.target.value})} placeholder="Ej: Queso azul" style={{...inputStyle, width: '100%'}}/></div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                        <div><label>Unidad *</label><select value={newIngredientEdit.unit} onChange={e => setNewIngredientEdit({...newIngredientEdit, unit: e.target.value})} style={{...inputStyle, width: '100%'}}><option value="kg">kg</option><option value="l">l</option><option value="ud">ud</option></select></div>
                        <div><label>Precio € *</label><input type="number" step="0.01" value={newIngredientEdit.cost_per_unit} onChange={e => setNewIngredientEdit({...newIngredientEdit, cost_per_unit: e.target.value})} placeholder="0.00" style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px'}}>
                        <div><label>Stock</label><input type="number" value={newIngredientEdit.current_stock} onChange={e => setNewIngredientEdit({...newIngredientEdit, current_stock: e.target.value})} placeholder="0" style={{...inputStyle, width: '100%'}}/></div>
                        <div><label>Proveedor</label><input value={newIngredientEdit.supplier || ''} onChange={e => setNewIngredientEdit({...newIngredientEdit, supplier: e.target.value})} placeholder="Nombre" style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        <button onClick={() => setShowNewIngredientEdit(false)} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={() => {if(newIngredientEdit.name && newIngredientEdit.unit && newIngredientEdit.cost_per_unit) {createNewIngredientForRecipeEdit(); setShowNewIngredientEdit(false);}}} style={btnStyle}>Crear</button>
                    </div>
                </div>
            </div>}

            {showNewOrder && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={() => {setShowNewOrder(false); setNewOrderItems([]);}}>
                <div style={{backgroundColor: '#1e1e2f', padding: '40px', borderRadius: '15px', maxWidth: '700px', width: '90%', color: 'white'}} onClick={e => e.stopPropagation()}>
                    <h2>Nuevo Pedido</h2>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                        <div><label>Cliente *</label><select value={newOrder.client_id} onChange={e => setNewOrder({...newOrder, client_id: e.target.value})} style={{...inputStyle, width: '100%'}}>
                            <option value="">Seleccionar cliente...</option>
                            {store.clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select></div>
                        <div><label>Fecha entrega *</label><input type="date" value={newOrder.delivery_date} onChange={e => setNewOrder({...newOrder, delivery_date: e.target.value})} style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <div style={{marginBottom: '20px'}}><label>Notas</label><textarea value={newOrder.notes || ''} onChange={e => setNewOrder({...newOrder, notes: e.target.value})} placeholder="Notas del pedido..." style={{...inputStyle, width: '100%', minHeight: '60px'}}/></div>
                    <hr/>
                    <h4>Items</h4>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                        <select value={selectedRecipeForOrder} onChange={e => setSelectedRecipeForOrder(e.target.value)} style={{...inputStyle, flex: 1, minWidth: '200px'}}>
                            <option value="">Seleccionar receta...</option>
                            {store.recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <input type="number" min="1" value={orderItemQty} onChange={e => setOrderItemQty(parseInt(e.target.value) || 1)} style={{width: '80px', padding: '10px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}/>
                        <button onClick={addItemToNewOrder} style={btnStyle}>Agregar</button>
                    </div>
                    {newOrderItems.length > 0 && <table style={{width: '100%', marginBottom: '20px'}}><thead><tr><th>Receta</th><th>Cantidad</th><th></th></tr></thead><tbody>
                        {newOrderItems.map((item, i) => <tr key={i}><td>{item.name}</td><td>{item.quantity}</td><td><button onClick={() => setNewOrderItems(newOrderItems.filter((_, idx) => idx !== i))} style={{backgroundColor: '#ef4444', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>X</button></td></tr>)}
                    </tbody></table>}
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        <button onClick={() => {setShowNewOrder(false); setNewOrderItems([]);}} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={saveNewOrder} style={btnStyle}>Crear Pedido</button>
                    </div>
                </div>
            </div>}

            {showNewClient && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999}} onClick={() => setShowNewClient(false)}>
                <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', maxWidth: '500px', width: '90%', color: 'white'}} onClick={e => e.stopPropagation()}>
                    <h3>Nuevo Cliente</h3>
                    <div style={{marginBottom: '15px'}}><label>Nombre *</label><input value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="Nombre" style={{...inputStyle, width: '100%'}}/></div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                        <div><label>Email</label><input type="email" value={newClient.email || ''} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="email@ejemplo.com" style={{...inputStyle, width: '100%'}}/></div>
                        <div><label>Teléfono</label><input value={newClient.phone || ''} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="600 000 000" style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <div style={{marginBottom: '20px'}}><label>Dirección</label><input value={newClient.address || ''} onChange={e => setNewClient({...newClient, address: e.target.value})} placeholder="Dirección" style={{...inputStyle, width: '100%'}}/></div>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        <button onClick={() => setShowNewClient(false)} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={saveNewClient} style={btnStyle}>Crear</button>
                    </div>
                </div>
            </div>}

            {productionConfirm && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999}}>
                <div style={{backgroundColor: '#1e1e2f', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center'}}>
                    <h3>¿Iniciar producción?</h3>
                    <p>Se descontará el inventario automáticamente.</p>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                        <button onClick={() => setProductionConfirm(null)} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={confirmProduction} style={btnStyle}>Confirmar</button>
                    </div>
                </div>
            </div>}

            {selectedOrderEdit && <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, overflowY: 'auto'}} onClick={() => setSelectedOrderEdit(null)}>
                <div style={{backgroundColor: '#1e1e2f', padding: '40px', borderRadius: '15px', maxWidth: '700px', width: '90%', color: 'white'}} onClick={e => e.stopPropagation()}>
                    <h3>Editar Pedido #{selectedOrderEdit.id}</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
                        <div><label>Fecha entrega</label><input type="date" value={selectedOrderEdit.delivery_date} onChange={e => setSelectedOrderEdit({...selectedOrderEdit, delivery_date: e.target.value})} style={{...inputStyle, width: '100%'}}/></div>
                        <div><label>Notas</label><input value={selectedOrderEdit.notes || ''} onChange={e => setSelectedOrderEdit({...selectedOrderEdit, notes: e.target.value})} placeholder="Notas" style={{...inputStyle, width: '100%'}}/></div>
                    </div>
                    <hr/>
                    <h4>Items</h4>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap'}}>
                        <select value={selectedRecipeForOrder} onChange={e => setSelectedRecipeForOrder(e.target.value)} style={{...inputStyle, flex: 1, minWidth: '200px'}}>
                            <option value="">Seleccionar receta...</option>
                            {store.recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <input type="number" min="1" value={orderItemQty} onChange={e => setOrderItemQty(parseInt(e.target.value) || 1)} style={{width: '80px', padding: '10px', backgroundColor: '#2d2d3f', border: 'none', color: 'white'}}/>
                        <button onClick={addItemToEditOrder} style={btnStyle}>Agregar</button>
                    </div>
                    {editOrderItems.length > 0 && <table style={{width: '100%', marginBottom: '20px'}}><thead><tr><th>Receta</th><th>Cantidad</th><th></th></tr></thead><tbody>
                        {editOrderItems.map((item, i) => <tr key={i}><td>{item.name || item.recipe_name}</td><td>{item.quantity}</td><td><button onClick={() => setEditOrderItems(editOrderItems.filter((_, idx) => idx !== i))} style={{backgroundColor: '#ef4444', border: 'none', padding: '5px 10px', cursor: 'pointer'}}>X</button></td></tr>)}
                    </tbody></table>}
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                        <button onClick={() => setSelectedOrderEdit(null)} style={{...btnStyle, backgroundColor: '#6b7280'}}>Cancelar</button>
                        <button onClick={saveOrderEdit} style={btnStyle}>Guardar</button>
                    </div>
                </div>
            </div>}
        </div>
    );
};