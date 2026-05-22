import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const inputStyle = {
    width: "100%", background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "10px", padding: "10px 14px",
    fontSize: "14px", color: "var(--text)",
    fontFamily: "var(--font-body)", outline: "none",
    transition: "border-color 0.15s", boxSizing: "border-box",
};

const labelStyle = {
    display: "block", fontSize: "11px", fontWeight: 600,
    color: "var(--muted)", marginBottom: "6px",
    textTransform: "uppercase", letterSpacing: "0.06em"
};

const BUSINESS_TYPES = [
    { value: "cocina", label: "🍳 Cocina / Dark Kitchen" },
    { value: "reposteria", label: "🎂 Repostería / Pastelería" },
    { value: "catering", label: "🍽 Catering" },
    { value: "estampados", label: "👕 Estampados / Serigrafía" },
    { value: "artesanias", label: "🧶 Artesanías" },
    { value: "joyeria", label: "💍 Joyería / Accesorios" },
    { value: "costura", label: "🧵 Costura / Confección" },
    { value: "general", label: "📦 Otro emprendimiento" },
];

export const Signup = () => {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        businessName: "",
        businessType: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleNext = () => {
        if (step === 1) {
            if (!form.businessName) return setError("El nombre del negocio es obligatorio");
            if (!form.businessType) return setError("Selecciona el tipo de negocio");
        }
        setError("");
        setStep(2);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) return setError("Email y contraseña son obligatorios");
    if (form.password !== form.confirmPassword) return setError("Las contraseñas no coinciden");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres");

    setLoading(true);
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        // 1. Crear usuario y tenant
        const response = await fetch(`${backendUrl}/api/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: form.email,
                password: form.password,
                business_name: form.businessName,
                business_type: form.businessType,
                role: "admin",
            })
        });
        const data = await response.json();

        if (!response.ok) {
            return setError(data.error || "Error al crear la cuenta");
        }

        // 2. Auto login
        const loginResp = await fetch(`${backendUrl}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password })
        });
        const loginData = await loginResp.json();

        if (loginResp.ok) {
            // 3. Limpiar localStorage completamente antes de guardar el nuevo usuario
            localStorage.clear();
            localStorage.setItem("user", JSON.stringify(loginData.user));
            // 4. Forzar recarga completa para limpiar el store
            window.location.href = "/admin";
        } else {
            navigate("/login");
        }
    } catch (err) {
        setError("No se pudo conectar con el servidor");
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={{
            minHeight: "100vh", background: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-body)", position: "relative", overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", inset: 0, zIndex: 0,
                background: "radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(200,240,96,0.06) 0%, transparent 50%)",
            }} />

            <div style={{
                position: "relative", zIndex: 1,
                width: "100%", maxWidth: step === 1 ? "520px" : "400px",
                margin: "20px",
                background: "var(--bg2)",
                border: "1px solid var(--border2)",
                borderRadius: "20px", padding: "40px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                transition: "max-width 0.3s ease",
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{
                        width: "52px", height: "52px", background: "var(--accent)",
                        borderRadius: "14px", display: "inline-flex",
                        alignItems: "center", justifyContent: "center", marginBottom: "16px",
                    }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0f0f11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", color: "var(--text)", marginBottom: "6px" }}>
                        Chef<span style={{ color: "var(--accent)" }}>sync</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                        {step === 1 ? "Cuéntanos sobre tu negocio" : "Crea tu cuenta"}
                    </div>
                </div>

                {/* Progress */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{
                            flex: 1, height: "3px", borderRadius: "3px",
                            background: s <= step ? "var(--accent)" : "var(--bg4)",
                            transition: "background 0.3s",
                        }} />
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)",
                        borderRadius: "10px", padding: "10px 14px", fontSize: "13px",
                        color: "var(--accent3)", marginBottom: "20px",
                    }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Step 1 — Tipo de negocio */}
                {step === 1 && (
                    <div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={labelStyle}>Nombre de tu negocio *</label>
                            <input
                                type="text"
                                placeholder="Ej: Repostería Dulce, Estampados MX..."
                                value={form.businessName}
                                onChange={e => update("businessName", e.target.value)}
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label style={labelStyle}>¿Qué tipo de negocio tienes? *</label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                {BUSINESS_TYPES.map(({ value, label }) => (
                                    <div
                                        key={value}
                                        onClick={() => update("businessType", value)}
                                        style={{
                                            padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                                            border: form.businessType === value
                                                ? "2px solid var(--accent)"
                                                : "1px solid var(--border)",
                                            background: form.businessType === value
                                                ? "rgba(200,240,96,0.08)"
                                                : "var(--bg3)",
                                            fontSize: "13px", color: "var(--text)",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            style={{
                                width: "100%", padding: "12px",
                                background: "var(--accent)", color: "#0f0f11",
                                border: "none", borderRadius: "10px", fontSize: "14px",
                                fontWeight: 700, cursor: "pointer",
                                fontFamily: "var(--font-head)",
                            }}
                        >
                            Continuar →
                        </button>
                    </div>
                )}

                {/* Step 2 — Cuenta */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={labelStyle}>Email *</label>
                            <input
                                type="email" placeholder="tu@email.com"
                                value={form.email} onChange={e => update("email", e.target.value)}
                                required style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Contraseña *</label>
                            <input
                                type="password" placeholder="Mínimo 6 caracteres"
                                value={form.password} onChange={e => update("password", e.target.value)}
                                required style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Confirmar contraseña *</label>
                            <input
                                type="password" placeholder="Repite tu contraseña"
                                value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)}
                                required style={inputStyle}
                                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                                onBlur={e => e.target.style.borderColor = "var(--border)"}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(""); }}
                                style={{
                                    flex: 1, padding: "12px",
                                    background: "var(--bg3)", color: "var(--text)",
                                    border: "1px solid var(--border)", borderRadius: "10px",
                                    fontSize: "14px", fontWeight: 500, cursor: "pointer",
                                    fontFamily: "var(--font-body)",
                                }}
                            >
                                ← Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 2, padding: "12px",
                                    background: loading ? "var(--bg4)" : "var(--accent)",
                                    color: "#0f0f11", border: "none",
                                    borderRadius: "10px", fontSize: "14px",
                                    fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                                    fontFamily: "var(--font-head)",
                                }}
                            >
                                {loading ? "Creando cuenta..." : "Crear cuenta →"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "var(--muted)" }}>
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
                        Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};