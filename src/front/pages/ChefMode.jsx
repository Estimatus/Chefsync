import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ChefMode = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Verificar autenticación
    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login");
        }
    }, [navigate]);

    // Cargar pedidos de hoy
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/orders`);
                const data = await response.json();
                // Filtrar pedidos en producción o pendientes
                const activeOrders = data.filter(o => 
                    o.status === "pending" || 
                    o.status === "confirmed" || 
                    o.status === "in_production"
                );
                setOrders(activeOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
        // Actualizar cada 30 segundos
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [backendUrl]);

    // Marcar como listo
    const markReady = async (orderId) => {
        try {
            const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ready" })
            });
            
            if (response.ok) {
                setOrders(orders.map(o => 
                    o.id === orderId ? { ...o, status: "ready" } : o
                ));
            }
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    // Agrupar pedidos por receta
    const groupedOrders = orders.reduce((acc, order) => {
        order.items?.forEach(item => {
            if (!acc[item.recipe_name]) {
                acc[item.recipe_name] = { quantity: 0, orderIds: [], status: order.status };
            }
            acc[item.recipe_name].quantity += item.quantity;
            acc[item.recipe_name].orderIds.push(order.id);
            // Tomar el estado más avanzado
            if (order.status === "in_production") acc[item.recipe_name].status = "in_production";
        });
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="chef-mode text-center py-5">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="chef-mode">
            {/* Header */}
            <div className="chef-header">
                <div className="container">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2><i className="fas fa-hat-chef text-warning me-2"></i>Modo Cocinero</h2>
                            <p className="text-muted mb-0">Pedidos para hoy</p>
                        </div>
                        <button 
                            className="btn btn-outline-light"
                            onClick={() => navigate("/login")}
                        >
                            <i className="fas fa-sign-out-alt me-2"></i>Salir
                        </button>
                    </div>
                </div>
            </div>

            {/* Production List */}
            <div className="production-list">
                <div className="container py-4">
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-check-circle fa-4x text-success"></i>
                            <h3 className="mt-3">¡No hay pedidos pendientes!</h3>
                            <p className="text-muted">Puedes descansar hoy.</p>
                        </div>
                    ) : (
                        <div className="row">
                            {Object.entries(groupedOrders).map(([recipeName, data]) => (
                                <div key={recipeName} className="col-md-6 col-lg-4 mb-4">
                                    <div className={`recipe-card ${data.status === "ready" ? "ready" : ""}`}>
                                        <div className="recipe-header">
                                            <h3>{recipeName}</h3>
                                            <span className={`badge bg-${
                                                data.status === "ready" ? "success" :
                                                data.status === "in_production" ? "warning" :
                                                "secondary"
                                            }`}>
                                                {data.status === "ready" ? "Listo" :
                                                 data.status === "in_production" ? "En progreso" : "Pendiente"}
                                            </span>
                                        </div>
                                        <div className="quantity">
                                            <span className="number">{data.quantity}</span>
                                            <span className="label">unidades</span>
                                        </div>
                                        {data.status !== "ready" && (
                                            <button 
                                                className="btn btn-success w-100 mt-3"
                                                onClick={() => data.orderIds.forEach(id => markReady(id))}
                                            >
                                                <i className="fas fa-check me-2"></i>Marcar Listo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .chef-mode {
                    min-height: 100vh;
                    background: #0f0f1a;
                }
                .chef-header {
                    background: #1a1a2e;
                    padding: 20px 0;
                }
                .chef-header h2 {
                    color: white;
                    margin: 0;
                }
                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                }
                .recipe-card {
                    background: #1e1e2f;
                    border-radius: 20px;
                    padding: 30px;
                    text-align: center;
                    transition: all 0.3s;
                }
                .recipe-card.ready {
                    background: #1a3d1a;
                    border: 2px solid #22c55e;
                }
                .recipe-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .recipe-header h3 {
                    color: white;
                    margin: 0;
                    font-size: 1.2rem;
                }
                .quantity {
                    margin: 20px 0;
                }
                .quantity .number {
                    display: block;
                    font-size: 72px;
                    font-weight: bold;
                    color: #f59e0b;
                    line-height: 1;
                }
                .quantity .label {
                    color: #aaa;
                    font-size: 18px;
                }
                .btn-success {
                    background: #22c55e;
                    border: none;
                    padding: 15px;
                    font-size: 18px;
                    font-weight: 600;
                }
                .btn-success:hover {
                    background: #16a34a;
                }
            `}</style>
        </div>
    );
};