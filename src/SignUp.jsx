// SignUp.jsx - Complete with Lamp Logo, Floating Icons (No Language)
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext.jsx';
import { 
  FiMail, FiLock, FiUser, FiUserPlus, FiCheck, FiArrowRight, 
  FiAlertCircle
} from 'react-icons/fi';
import { HiOutlineAcademicCap, HiOutlineOfficeBuilding } from 'react-icons/hi';

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

function SignUp() {
    const navigate = useNavigate();
    const { isDark, theme } = useTheme();
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");
    const [form, setForm] = useState({
        prenom: "",
        nom: "",
        email: "",
        password: "",
        role: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
        setError("");
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setForm({
            ...form,
            role: role
        });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        if (form.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        if (!form.role) {
            setError("Veuillez sélectionner un rôle");
            return;
        }

        setLoading(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const res = await fetch("https://pfe-backend-five.vercel.app/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard', { 
                    state: { user: data.user },
                    replace: true 
                });
            } else {
                setError(data.error || "Erreur lors de la création du compte");
            }
        } catch (err) {
            console.error("Signup error:", err);
            if (err.name === 'AbortError') {
                setError("Le serveur ne répond pas. Vérifiez que le backend est démarré.");
            } else {
                setError("Impossible de se connecter au serveur");
            }
        } finally {
            setLoading(false);
        }
    };

    const isLightMode = theme === 'light';
    const colors = {
        primary: isDark ? '#6366f1' : '#4f46e5',
        secondary: isDark ? '#8b5cf6' : '#7c3aed',
    };

    const textPrimary = isDark ? '#fefae0' : '#2d2424';
    const textSecondary = isDark ? 'rgba(254, 250, 224, 0.55)' : '#8b7e74';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <motion.div
            style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw', 
                minHeight: '100vh', 
                padding: '40px',
                background: isDark 
    ? '#0f172a' 
    : 'linear-gradient(180deg, #fef9f3 0%, #fdf6ec 50%, #f0f4ff 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Background decorations */}
            <motion.div
                style={{
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    background: isDark 
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
                    background: isDark 
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

            {/* SignUp Card */}
            <motion.div
                className="auth-card"
                style={{
                    zIndex: 1,
                    width: '100%',
                    maxWidth: '500px',
                    background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '28px',
                    padding: '40px',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.1)',

                    boxShadow: isDark 
                        ? '0 8px 48px rgba(0, 0, 0, 0.3)' 
                        : '0 8px 48px rgba(139, 126, 116, 0.08)',
                }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Logo Section */}
                <motion.div 
                    variants={itemVariants}
                    className="logo-section" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '12px', 
                        marginBottom: '1.5rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                >
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
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className="hero-section" 
                    style={{ 
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}
                >
                    <h2 style={{
                        color: textPrimary,
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: '0 0 8px 0',
                        fontFamily: "'Quicksand', sans-serif"
                    }}>
                        Votre carrière, boostée par l'IA.
                    </h2>
                    <p style={{
                        color: textSecondary,
                        fontSize: '14px',
                        margin: 0,
                        lineHeight: '1.5'
                    }}>
                        Matching intelligent, analyse de CV, entretiens simulés — tout ce dont vous avez besoin pour décrocher le stage de vos rêves.
                    </p>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className="divider" 
                    style={{
                        height: '1px',
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(139, 126, 116, 0.1)',
                        marginBottom: '20px'
                    }}
                />

                <motion.div 
                    variants={itemVariants}
                    className="signup-header" 
                    style={{
                        textAlign: 'center',
                        marginBottom: '20px'
                    }}
                >
                    <h3 style={{
                        color: textPrimary,
                        fontSize: '20px',
                        fontWeight: '600',
                        margin: '0 0 4px 0',
                        fontFamily: "'Quicksand', sans-serif"
                    }}>
                        Créer un compte
                    </h3>
                    <p style={{
                        color: textSecondary,
                        fontSize: '14px',
                        margin: 0
                    }}>
                        Rejoignez StageConnect et trouvez votre stage idéal.
                    </p>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className="role-selector" 
                    style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '20px'
                    }}
                >
                    <button 
                        type="button" 
                        className={`role-btn ${selectedRole === 'Etudiant' ? 'active' : ''}`} 
                        onClick={() => handleRoleSelect('Etudiant')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            border: selectedRole === 'Etudiant' 
                                ? `2px solid ${colors.primary}` 
                                : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139,126,116,0.15)',
                            background: selectedRole === 'Etudiant' 
                                ? `${colors.primary}20` 
                                : 'transparent',
                            color: selectedRole === 'Etudiant' 
                                ? colors.primary 
                                : textSecondary,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: selectedRole === 'Etudiant' ? '600' : '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Quicksand', sans-serif"
                        }}
                    >
                        <HiOutlineAcademicCap size={20} /> Étudiant
                    </button>
                    <button 
                        type="button" 
                        className={`role-btn ${selectedRole === 'Recruteur' ? 'active' : ''}`} 
                        onClick={() => handleRoleSelect('Recruteur')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '12px',
                            border: selectedRole === 'Recruteur' 
                                ? `2px solid ${colors.primary}` 
                                : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139,126,116,0.15)',
                            background: selectedRole === 'Recruteur' 
                                ? `${colors.primary}20` 
                                : 'transparent',
                            color: selectedRole === 'Recruteur' 
                                ? colors.primary 
                                : textSecondary,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: selectedRole === 'Recruteur' ? '600' : '500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Quicksand', sans-serif"
                        }}
                    >
                        <HiOutlineOfficeBuilding size={20} /> Recruteur
                    </button>
                </motion.div>

                <form className="auth-form" onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                }}>
                    <motion.div 
                        variants={itemVariants}
                        className="form-row" 
                        style={{ display: 'flex', gap: '12px' }}
                    >
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{
                                color: isDark ? 'rgba(254, 250, 224, 0.7)' : '#5c4f45',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiUser style={{ display: 'inline', marginRight: '6px' }} /> Prénom
                            </label>
                            <input 
                                type="text" 
                                name="prenom" 
                                value={form.prenom} 
                                onChange={handleChange}
                                onFocus={() => setFocusedField('prenom')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Jean"
                                required 
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '14px',
                                    border: focusedField === 'prenom' 
                                        ? '2px solid #6c63ff' 
                                        : isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.15)',
                                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 126, 116, 0.03)',
                                    color: textPrimary,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{
                                color: isDark ? 'rgba(254, 250, 224, 0.7)' : '#5c4f45',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiUser style={{ display: 'inline', marginRight: '6px' }} /> Nom
                            </label>
                            <input 
                                type="text" 
                                name="nom" 
                                value={form.nom} 
                                onChange={handleChange}
                                onFocus={() => setFocusedField('nom')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Dupont"
                                required 
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '14px',
                                    border: focusedField === 'nom' 
                                        ? '2px solid #6c63ff' 
                                        : isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.15)',
                                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 126, 116, 0.03)',
                                    color: textPrimary,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="form-group">
                        <label style={{
                            color: isDark ? 'rgba(254, 250, 224, 0.7)' : '#5c4f45',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'block',
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <FiMail style={{ display: 'inline', marginRight: '6px' }} /> Email
                        </label>
                        <div className="input-icon" style={{ position: 'relative' }}>
                            <input 
                                type="email" 
                                name="email" 
                                value={form.email} 
                                onChange={handleChange}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="exemple@email.com"
                                required 
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '14px',
                                    border: focusedField === 'email' 
                                        ? '2px solid #6c63ff' 
                                        : isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.15)',
                                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 126, 116, 0.03)',
                                    color: textPrimary,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box',
                                    outline: 'none'
                                }}
                            />
                            {form.email && (
                                <FiCheck style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#7ED9A0'
                                }} />
                            )}
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{
                                color: isDark ? 'rgba(254, 250, 224, 0.7)' : '#5c4f45',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiLock style={{ display: 'inline', marginRight: '6px' }} /> Mot de passe
                            </label>
                            <div className="input-icon" style={{ position: 'relative' }}>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={form.password} 
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="*********"
                                    required 
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '14px',
                                        border: focusedField === 'password' 
                                            ? '2px solid #6c63ff' 
                                            : isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.15)',
                                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 126, 116, 0.03)',
                                        color: textPrimary,
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.3s ease',
                                        boxSizing: 'border-box',
                                        outline: 'none'
                                    }}
                                />
                                {form.password && form.password.length >= 6 && (
                                    <FiCheck style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#7ED9A0'
                                    }} />
                                )}
                            </div>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{
                                color: isDark ? 'rgba(254, 250, 224, 0.7)' : '#5c4f45',
                                fontSize: '12px',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiCheck style={{ display: 'inline', marginRight: '6px' }} /> Confirmer
                            </label>
                            <div className="input-icon" style={{ position: 'relative' }}>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setError("");
                                    }}
                                    onFocus={() => setFocusedField('confirm')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="*********"
                                    required 
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: '14px',
                                        border: focusedField === 'confirm' 
                                            ? '2px solid #6c63ff' 
                                            : isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(139, 126, 116, 0.15)',
                                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(139, 126, 116, 0.03)',
                                        color: textPrimary,
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.3s ease',
                                        boxSizing: 'border-box',
                                        outline: 'none'
                                    }}
                                />
                                {confirmPassword && confirmPassword === form.password && (
                                    <FiCheck style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#7ED9A0'
                                    }} />
                                )}
                            </div>
                        </div>
                    </motion.div>
                    
                    {error && (
                        <motion.div 
                            variants={itemVariants}
                            className="error-message" 
                            style={{
                                color: "#FF8E7A",
                                backgroundColor: isDark ? 'rgba(255, 142, 122, 0.08)' : 'rgba(255, 142, 122, 0.06)',
                                padding: "12px 14px",
                                borderRadius: "12px",
                                fontSize: "13px",
                                textAlign: "center",
                                border: isDark ? '1px solid rgba(255, 142, 122, 0.15)' : '1px solid rgba(255, 142, 122, 0.12)',
                                fontWeight: "500",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <FiAlertCircle /> {error}
                        </motion.div>
                    )}
                    
                    <motion.button 
                        variants={itemVariants}
                        type="submit" 
                        className="btn-submit" 
                        disabled={loading}
                        style={{
                            padding: '15px',
                            borderRadius: '14px',
                            border: 'none',
                            background: loading 
                                ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0') 
                                : 'linear-gradient(135deg, #6c63ff, #4834d4)',
                            color: loading 
                                ? (isDark ? 'rgba(254, 250, 224, 0.3)' : '#94a3b8') 
                                : '#fff',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            letterSpacing: '0.5px',
                            boxShadow: loading ? 'none' : '0 6px 24px rgba(108, 99, 255, 0.3)',
                            marginTop: '6px',
                            fontFamily: "'Quicksand', sans-serif",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 32px rgba(108, 99, 255, 0.45)' } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                        {loading ? "Chargement..." : <>Créer mon compte <FiUserPlus /></>}
                    </motion.button>
                </form>

                <motion.div 
                    variants={itemVariants}
                    className="auth-footer" 
                    style={{ 
                        marginTop: '20px',
                        textAlign: 'center'
                    }}
                >
                    <p style={{
                        color: textSecondary,
                        fontSize: '14px',
                        margin: 0
                    }}>
                        Déjà un compte ? <Link to="/login" style={{
                            color: '#6c63ff',
                            textDecoration: 'none',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            Se connecter <FiArrowRight />
                        </Link>
                    </p>
                </motion.div>
            </motion.div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

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

                .role-btn:hover {
                    transform: translateY(-2px);
                }

                .role-btn:active {
                    transform: translateY(0);
                }
            `}</style>
        </motion.div>
    );
}

export default SignUp;