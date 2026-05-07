import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar user en localStorage
                localStorage.setItem("user", JSON.stringify(data.user));
                // Redirigir según rol
                if (data.user.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/chef");
                }
            } else {
                setError(data.error || "Error al iniciar sesión");
            }
        } catch (err) {
            setError("No se pudo conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="text-center mb-4">
                        <i className="fas fa-utensils fa-3x text-warning"></i>
                        <h2 className="mt-3">ChefSync</h2>
                        <p className="text-muted">Inicia sesión para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert alert-danger py-2">
                                {error}
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Contraseña</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-warning w-100 py-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span>
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Iniciando...
                                </span>
                            ) : (
                                <span>
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Iniciar Sesión
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <a href="/" className="text-muted text-decoration-none">
                            <i className="fas fa-arrow-left me-1"></i>
                            Volver al inicio
                        </a>
                    </div>
                </div>
            </div>

            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }
                .login-container {
                    width: 100%;
                    max-width: 400px;
                    padding: 20px;
                }
                .login-card {
                    background: #1e1e2f;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                }
                .login-card h2 {
                    color: white;
                }
                .form-control {
                    background: #2d2d3f;
                    border: 1px solid #3d3d4f;
                    color: white;
                }
                .form-control:focus {
                    background: #2d2d3f;
                    border-color: #f59e0b;
                    color: white;
                    box-shadow: 0 0 0 0.2rem rgba(245, 158, 11, 0.25);
                }
                .input-group-text {
                    background: #2d2d3f;
                    border: 1px solid #3d3d4f;
                    border-right: none;
                    color: #aaa;
                }
                .btn-warning {
                    background: #f59e0b;
                    border: none;
                    color: #1a1a2e;
                    font-weight: 600;
                }
                .btn-warning:hover {
                    background: #d97706;
                    color: #1a1a2e;
                }
                .btn-warning:disabled {
                    background: #f59e0b;
                    opacity: 0.7;
                }
                .form-label {
                    color: #aaa;
                }
            `}</style>
        </div>
    );
};