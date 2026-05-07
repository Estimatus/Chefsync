import React from "react";
import { Link } from "react-router-dom";

export const Landing = () => {
    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <i className="fas fa-utensils me-2"></i>
                        ChefSync
                    </Link>
                    <div className="d-flex">
                        <Link to="/login" className="btn btn-outline-light me-2">
                            <i className="fas fa-sign-in-alt me-1"></i>
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="container">
                    <div className="row align-items-center min-vh-100">
                        <div className="col-lg-6">
                            <h1 className="display-3 fw-bold text-white mb-4">
                                Gestión Inteligente
                                <span className="text-warning"> para tu Cocina</span>
                            </h1>
                            <p className="lead text-white-50 mb-4">
                                Controla tu restaurante como un profesional. 
                                Escandallos automáticos, inventario en tiempo real 
                                y pedidos optimizados.
                            </p>
                            <div className="d-flex gap-3">
                                <Link to="/login" className="btn btn-warning btn-lg px-4">
                                    Comenzar Ahora
                                    <i className="fas fa-arrow-right ms-2"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-6 text-center">
                            <div className="hero-icon">
                                <i className="fas fa-hat-chef"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="features-section py-5">
                <div className="container">
                    <h2 className="text-center mb-5">
                        <span className="text-warning">¿</span>Qué incluye ChefSync?
                    </h2>
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-calculator"></i>
                                </div>
                                <h3>Escandallos</h3>
                                <p>
                                    Calcula automáticamente el coste real de cada plato. 
                                    Alertas cuando el margen baje del 30%.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-boxes-stacked"></i>
                                </div>
                                <h3>Inventario</h3>
                                <p>
                                    Controla tu stock en tiempo real. 
                                    Descuenta automáticamente al producir.
                                </p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-list-check"></i>
                                </div>
                                <h3>Lista de Compra</h3>
                                <p>
                                    Genera tu lista de proveedores automáticamente 
                                    basada en los pedidos confirmados.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer bg-dark py-4">
                <div className="container text-center">
                    <p className="text-white-50 mb-0">
                        <i className="fas fa-utensils me-2"></i>
                        ChefSync © 2026 - Gestión de Producción Culinaría
                    </p>
                </div>
            </footer>

            <style>{`
                .landing-page {
                    min-height: 100vh;
                }
                .hero-section {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    padding: 80px 0;
                    min-height: 80vh;
                }
                .hero-icon {
                    font-size: 150px;
                    color: #f59e0b;
                    opacity: 0.3;
                }
                .feature-card {
                    background: #1e1e2f;
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    transition: transform 0.3s;
                }
                .feature-card:hover {
                    transform: translateY(-10px);
                }
                .feature-icon {
                    font-size: 40px;
                    color: #f59e0b;
                    margin-bottom: 20px;
                }
                .feature-card h3 {
                    color: white;
                    margin-bottom: 15px;
                }
                .feature-card p {
                    color: #aaa;
                }
                .features-section {
                    background: #0f0f1a;
                    padding: 80px 0;
                }
            `}</style>
        </div>
    );
};