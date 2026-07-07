// Login.jsx - Complete with Lamp Logo, Animations & Blocked Account Handling (No Language)
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { FiMail, FiLock, FiLogIn, FiArrowRight, FiStar, FiAward } from 'react-icons/fi';

// Lamp Logo Component
const LampLogo = ({ size = 40, color1 = '#6366f1', color2 = '#8b5cf6' }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="75" width="30" height="8" rx="3" fill={`url(#lampGradient)`} />
            <rect x="40" y="70" width="20" height="6" rx="2" fill={`url(#lampGradient)`} />
            <rect x="47" y="35" width="6" height="36" rx="2" fill={`url(#lampGradient)`} />
            <path d="M30 35 L70 35 L65 20 L35 20 L30 35Z" fill={`url(#lampGradient)`} stroke={`url(#lampGradient)`} strokeWidth="1.5"/>
            <path d="M32 35 Q50 42 68 35" stroke={`url(#lampGradient)`} strokeWidth="2" fill="none"/>
            <ellipse cx="50" cy="38" rx="12" ry="8" fill={`url(#glowGradient)`} opacity="0.8"/>
            <path d="M50 46 L50 55" stroke={`url(#glowGradient)`} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
            <path d="M44 44 L38 50" stroke={`url(#glowGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            <path d="M56 44 L62 50" stroke={`url(#glowGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
            <circle cx="50" cy="52" r="2" fill="#fbbf24" opacity="0.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="44" cy="48" r="1.5" fill="#fbbf24" opacity="0.6">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="56" cy="48" r="1.5" fill="#fbbf24" opacity="0.6">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
            </circle>
            <text x="50" y="32" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold" fontFamily="Arial">i</text>
            <defs>
                <linearGradient id="lampGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color1} />
                    <stop offset="100%" stopColor={color2} />
                </linearGradient>
                <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                </linearGradient>
            </defs>
        </svg>
    );
};

function Login() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [blockedInfo, setBlockedInfo] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError("");
        if (blockedInfo) setBlockedInfo(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setError("");
        setBlockedInfo(null);
        setLoading(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const res = await fetch("https://pfe-backend-five.vercel.app/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await res.json();
            
            if (!res.ok) {
                if (res.status === 403 && data.isBlocked) {
                    setBlockedInfo({
                        reason: data.blockedReason || "Non spécifiée",
                        blockedAt: data.blockedAt
                    });
                } else {
                    setError(data.error || "Email ou mot de passe incorrect");
                }
            } else {
                const userData = data.user || data;
                localStorage.setItem('user', JSON.stringify(userData));
                
                if (userData.role === 'Admin') {
                    navigate('/dashboard/admin', { replace: true });
                } else {
                    navigate('/dashboard', { 
                        state: { user: userData },
                        replace: true
                    });
                }
            }
        } catch (err) {
            setError("Impossible de se connecter au serveur");
        } finally {
            setLoading(false);
        }
    };

    const isDarkMode = theme === 'dark';
    const colors = {
        primary: isDarkMode ? '#6366f1' : '#4f46e5',
        secondary: isDarkMode ? '#8b5cf6' : '#7c3aed',
    };

    return (
        <motion.div 
            className="auth-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw', 
                minHeight: '100vh', 
                padding: '40px',
                background: isDarkMode 
    ? '#0f172a' 
    : 'linear-gradient(180deg, #fef9f3 0%, #fdf6ec 50%, #f0f4ff 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background decorations */}
            <motion.div
                style={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    background: isDarkMode 
                        ? 'radial-gradient(circle, rgba(108, 99, 255, 0.08), transparent)' 
                        : 'radial-gradient(circle, rgba(108, 99, 255, 0.06), transparent)',
                    borderRadius: '50%',
                    top: '-200px',
                    right: '-150px',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
                animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                style={{
                    position: 'absolute',
                    width: '400px',
                    height: '400px',
                    background: isDarkMode 
                        ? 'radial-gradient(circle, rgba(168, 125, 247, 0.06), transparent)' 
                        : 'radial-gradient(circle, rgba(168, 125, 247, 0.04), transparent)',
                    borderRadius: '50%',
                    bottom: '-150px',
                    left: '-100px',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
                animate={{ y: [0, -25, 0], scale: [1, 1.03, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="auth-card" style={{
                zIndex: 1,
                width: '100%',
                maxWidth: '440px',
                background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',

                backdropFilter: 'blur(30px)',
                borderRadius: '28px',
                padding: '48px 40px',
border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.1)',
                boxShadow: isDarkMode 
                    ? '0 8px 48px rgba(0, 0, 0, 0.3)' 
                    : '0 8px 48px rgba(139, 126, 116, 0.08)',
            }}>
                {/* Logo Section */}
                <div className="logo-section" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '12px', 
                    marginBottom: '1.5rem',
                    cursor: 'pointer'
                }}
                onClick={() => navigate('/')}>
                    <div style={{
                        transition: 'transform 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(5deg)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0)'}>
                        <LampLogo size={45} color1={colors.primary} color2={colors.secondary} />
                    </div>
                    <h1 className="logo-text" style={{ 
    fontSize: '1.8rem', 
    fontWeight: '700', 
    margin: 0,
    background: 'linear-gradient(135deg, #a5b4fc, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
}}>StageConnect</h1>
                </div>

                <div className="hero-section" style={{ 
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <h2 style={{
                        color: isDarkMode ? '#fefae0' : '#2d2424',
                        fontSize: '20px',
                        fontWeight: '700',
                        margin: '0 0 8px 0',
                        fontFamily: "'Quicksand', sans-serif"
                    }}>
                        Votre carrière, boostée par l'IA.
                    </h2>
                    <p style={{
                        color: isDarkMode ? 'rgba(254, 250, 224, 0.55)' : '#8b7e74',
                        fontSize: '14px',
                        margin: 0,
                        lineHeight: '1.5'
                    }}>
                        Matching intelligent, analyse de CV, entretiens simulés — tout ce dont vous avez besoin pour décrocher le stage de vos rêves.
                    </p>
                </div>

                <div className="divider" style={{
                    height: '1px',
                    background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(139, 126, 116, 0.1)',
                    marginBottom: '24px'
                }}></div>

                <div className="welcome-section" style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <h3 style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'center',
                        color: isDarkMode ? '#fefae0' : '#2d2424',
                        fontSize: '18px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                        fontFamily: "'Quicksand', sans-serif"
                    }}>
                        Bienvenue <FiAward style={{ color: '#f59e0b' }} />
                    </h3>
                    <p style={{
                        color: isDarkMode ? 'rgba(254, 250, 224, 0.55)' : '#8b7e74',
                        fontSize: '14px',
                        margin: 0
                    }}>
                        Connectez-vous pour accéder à votre espace StageConnect.
                    </p>
                </div>

                {/* Blocked Account Message */}
                {blockedInfo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            marginBottom: '24px',
                            padding: '20px',
                            borderRadius: '16px',
                            background: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
                            border: isDarkMode ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '40px' }}>⛔</div>
                        <h3 style={{ color: '#ef4444', fontSize: '18px', marginBottom: '8px', fontWeight: 'bold' }}>
                            Compte Bloqué
                        </h3>
                        <p style={{ color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#7f1d1d', fontSize: '14px', marginBottom: '12px' }}>
                            Votre compte a été bloqué par l'administrateur.
                        </p>
                        <div style={{
                            background: isDarkMode ? 'rgba(0,0,0,0.3)' : '#fff',
                            borderRadius: '12px',
                            padding: '12px',
                            marginTop: '8px'
                        }}>
                            <p style={{ 
                                color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#991b1b', 
                                fontSize: '13px',
                                marginBottom: '8px',
                                fontWeight: '500'
                            }}>
                                Motif du blocage :
                            </p>
                            <p style={{ 
                                color: isDarkMode ? 'rgba(255,255,255,0.9)' : '#b91c1c', 
                                fontSize: '14px',
                                fontStyle: 'italic',
                                marginBottom: '8px'
                            }}>
                                "{blockedInfo.reason}"
                            </p>
                        </div>
                        <p style={{ 
                            color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#7f1d1d', 
                            fontSize: '12px', 
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: isDarkMode ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #fecaca'
                        }}>
                            Pour toute question, veuillez contacter l'administrateur.
                        </p>
                    </motion.div>
                )}

                {!blockedInfo && (
                    <form className="auth-form" onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                    }}>
                        <div className="form-group">
                            <label style={{
                                color: isDarkMode ? 'rgba(254, 250, 224, 0.7)' : '#5c4f45',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Email</label>
                            <div className="input-icon" style={{ position: 'relative' }}>
                                <FiMail className="icon" style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    fontSize: '1.2rem',
                                    color: '#6c63ff',
                                    transition: 'all 0.3s ease',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="exemple@email.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem 1rem 0.9rem 3rem',
                                        background: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 126, 116, 0.03)',
                                        border: focusedField === 'email' 
                                            ? '2px solid #6c63ff' 
                                            : isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.15)',
                                        borderRadius: '1rem',
                                        color: isDarkMode ? '#fefae0' : '#2d2424',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{
                                color: isDarkMode ? 'rgba(254, 250, 224, 0.7)' : '#5c4f45',
                                fontSize: '13px',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Mot de passe</label>
                            <div className="input-icon" style={{ position: 'relative' }}>
                                <FiLock className="icon" style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    fontSize: '1.2rem',
                                    color: '#6c63ff',
                                    transition: 'all 0.3s ease',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} />
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="•••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.9rem 1rem 0.9rem 3rem',
                                        background: isDarkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 126, 116, 0.03)',
                                        border: focusedField === 'password' 
                                            ? '2px solid #6c63ff' 
                                            : isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.15)',
                                        borderRadius: '1rem',
                                        color: isDarkMode ? '#fefae0' : '#2d2424',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                        
                        {error && (
                            <div className="error-message" style={{
                                color: "#FF8E7A",
                                backgroundColor: isDarkMode ? 'rgba(255, 142, 122, 0.08)' : 'rgba(255, 142, 122, 0.06)',
                                padding: "12px 14px",
                                borderRadius: "12px",
                                fontSize: "13px",
                                textAlign: "center",
                                border: isDarkMode ? '1px solid rgba(255, 142, 122, 0.15)' : '1px solid rgba(255, 142, 122, 0.12)',
                                fontWeight: "500"
                            }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        
                        <button type="submit" className="btn-submit" disabled={loading} style={{
                            padding: '15px',
                            borderRadius: '14px',
                            border: 'none',
                            background: loading 
                                ? (isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0') 
                                : 'linear-gradient(135deg, #6c63ff, #4834d4)',
                            color: loading 
                                ? (isDarkMode ? 'rgba(254, 250, 224, 0.3)' : '#94a3b8') 
                                : '#fff',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            letterSpacing: '0.5px',
                            boxShadow: loading ? 'none' : '0 6px 24px rgba(108, 99, 255, 0.3)',
                            marginTop: '4px',
                            fontFamily: "'Quicksand', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            {loading ? "Chargement..." : <>Se connecter <FiLogIn /></>}
                        </button>
                    </form>
                )}

                {!blockedInfo && (
                    <div className="auth-footer" style={{ 
                        marginTop: '24px',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            color: isDarkMode ? 'rgba(254, 250, 224, 0.55)' : '#8b7e74',
                            fontSize: '14px',
                            margin: 0
                        }}>
                            Pas encore de compte ? <Link to="/signup" style={{
    color: '#6c63ff',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
}}>
    Créer un compte <FiArrowRight />
</Link>
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .input-icon input {
                    padding-right: 1rem;
                }
                
                [dir="rtl"] .input-icon .icon {
                    left: auto;
                    right: 1rem;
                }

                [dir="rtl"] .input-icon input {
                    padding: 0.9rem 3rem 0.9rem 1rem;
                }

                .btn-submit svg {
                    margin-left: 0.5rem;
                }

                [dir="rtl"] .btn-submit svg {
                    margin-left: 0;
                    margin-right: 0.5rem;
                    transform: rotate(180deg);
                }

                .auth-footer a svg {
                    margin-left: 0.25rem;
                    vertical-align: middle;
                }

                [dir="rtl"] .auth-footer a svg {
                    margin-left: 0;
                    margin-right: 0.25rem;
                    transform: rotate(180deg);
                }
            `}</style>
        </motion.div>
    );
}

export default Login;