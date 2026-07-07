// Users.jsx - Complete Admin User Management with Floating Icons & Modern Design
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext.jsx';
import ModalPortal from './ModalPortal.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiSearch, FiTrash2, FiUserX, FiUserCheck, FiCheckCircle,
  FiAlertCircle, FiCalendar, FiBriefcase, FiFileText, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiUser, FiLock, FiUnlock,
  FiBarChart2, FiAward, FiTrendingUp, FiTarget, FiCpu,
  FiShield, FiUserPlus, FiXCircle, FiClock, FiSettings
} from 'react-icons/fi';
import { HiOutlineAcademicCap, HiOutlineOfficeBuilding, HiOutlineUserGroup } from 'react-icons/hi';

function Users() {
    const { isDark, theme } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [stats, setStats] = useState(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Get role color
    const getRoleColor = (role) => {
        switch (role) {
            case 'Etudiant': return '#10b981';
            case 'Recruteur': return '#f59e0b';
            case 'admin': return '#6c63ff';
            default: return '#64748b';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Etudiant': return <HiOutlineAcademicCap size={16} />;
            case 'Recruteur': return <HiOutlineOfficeBuilding size={16} />;
            case 'admin': return <FiShield size={16} />;
            default: return <FiUser size={16} />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'Etudiant': return 'Étudiant';
            case 'Recruteur': return 'Recruteur';
            case 'admin': return 'Administrateur';
            default: return role;
        }
    };

    const isLightMode = theme === 'light';
    const roleColor = '#6c63ff';

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            
            const res = await fetch(`https://pfe-backend-five.vercel.app/admin/users?${params}`);
            const data = await res.json();
            
            if (res.ok) {
                setUsers(data.users);
            } else {
                setMessage({ text: data.error || 'Erreur lors du chargement', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Erreur de connexion au serveur', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('https://pfe-backend-five.vercel.app/admin/stats');
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        
        setActionLoading(true);
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/admin/users/${selectedUser._id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: data.message, type: 'success' });
                fetchUsers();
                fetchStats();
                setShowDeleteModal(false);
                setSelectedUser(null);
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: data.error, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Erreur lors de la suppression', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlockUser = async () => {
        if (!selectedUser) return;
        
        setActionLoading(true);
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/admin/users/${selectedUser._id}/block`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: blockReason || 'Aucune raison fournie' })
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: data.message, type: 'success' });
                fetchUsers();
                fetchStats();
                setShowBlockModal(false);
                setSelectedUser(null);
                setBlockReason('');
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: data.error, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Erreur lors du blocage', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblockUser = async (user) => {
        setActionLoading(true);
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/admin/users/${user._id}/unblock`, {
                method: 'PUT'
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: data.message, type: 'success' });
                fetchUsers();
                fetchStats();
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            } else {
                setMessage({ text: data.error, type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Erreur lors du déblocage', type: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / usersPerPage);
    const activeFiltersCount = (searchTerm ? 1 : 0) + (roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

    // Theme styles
    const textPrimary = isDark ? '#fefae0' : '#0f172a';
    const textSecondary = isDark ? 'rgba(254,250,224,0.55)' : '#64748b';
    const cardBg = isDark ? 'rgba(255,255,255,0.06)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
    const inputBorder = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1';
    const modalBg = isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff';
    const modalBorder = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb';
    const overlayBg = isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.4)';

    return (
        <div style={{ color: isDark ? '#fefae0' : '#0f172a' }}>
            {/* Header with Icon */}
            <div style={{ 
                marginBottom: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
            }}>
                <div>
                    <h1 style={{ 
                        color: isDark ? '#fefae0' : '#0f172a', 
                        fontSize: '32px', 
                        marginBottom: '8px',
                        fontWeight: '700',
                        fontFamily: "'Quicksand', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FiUsers style={{ color: '#00A86B' }} /> Gestion des Utilisateurs
                    </h1>
                    <p style={{ 
                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                        fontSize: '16px' 
                    }}>
                        Gérez les comptes utilisateurs, bloquez ou supprimez des comptes problématiques
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => { fetchUsers(); fetchStats(); }}
                        style={{
                            padding: '10px 20px',
                            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                            color: textSecondary,
                            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <FiRefreshCw size={16} /> Rafraîchir
                    </button>
                </div>
            </div>

            {/* Message Toast */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            bottom: '30px',
                            right: '30px',
                            zIndex: 9999,
                            padding: '16px 24px',
                            borderRadius: '12px',
                            background: message.type === 'success' ? '#10b981' : '#ef4444',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            animation: 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        onClick={() => setMessage({ text: '', type: '' })}
                    >
                        {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Cards */}
            {stats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <StatCard 
                        label="Total Utilisateurs" 
                        value={stats.users.total}
                        color="#6c63ff"
                        icon={<FiUsers size={20} />}
                        isDark={isDark}
                    />
                    <StatCard 
                        label="Étudiants" 
                        value={stats.users.students}
                        color="#10b981"
                        icon={<HiOutlineAcademicCap size={20} />}
                        isDark={isDark}
                    />
                    <StatCard 
                        label="Recruteurs" 
                        value={stats.users.recruiters}
                        color="#f59e0b"
                        icon={<HiOutlineOfficeBuilding size={20} />}
                        isDark={isDark}
                    />
                    <StatCard 
                        label="Comptes Bloqués" 
                        value={stats.users.blocked}
                        color="#ef4444"
                        icon={<FiLock size={20} />}
                        isDark={isDark}
                    />
                    <StatCard 
                        label="Candidatures" 
                        value={stats.applications.total}
                        color="#ec4899"
                        icon={<FiFileText size={20} />}
                        isDark={isDark}
                    />
                </div>
            )}

            {/* Search and Filters Bar */}
            <div style={{
                background: cardBg,
                backdropFilter: isDark ? 'blur(10px)' : 'none',
                border: cardBorder,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '25px',
                boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                        <FiSearch size={16} style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8'
                        }} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, prénom ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 40px',
                                borderRadius: '10px',
                                background: inputBg,
                                border: inputBorder,
                                color: isDark ? '#fefae0' : '#1e293b',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = roleColor}
                            onBlur={(e) => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: '12px 15px',
                            borderRadius: '10px',
                            background: inputBg,
                            border: inputBorder,
                            color: isDark ? '#fefae0' : '#1e293b',
                            fontSize: '14px',
                            cursor: 'pointer',
                            minWidth: '140px'
                        }}
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="Etudiant">Étudiants</option>
                        <option value="Recruteur">Recruteurs</option>
                        <option value="admin">Administrateurs</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '12px 15px',
                            borderRadius: '10px',
                            background: inputBg,
                            border: inputBorder,
                            color: isDark ? '#fefae0' : '#1e293b',
                            fontSize: '14px',
                            cursor: 'pointer',
                            minWidth: '140px'
                        }}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="active">Comptes actifs</option>
                        <option value="blocked">Comptes bloqués</option>
                    </select>

                    {activeFiltersCount > 0 && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setRoleFilter('all');
                                setStatusFilter('all');
                            }}
                            style={{
                                padding: '12px 20px',
                                background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                color: textSecondary,
                                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <FiRefreshCw size={16} /> Réinitialiser
                        </button>
                    )}
                </div>

                {activeFiltersCount > 0 && (
                    <div style={{
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: textSecondary, fontSize: '13px' }}>Filtres actifs:</span>
                        {searchTerm && (
                            <span style={{
                                background: `${roleColor}20`,
                                color: roleColor,
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                Recherche: "{searchTerm}"
                                <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: roleColor }}>✕</button>
                            </span>
                        )}
                        {roleFilter !== 'all' && (
                            <span style={{
                                background: 'rgba(16,185,129,0.15)',
                                color: '#10b981',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                Rôle: {getRoleLabel(roleFilter)}
                                <button onClick={() => setRoleFilter('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}>✕</button>
                            </span>
                        )}
                        {statusFilter !== 'all' && (
                            <span style={{
                                background: statusFilter === 'blocked' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                                color: statusFilter === 'blocked' ? '#ef4444' : '#10b981',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                Statut: {statusFilter === 'blocked' ? 'Bloqués' : 'Actifs'}
                                <button onClick={() => setStatusFilter('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: statusFilter === 'blocked' ? '#ef4444' : '#10b981' }}>✕</button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Users Table */}
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px',
                    color: textSecondary
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div className="loading-spinner"></div>
                        <p>Chargement des utilisateurs...</p>
                    </div>
                </div>
            ) : users.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: cardBg,
                    borderRadius: '16px',
                    border: cardBorder
                }}>
                    <FiUsers size={50} style={{ opacity: 0.4, marginBottom: '15px', color: textSecondary }} />
                    <p style={{ color: textSecondary }}>Aucun utilisateur trouvé</p>
                </div>
            ) : (
                <>
                    <div style={{
                        background: cardBg,
                        backdropFilter: isDark ? 'blur(10px)' : 'none',
                        border: cardBorder,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 1.5fr) minmax(180px, 1.5fr) minmax(100px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(160px, 1fr)',
                            gap: '16px',
                            padding: '16px 20px',
                            background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                            borderBottom: cardBorder,
                            fontWeight: '600',
                            color: textSecondary,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            <span>Utilisateur</span>
                            <span>Email</span>
                            <span>Rôle</span>
                            <span>Date inscription</span>
                            <span>Statut</span>
                            <span style={{ textAlign: 'center' }}>Actions</span>
                        </div>

                        {currentUsers.map((user, index) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(180px, 1.5fr) minmax(180px, 1.5fr) minmax(100px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(160px, 1fr)',
                                    gap: '16px',
                                    padding: '16px 20px',
                                    borderBottom: index < users.length - 1 ? cardBorder : 'none',
                                    alignItems: 'center',
                                    transition: 'background 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : '#fafafa';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}cc)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '18px',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.prenom?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ color: textPrimary, fontWeight: '500' }}>
                                            {user.prenom} {user.nom}
                                        </div>
                                        {user.stats && (
                                            <div style={{ color: textSecondary, fontSize: '11px', marginTop: '4px' }}>
                                                {user.role === 'Etudiant' && (
                                                    <span>{user.stats.applicationsCount || 0} candidatures</span>
                                                )}
                                                {user.role === 'Recruteur' && (
                                                    <span>{user.stats.offersCount || 0} offres</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ color: textSecondary, fontSize: '14px' }}>{user.email}</div>
                                <div>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        background: `${getRoleColor(user.role)}20`,
                                        color: getRoleColor(user.role),
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {getRoleIcon(user.role)}
                                        {getRoleLabel(user.role)}
                                    </span>
                                </div>
                                <div style={{ color: textSecondary, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <FiCalendar size={14} /> {formatDate(user.dateCreation)}
                                </div>
                                <div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        background: user.isBlocked 
                                            ? (isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2')
                                            : (isDark ? 'rgba(16,185,129,0.2)' : '#f0fdf4'),
                                        color: user.isBlocked ? '#ef4444' : '#10b981'
                                    }}>
                                        {user.isBlocked ? 'Bloqué' : 'Actif'}
                                    </span>
                                    {user.blockedReason && user.isBlocked && (
                                        <div style={{ fontSize: '10px', color: textSecondary, marginTop: '4px', maxWidth: '150px' }}>
                                            Motif: {user.blockedReason.substring(0, 30)}...
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    {user.role !== 'admin' && (
                                        <>
                                            {user.isBlocked ? (
                                                <button
                                                    onClick={() => handleUnblockUser(user)}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: isDark ? 'rgba(16,185,129,0.2)' : '#f0fdf4',
                                                        color: '#10b981',
                                                        border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid #bbf7d0',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <FiUserCheck size={14} /> Débloquer
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowBlockModal(true);
                                                    }}
                                                    style={{
                                                        padding: '8px 16px',
                                                        background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
                                                        color: '#ef4444',
                                                        border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #fecaca',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.3s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <FiLock size={14} /> Bloquer
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                    color: textSecondary,
                                                    border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.3s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2';
                                                    e.currentTarget.style.color = '#ef4444';
                                                    e.currentTarget.style.borderColor = isDark ? 'rgba(239,68,68,0.3)' : '#fecaca';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                                    e.currentTarget.style.color = textSecondary;
                                                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1';
                                                }}
                                            >
                                                <FiTrash2 size={14} /> Supprimer
                                            </button>
                                        </>
                                    )}
                                    {user.role === 'admin' && (
                                        <span style={{ color: textSecondary, fontSize: '12px', fontStyle: 'italic' }}>
                                            Actions limitées
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '25px',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                    border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                    color: textPrimary,
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentPage !== 1) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <FiChevronLeft size={16} /> Précédent
                            </button>
                            
                            {[...Array(totalPages).keys()].map(number => (
                                <button
                                    key={number + 1}
                                    onClick={() => setCurrentPage(number + 1)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        background: currentPage === number + 1
                                            ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`
                                            : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9'),
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        color: currentPage === number + 1 ? 'white' : textPrimary,
                                        cursor: 'pointer',
                                        fontWeight: currentPage === number + 1 ? 'bold' : 'normal',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (currentPage !== number + 1) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {number + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                    border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                    color: textPrimary,
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Suivant <FiChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal - With ModalPortal */}
            {showDeleteModal && selectedUser && (
                <ModalPortal>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            background: overlayBg,
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: modalBg,
                                border: modalBorder,
                                borderRadius: '20px',
                                width: '100%',
                                maxWidth: '450px',
                                padding: '30px',
                                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 15px',
                                    color: '#ef4444'
                                }}>
                                    <FiTrash2 size={28} />
                                </div>
                                <h3 style={{ color: textPrimary, fontSize: '20px', marginBottom: '10px' }}>
                                    Supprimer l'utilisateur ?
                                </h3>
                                <p style={{ color: textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                                    Êtes-vous sûr de vouloir supprimer <strong>{selectedUser.prenom} {selectedUser.nom}</strong> ?
                                    <br />
                                    Cette action est irréversible et supprimera toutes les données associées.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={actionLoading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        opacity: actionLoading ? 0.7 : 1,
                                        transition: 'all 0.3s',
                                        boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!actionLoading) e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {actionLoading ? 'Suppression...' : 'Confirmer la suppression'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedUser(null);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: textSecondary,
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </ModalPortal>
            )}

            {/* Block Confirmation Modal - With ModalPortal */}
            {showBlockModal && selectedUser && (
                <ModalPortal>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            background: overlayBg,
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}
                        onClick={() => setShowBlockModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: modalBg,
                                border: modalBorder,
                                borderRadius: '20px',
                                width: '100%',
                                maxWidth: '450px',
                                padding: '30px',
                                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 15px',
                                    color: '#ef4444'
                                }}>
                                    <FiLock size={28} />
                                </div>
                                <h3 style={{ color: textPrimary, fontSize: '20px', marginBottom: '10px' }}>
                                    Bloquer l'utilisateur ?
                                </h3>
                                <p style={{ color: textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                                    Êtes-vous sûr de vouloir bloquer <strong>{selectedUser.prenom} {selectedUser.nom}</strong> ?
                                    <br />
                                    Cela suspendra toutes ses activités (offres, candidatures, entretiens).
                                </p>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ color: textSecondary, fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                                    Motif du blocage (optionnel) :
                                </label>
                                <textarea
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Ex: Comportement inapproprié, fausses informations..."
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        background: inputBg,
                                        border: inputBorder,
                                        color: isDark ? '#fefae0' : '#1e293b',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = roleColor}
                                    onBlur={(e) => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleBlockUser}
                                    disabled={actionLoading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        opacity: actionLoading ? 0.7 : 1,
                                        transition: 'all 0.3s',
                                        boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!actionLoading) e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {actionLoading ? 'Blocage...' : 'Confirmer le blocage'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowBlockModal(false);
                                        setSelectedUser(null);
                                        setBlockReason('');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: textSecondary,
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </ModalPortal>
            )}

            <style>{`
                @keyframes floatIcon {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes slideInUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .page-header-icon {
                    animation: floatIcon 3s ease-in-out infinite;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
                    border-top: 4px solid ${roleColor};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                }
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

// Stat Card Component with Floating Icon
const StatCard = ({ label, value, color, icon, isDark }) => (
    <motion.div
        whileHover={{ scale: 1.02, translateY: -3 }}
        style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            transition: 'all 0.3s ease',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `${color}10`,
            opacity: 0.5
        }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: color, fontSize: '24px' }}>{icon}</span>
            <span style={{ 
                fontSize: '28px', 
                fontWeight: 'bold', 
                color: isDark ? '#fefae0' : '#0f172a',
                fontFamily: "'Quicksand', sans-serif"
            }}>{value}</span>
        </div>
        <p style={{ 
            color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
            fontSize: '13px', 
            fontWeight: '500' 
        }}>
            {label}
        </p>
    </motion.div>
);

export default Users;