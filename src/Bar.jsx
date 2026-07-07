// Bar.jsx - Clean Sidebar Design with Color Slide Effect
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from './ThemeContext.jsx';
import { 
  FiGrid, FiFileText, FiBriefcase, FiList, FiMessageCircle, 
  FiUser, FiLogOut, FiSun, FiMoon, FiMenu,
  FiShield, FiUsers, FiBarChart2,  FiHome 
} from 'react-icons/fi';
import { 
  HiOutlineDocumentText, HiOutlineClipboardList, 
  HiOutlineUsers, HiOutlineOfficeBuilding, HiOutlineAcademicCap
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getRoleColors = () => {
        const role = user?.role;
        const isLightMode = theme === 'light';
        
        if (role === 'Recruteur') {
            return {
                primary: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                primaryLight: isLightMode ? '#e6491a' : '#ff6b6b',
                primaryDark: '#ee5a24',
                iconColor: '#ff6b6b',
                iconActiveColor: '#ffffff',
                badgeBg: isLightMode ? 'rgba(238, 90, 36, 0.1)' : 'rgba(255, 107, 107, 0.2)',
                badgeColor: isLightMode ? '#e6491a' : '#ff6b6b',
                gradientStart: '#ff6b6b',
                gradientEnd: '#ee5a24',
                hoverBg: isLightMode ? 'rgba(238, 90, 36, 0.06)' : 'rgba(255, 107, 107, 0.08)',
                activeShadow: isLightMode ? '0 4px 12px rgba(238, 90, 36, 0.2)' : '0 4px 12px rgba(255, 107, 107, 0.3)'
            };
        } else if (role === 'Admin' || role === 'admin') {
            return {
                primary: 'linear-gradient(135deg, #10b981, #8b5cf6)',
                primaryLight: isLightMode ? '#059669' : '#10b981',
                primaryDark: '#8b5cf6',
                iconColor: '#10b981',
                iconActiveColor: '#ffffff',
                badgeBg: isLightMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                badgeColor: isLightMode ? '#059669' : '#10b981',
                gradientStart: '#10b981',
                gradientEnd: '#8b5cf6',
                hoverBg: isLightMode ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.08)',
                activeShadow: isLightMode ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(16, 185, 129, 0.3)'
            };
        } else {
            return {
                primary: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                primaryLight: isLightMode ? '#4f46e5' : '#6366f1',
                primaryDark: '#4f46e5',
                iconColor: '#6366f1',
                iconActiveColor: '#ffffff',
                badgeBg: isLightMode ? 'rgba(79, 70, 229, 0.1)' : 'rgba(99, 102, 241, 0.2)',
                badgeColor: isLightMode ? '#4f46e5' : '#818cf8',
                gradientStart: '#6366f1',
                gradientEnd: '#4f46e5',
                hoverBg: isLightMode ? 'rgba(79, 70, 229, 0.06)' : 'rgba(99, 102, 241, 0.08)',
                activeShadow: isLightMode ? '0 4px 12px rgba(79, 70, 229, 0.2)' : '0 4px 12px rgba(99, 102, 241, 0.3)'
            };
        }
    };

    const roleColors = getRoleColors();
    const isLightMode = theme === 'light';
    const displayName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : '';

    const getRoleText = () => {
        if (user?.role === 'Admin' || user?.role === 'admin') return 'Administrateur';
        if (user?.role === 'Recruteur') return 'Recruteur';
        return 'Étudiant';
    };

    const getRoleIconComponent = () => {
        const iconStyle = { color: 'white', fontSize: '24px' };
        if (user?.role === 'Recruteur') {
            return <HiOutlineOfficeBuilding style={iconStyle} />;
        }
        if (user?.role === 'Admin' || user?.role === 'admin') {
            return <FiShield style={{ ...iconStyle, fontSize: '22px' }} />;
        }
        return <HiOutlineAcademicCap style={iconStyle} />;
    };

    // Navigation links
    const studentLinks = [
        { path: '/dashboard', icon: FiGrid, label: 'Tableau de bord' },
        { path: '/dashboard/cvupload', icon: HiOutlineDocumentText, label: 'Mon CV' },
        { path: '/dashboard/offres', icon: FiBriefcase, label: 'Offres' },
        { path: '/dashboard/moffres', icon: HiOutlineClipboardList, label: 'Mes candidatures' },
        { path: '/dashboard/espentretien', icon: FiMessageCircle, label: 'Entretiens' },
         { path: '/dashboard/propositions', icon: FiBarChart2, label: 'Propositions' },
        { path: '/dashboard/profile', icon: FiUser, label: 'Profil' }
    ];

    const recruiterLinks = [
        { path: '/dashboard', icon: FiGrid, label: 'Tableau de bord' },
        { path: '/dashboard/offres', icon: HiOutlineOfficeBuilding, label: 'Mes offres' },
        { path: '/dashboard/candidats', icon: HiOutlineUsers, label: 'Candidats' },
        { path: '/dashboard/entretien-rec', icon: FiMessageCircle, label: 'Entretiens' },
        { path: '/dashboard/propositions', icon: FiBarChart2, label: 'Propositions' },
        { path: '/dashboard/profile', icon: FiUser, label: 'Profil' }
    ];

    const adminLinks = [
    { path: '/dashboard', icon: FiHome, label: 'Tableau de bord' },  // ADDED
    { path: '/dashboard/statistics', icon: FiBarChart2, label: 'Statistiques' },
    { path: '/dashboard/users', icon: FiUsers, label: 'Utilisateurs' },
    { path: '/dashboard/offres', icon: FiBriefcase, label: 'Offres' },
    { path: '/dashboard/profile', icon: FiUser, label: 'Mon Profil' }
];

    let navLinks = [];
    const isAdmin = user?.role === 'Admin' || user?.role === 'admin';
    const isRecruiter = user?.role === 'Recruteur';
    const isStudent = user?.role === 'Etudiant';

    if (isAdmin) navLinks = adminLinks;
    else if (isRecruiter) navLinks = recruiterLinks;
    else if (isStudent) navLinks = studentLinks;

    // Sidebar width variants
    const sidebarVariants = {
        expanded: { 
            width: 260, 
            transition: { type: "spring", stiffness: 300, damping: 25 }
        },
        collapsed: { 
            width: 72, 
            transition: { type: "spring", stiffness: 300, damping: 25 }
        }
    };

    // Animation for nav items
    const navItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }
        })
    };

    const sidebarContent = (
        <motion.nav 
            initial="collapsed"
            animate={isHovering ? "expanded" : "collapsed"}
            variants={sidebarVariants}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                height: '100vh',
                background: isLightMode 
                    ? 'rgba(255, 255, 255, 0.98)' 
                    : 'rgba(15, 23, 42, 0.98)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '24px 12px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: isLightMode 
                    ? '1px solid rgba(0, 0, 0, 0.06)' 
                    : '1px solid rgba(255, 255, 255, 0.06)',
                position: 'sticky',
                top: 0,
                overflow: 'hidden',
                zIndex: 100,
                boxShadow: isLightMode 
                    ? '2px 0 24px rgba(0,0,0,0.04)' 
                    : '2px 0 24px rgba(0,0,0,0.2)'
            }}
        >
            {/* User Profile Section */}
            {user && (
                <motion.div 
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        paddingBottom: '16px',
                        marginBottom: '20px',
                        borderBottom: isLightMode 
                            ? '1px solid rgba(0, 0, 0, 0.06)' 
                            : '1px solid rgba(255, 255, 255, 0.06)',
                        flexDirection: isHovering ? 'row' : 'column',
                        justifyContent: isHovering ? 'flex-start' : 'center',
                        minHeight: '60px'
                    }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        style={{
                            width: '40px',
                            height: '40px',
                            minWidth: '40px',
                            background: roleColors.primary,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'white',
                            boxShadow: `0 4px 12px ${roleColors.primaryLight}40`,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {getRoleIconComponent()}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {isHovering && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{
                                    color: isLightMode ? '#0f172a' : '#fefae0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    fontFamily: "'Quicksand', sans-serif",
                                    whiteSpace: 'nowrap'
                                }}>
                                    {displayName || user.email?.split('@')[0]}
                                </div>
                                <div style={{
                                    display: 'inline-block',
                                    background: roleColors.badgeBg,
                                    color: roleColors.badgeColor,
                                    padding: '2px 10px',
                                    borderRadius: '8px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    textTransform: 'capitalize',
                                    letterSpacing: '0.3px'
                                }}>
                                    {getRoleText()}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Navigation Links */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px',
                flex: 1,
                overflow: 'hidden'
            }}>
                {navLinks.map((link, index) => {
                    const isLinkActive = isActive(link.path);
                    const Icon = link.icon;

                    return (
                        <motion.div
                            key={link.path}
                            custom={index}
                            variants={navItemVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Link 
                                to={link.path}
                                onClick={() => setIsMobileOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    fontFamily: "'Quicksand', sans-serif",
                                    fontWeight: isLinkActive ? '600' : '500',
                                    color: isLinkActive 
                                        ? roleColors.badgeColor
                                        : isLightMode 
                                            ? 'rgba(0,0,0,0.6)' 
                                            : 'rgba(255,255,255,0.6)',
                                    background: isLinkActive 
                                        ? `${roleColors.badgeColor}15`
                                        : 'transparent',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap',
                                    position: 'relative',
                                    justifyContent: isHovering ? 'flex-start' : 'center',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLinkActive) {
                                        e.currentTarget.style.background = roleColors.hoverBg;
                                        e.currentTarget.style.color = isLightMode ? '#0f172a' : '#ffffff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isLinkActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = isLightMode 
                                            ? 'rgba(0,0,0,0.6)' 
                                            : 'rgba(255,255,255,0.6)';
                                    }
                                }}
                            >
                                {/* Color Slide Effect Background */}
                                {isLinkActive && (
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(90deg, ${roleColors.badgeColor}20, ${roleColors.badgeColor}05)`,
                                            borderRadius: '8px',
                                            zIndex: 0
                                        }}
                                    />
                                )}

                                <Icon 
                                    size={20} 
                                    style={{ 
                                        minWidth: '20px',
                                        flexShrink: 0,
                                        color: isLinkActive ? roleColors.badgeColor : undefined,
                                        position: 'relative',
                                        zIndex: 1
                                    }} 
                                />

                                <AnimatePresence>
                                    {isHovering && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                                position: 'relative',
                                                zIndex: 1
                                            }}
                                        >
                                            {link.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                               
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom Section - Theme Toggle & Logout */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '2px',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: isLightMode 
                    ? '1px solid rgba(0, 0, 0, 0.06)' 
                    : '1px solid rgba(255, 255, 255, 0.06)'
            }}>
                {/* Theme Toggle */}
                <motion.button 
                    onClick={toggleTheme}
                    whileHover={isHovering ? { scale: 1.02 } : {}}
                    whileTap={isHovering ? { scale: 0.95 } : {}}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '14px',
                        fontWeight: '500',
                        background: 'transparent',
                        color: isLightMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
                        justifyContent: isHovering ? 'flex-start' : 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = roleColors.hoverBg;
                        e.currentTarget.style.color = isLightMode ? '#0f172a' : '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = isLightMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
                    }}
                >
                    {isLightMode ? <FiMoon size={20} /> : <FiSun size={20} />}
                    
                    <AnimatePresence>
                        {isHovering && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                            >
                                {isLightMode ? 'Mode sombre' : 'Mode clair'}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Logout Button */}
                <motion.button 
                    onClick={handleLogout}
                    whileHover={isHovering ? { scale: 1.02 } : {}}
                    whileTap={isHovering ? { scale: 0.95 } : {}}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontFamily: "'Quicksand', sans-serif",
                        fontSize: '14px',
                        fontWeight: '500',
                        background: 'transparent',
                        color: '#ef4444',
                        justifyContent: isHovering ? 'flex-start' : 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = isLightMode 
                            ? 'rgba(239, 68, 68, 0.06)'
                            : 'rgba(239, 68, 68, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <FiLogOut size={20} style={{ minWidth: '20px', flexShrink: 0 }} />
                    
                    <AnimatePresence>
                        {isHovering && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                            >
                                Déconnexion
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </motion.nav>
    );

    // Mobile toggle button
    const mobileToggle = (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 200,
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: roleColors.primary,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'none',
                boxShadow: `0 8px 32px ${roleColors.primaryLight}40`,
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
        >
            <motion.div
                animate={{ rotate: isMobileOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                <FiMenu size={24} />
            </motion.div>
        </motion.button>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="sidebar-desktop" style={{ display: 'flex' }}>
                {sidebarContent}
            </div>
            
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 149
                            }}
                        />
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                zIndex: 150,
                                width: 280
                            }}
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            
            {mobileToggle}
            
            <style>{`
                @media (max-width: 768px) {
                    .sidebar-desktop { display: none !important; }
                }
            `}</style>
        </>
    );
}

export default Sidebar;