import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate(data.user.role === "admin" ? "/admin" : "/chef");
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
        <div style={{
            minHeight: "100vh",
            background: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-body)",
            position: "relative",
            overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", inset: 0, zIndex: 0,
                background: "radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(200,240,96,0.06) 0%, transparent 50%)",
            }} />

            <div style={{
                position: "relative", zIndex: 1,
                width: "100%", maxWidth: "400px",
                margin: "20px",
                background: "var(--bg2)",
                border: "1px solid var(--border2)",
                borderRadius: "20px",
                padding: "40px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "52px", height: "52px",
                        background: "var(--accent)",
                        borderRadius: "14px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "16px",
                    }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0f0f11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text)", marginBottom: "6px" }}>
                        Chef<span style={{ color: "var(--accent)" }}>sync</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                        Inicia sesión para continuar
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: "rgba(255,107,107,0.1)",
                        border: "1px solid rgba(255,107,107,0.3)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontSize: "13px",
                        color: "var(--accent3)",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{
                            display: "block", fontSize: "11px", fontWeight: 600,
                            color: "var(--muted)", marginBottom: "6px",
                            textTransform: "uppercase", letterSpacing: "0.06em"
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: "100%", background: "var(--bg3)",
                                border: "1px solid var(--border)",
                                borderRadius: "10px", padding: "10px 14px",
                                fontSize: "14px", color: "var(--text)",
                                fontFamily: "var(--font-body)", outline: "none",
                                transition: "border-color 0.15s", boxSizing: "border-box",
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--accent)"}
                            onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: "block", fontSize: "11px", fontWeight: 600,
                            color: "var(--muted)", marginBottom: "6px",
                            textTransform: "uppercase", letterSpacing: "0.06em"
                        }}>
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: "100%", background: "var(--bg3)",
                                border: "1px solid var(--border)",
                                borderRadius: "10px", padding: "10px 14px",
                                fontSize: "14px", color: "var(--text)",
                                fontFamily: "var(--font-body)", outline: "none",
                                transition: "border-color 0.15s", boxSizing: "border-box",
                            }}
                            onFocus={e => e.target.style.borderColor = "var(--accent)"}
                            onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", padding: "12px",
                            background: loading ? "var(--bg4)" : "var(--accent)",
                            color: "#0f0f11", border: "none",
                            borderRadius: "10px", fontSize: "14px",
                            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                            fontFamily: "var(--font-head)", letterSpacing: "0.02em",
                            transition: "background 0.15s", marginTop: "4px",
                        }}
                        onMouseEnter={e => { if (!loading) e.target.style.background = "#d4f472"; }}
                        onMouseLeave={e => { if (!loading) e.target.style.background = "var(--accent)"; }}
                    >
                        {loading ? "Iniciando sesión..." : "Iniciar sesión →"}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <a href="/" style={{ fontSize: "12px", color: "var(--muted)", textDecoration: "none", display: "block", marginBottom: "8px" }}>
                        ← Volver al inicio
                    </a>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        ¿No tienes cuenta?{" "}
                        <Link to="/signup" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                            Regístrate gratis
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    );
};