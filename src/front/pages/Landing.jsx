import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export const Landing = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        if (!heroRef.current) return;
        const els = heroRef.current.querySelectorAll(".fade-up");
        els.forEach((el, i) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(24px)";
            setTimeout(() => {
                el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            }, i * 120);
        });
    }, []);

    const features = [
        { icon: "📦", title: "Inventario en tiempo real", desc: "Controla tu stock de ingredientes o materiales. Alertas automáticas cuando el stock baja del mínimo." },
        { icon: "🧾", title: "Gestión de pedidos", desc: "Registra y sigue cada pedido desde que entra hasta que se entrega. Vista Kanban o tabla." },
        { icon: "💰", title: "Costos y márgenes", desc: "Calcula automáticamente el costo real de cada producto y su margen de ganancia." },
        { icon: "👥", title: "Base de clientes", desc: "Historial de pedidos por cliente, datos de contacto y notas personalizadas." },
        { icon: "📊", title: "Analíticas", desc: "Productos más vendidos, ingresos, ganancias netas y ticket promedio en un solo lugar." },
        { icon: "🏪", title: "Para cualquier negocio", desc: "Cocinas oscuras, artesanías, estampados, catering, repostería — un solo sistema para todos." },
    ];

    const plans = [
        {
            name: "Gratis",
            price: "0",
            desc: "Para empezar y validar",
            features: ["Hasta 30 productos", "50 pedidos/mes", "100 clientes", "1 usuario", "Página pública con QR"],
            cta: "Empezar gratis",
            highlight: false,
        },
        {
            name: "Pro",
            price: "19",
            desc: "Para negocios en crecimiento",
            features: ["Productos ilimitados", "Pedidos ilimitados", "Clientes ilimitados", "Hasta 5 usuarios con roles", "Analíticas avanzadas", "Soporte prioritario"],
            cta: "Empezar Pro",
            highlight: true,
        },
    ];

    return (
        <div style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", minHeight: "100vh" }}>

            {/* Navbar */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: "rgba(15,15,17,0.85)", backdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--border)",
                padding: "0 40px", height: "60px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "30px", height: "30px", background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f0f11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "17px", letterSpacing: "-0.4px" }}>
                        Chef<span style={{ color: "var(--accent)" }}>sync</span>
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Link to="/login" style={{
                        color: "var(--text)",
                        fontSize: "13px", fontWeight: 600,
                        textDecoration: "none", fontFamily: "var(--font-head)",
                        padding: "7px 14px"
                    }}>
                        Iniciar sesión
                    </Link>
                    <Link to="/signup" style={{
                        background: "var(--accent)", color: "#0f0f11",
                        padding: "7px 18px", borderRadius: "8px",
                        fontSize: "13px", fontWeight: 700,
                        textDecoration: "none", fontFamily: "var(--font-head)",
                        transition: "background 0.15s",
                    }}>
                        Empezar gratis →
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section ref={heroRef} style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                textAlign: "center", padding: "120px 24px 80px",
                background: "radial-gradient(ellipse at 50% 0%, rgba(200,240,96,0.08) 0%, transparent 60%)",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{ maxWidth: "720px" }}>
                    <div className="fade-up" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        background: "rgba(200,240,96,0.1)", border: "1px solid rgba(200,240,96,0.2)",
                        borderRadius: "20px", padding: "5px 14px", fontSize: "12px",
                        color: "var(--accent)", fontWeight: 500, marginBottom: "24px",
                    }}>
                        ✦ Para cocinas, artesanos y emprendedores
                    </div>

                    <h1 className="fade-up" style={{
                        fontFamily: "var(--font-head)", fontSize: "clamp(38px, 6vw, 72px)",
                        fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.05,
                        margin: "0 0 24px", color: "var(--text)",
                    }}>
                        Opera tu negocio<br/>
                        <span style={{ color: "var(--accent)" }}>sin complicaciones</span>
                    </h1>

                    <p className="fade-up" style={{
                        fontSize: "17px", color: "var(--muted)", lineHeight: 1.7,
                        margin: "0 0 40px", maxWidth: "520px", marginLeft: "auto", marginRight: "auto",
                    }}>
                        Chefsync centraliza tu inventario, pedidos, clientes y finanzas en un solo lugar. Diseñado para dark kitchens, artesanos, caterings y cualquier microemprendimiento.
                    </p>

                    <div className="fade-up" style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link to="/signup" style={{
                            background: "var(--accent)", color: "#0f0f11",
                            padding: "13px 28px", borderRadius: "10px",
                            fontSize: "15px", fontWeight: 700,
                            textDecoration: "none", fontFamily: "var(--font-head)",
                        }}>
                            Empezar gratis →
                        </Link>
                        <Link to="/login" style={{
                            background: "var(--bg2)", color: "var(--text)",
                            border: "1px solid var(--border)",
                            padding: "13px 28px", borderRadius: "10px",
                            fontSize: "15px", fontWeight: 500,
                            textDecoration: "none",
                        }}>
                            Ver demo
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="fade-up" style={{ display: "flex", gap: "32px", justifyContent: "center", marginTop: "64px", flexWrap: "wrap" }}>
                        {[["100%", "Gratis para empezar"], ["∞", "Tipos de negocio"], ["1", "Solo lugar para todo"]].map(([val, label]) => (
                            <div key={label} style={{ textAlign: "center" }}>
                                <div style={{ fontFamily: "var(--font-head)", fontSize: "28px", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.5px" }}>{val}</div>
                                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: "80px 24px", background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 12px" }}>
                            Todo lo que necesitas
                        </h2>
                        <p style={{ color: "var(--muted)", fontSize: "15px" }}>Sin apps separadas, sin hojas de cálculo, sin caos.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                        {features.map(({ icon, title, desc }) => (
                            <div key={title} style={{
                                background: "var(--bg3)", border: "1px solid var(--border)",
                                borderRadius: "14px", padding: "24px",
                                transition: "border-color 0.2s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border2)"}
                                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                            >
                                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{icon}</div>
                                <div style={{ fontFamily: "var(--font-head)", fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>{title}</div>
                                <div style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section style={{ padding: "80px 24px" }}>
                <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "48px" }}>
                        <h2 style={{ fontFamily: "var(--font-head)", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.8px", margin: "0 0 12px" }}>
                            Precios simples
                        </h2>
                        <p style={{ color: "var(--muted)", fontSize: "15px" }}>Empieza gratis, crece cuando lo necesites.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                        {plans.map(({ name, price, desc, features, cta, highlight }) => (
                            <div key={name} style={{
                                background: highlight ? "var(--bg2)" : "var(--bg2)",
                                border: highlight ? "2px solid var(--accent)" : "1px solid var(--border)",
                                borderRadius: "16px", padding: "28px",
                                position: "relative",
                            }}>
                                {highlight && (
                                    <div style={{
                                        position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                                        background: "var(--accent)", color: "#0f0f11",
                                        fontSize: "11px", fontWeight: 700, padding: "3px 12px", borderRadius: "20px",
                                        fontFamily: "var(--font-head)",
                                    }}>Recomendado</div>
                                )}
                                <div style={{ fontFamily: "var(--font-head)", fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{name}</div>
                                <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>{desc}</div>
                                <div style={{ fontFamily: "var(--font-head)", fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "20px" }}>
                                    €{price}<span style={{ fontSize: "14px", fontWeight: 400, color: "var(--muted)" }}>/mes</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                                    {features.map(f => (
                                        <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                                            <span style={{ color: "var(--accent)", fontWeight: 700 }}>✓</span>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <Link to="/signup" style={{
                                    display: "block", textAlign: "center",
                                    background: highlight ? "var(--accent)" : "var(--bg3)",
                                    color: highlight ? "#0f0f11" : "var(--text)",
                                    border: highlight ? "none" : "1px solid var(--border)",
                                    padding: "11px", borderRadius: "9px",
                                    fontSize: "14px", fontWeight: 700,
                                    textDecoration: "none", fontFamily: "var(--font-head)",
                                }}>
                                    {cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ width: "24px", height: "24px", background: "var(--accent)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f0f11" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                        </svg>
                    </div>
                    <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "15px" }}>
                        Chef<span style={{ color: "var(--accent)" }}>sync</span>
                    </span>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "12px", margin: 0 }}>
                    © 2026 Chefsync · Gestión operativa para microemprendimientos
                </p>
            </footer>

        </div>
    );
};