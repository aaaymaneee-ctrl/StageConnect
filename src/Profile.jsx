// Profile.jsx - Complete with Floating Icons & Advanced Features
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext.jsx';
import ModalPortal from './ModalPortal.jsx';
import { 
  FiUser, FiMail, FiCalendar, FiBriefcase, FiUsers,
  FiEdit2, FiLock, FiLogOut, FiUpload, FiFileText,
  FiEye, FiCheckCircle, FiAward, FiTrendingUp, FiStar,
  FiSettings, FiSave, FiX, FiUserCheck, FiBarChart2,
  FiInfo, FiAlertCircle, FiXCircle, FiShield
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineDocumentText, HiOutlineUserGroup } from 'react-icons/hi';

function Profile() {
    const navigate = useNavigate();
    const { isDark, theme } = useTheme();
    const [user, setUser] = useState(null);
    const [cvInfo, setCvInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accountInfo, setAccountInfo] = useState(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [editForm, setEditForm] = useState({ prenom: '', nom: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [recruiterStats, setRecruiterStats] = useState({
        activeJobs: 0,
        totalCandidates: 0
    });

    // Get role-based color
    const getRoleColor = () => {
        const role = user?.role;
        if (role === 'Recruteur') return '#ff6b6b';
        if (role === 'Admin' || role === 'admin') return '#10b981';
        return '#6366f1';
    };
    const roleColor = getRoleColor();
    const isLightMode = theme === 'light';
    const isAdmin = user?.role === 'admin' || user?.role === 'Admin';

    const fetchRecruiterStats = async (recruiterId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/recruteur/${recruiterId}`);
            const offres = await res.json();
            
            const activeOffres = offres.filter(o => o.statut === 'active').length;
            
            let totalCandidates = 0;
            offres.forEach(offre => {
                totalCandidates += offre.candidatures?.length || 0;
            });
            
            setRecruiterStats({
                activeJobs: activeOffres,
                totalCandidates: totalCandidates
            });
            
        } catch (err) {
            console.error("Error fetching recruiter stats:", err);
        }
    };

    const fetchUserInfo = async (userId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users/${userId}`);
            const userData = await res.json();
            setAccountInfo(userData);
            return userData;
        } catch (err) {
            console.error("Error fetching user info:", err);
        }
    };

    const fetchCVInfo = async (userId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users`);
            if (!res.ok) {
                console.error("Failed to fetch users:", res.status);
                return;
            }
            const users = await res.json();
            const currentUser = users.find(u => u._id === userId);
            
            if (currentUser && currentUser.cv && currentUser.cv.filename) {
                setCvInfo(currentUser.cv);
            } else {
                setCvInfo(null);
            }
        } catch (err) {
            console.error("Error fetching CV:", err);
            setCvInfo(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                fetchUserInfo(parsedUser.id);
                
                if (parsedUser.role === 'Etudiant') {
                    fetchCVInfo(parsedUser.id);
                } else if (parsedUser.role === 'Recruteur') {
                    fetchRecruiterStats(parsedUser.id);
                    setLoading(false);
                } else if (parsedUser.role === 'admin' || parsedUser.role === 'Admin') {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error parsing user data:", err);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const handleViewCV = () => {
        if (user && user.id) {
            window.open(`https://pfe-backend-five.vercel.app/users/${user.id}/cv`, '_blank');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleEditProfile = () => {
        setEditForm({ prenom: user.prenom, nom: user.nom });
        setShowEditProfile(true);
    };

    const handleSaveProfile = async () => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prenom: editForm.prenom, nom: editForm.nom })
            });
            const data = await res.json();
            
            if (res.ok) {
                const updatedUser = { ...user, prenom: editForm.prenom, nom: editForm.nom };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setShowEditProfile(false);
                setMessage('✅ Profile mis à jour avec succès!');
                setMessageType('success');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setMessage('❌ Erreur lors de la mise à jour du profil');
            setMessageType('error');
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage('❌ Les mots de passe ne correspondent pas');
            setMessageType('error');
            return;
        }
        
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users/${user.id}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    currentPassword: passwordForm.currentPassword, 
                    newPassword: passwordForm.newPassword 
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                setShowChangePassword(false);
                setMessage('✅ Mot de passe changé avec succès!');
                setMessageType('success');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(`❌ ${data.error}`);
                setMessageType('error');
            }
        } catch (err) {
            setMessage('❌ Erreur lors du changement de mot de passe');
            setMessageType('error');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', padding: '40px' }}>
                <div style={{
                    textAlign: 'center', padding: '48px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    borderRadius: '20px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    maxWidth: '440px', width: '100%'
                }}>
                    <FiLock size={50} style={{ color: '#ef4444', marginBottom: '20px' }} />
                    <h2 style={{ color: isDark ? '#fefae0' : '#0f172a' }}>Accès Restreint</h2>
                    <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', marginBottom: '24px' }}>
                        Veuillez vous connecter pour voir votre profil.
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '12px 30px',
                            background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    const isStudent = user.role === 'Etudiant';
    const isRecruiter = user.role === 'Recruteur';

    return (
        <div style={{ color: isDark ? '#fefae0' : '#0f172a' }}>
            {/* Header with Icon */}
            <div style={{ 
                marginBottom: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                flexWrap: 'wrap'
            }}>
                <div>
                    <h1 style={{ 
                        color: isDark ? '#fefae0' : '#0f172a', 
                        fontSize: '32px', 
                        marginBottom: '10px', 
                        fontWeight: '700',
                        fontFamily: "'Quicksand', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        {isAdmin ? (
                            <><FiShield style={{ color: '#10b981' }} /> Mon Profil Admin</>
                        ) : isRecruiter ? (
                            <><FiUser style={{ color: '#ff6b6b' }} /> Mon Profil Recruteur</>
                        ) : (
                            <><FiUser style={{ color: '#6366f1' }} /> Mon Profil</>
                        )}
                    </h1>
                    <p style={{ 
                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                        fontSize: '16px' 
                    }}>
                        {isAdmin ? 'Gérez votre compte administrateur' :
                         isRecruiter ? 'Gérez vos offres et candidats' :
                         'Gérez votre compte et vos paramètres'}
                    </p>
                </div>
            </div>

            {/* Message Toast */}
            {message && (
                <div 
                    onClick={() => setMessage("")}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: '30px',
                        zIndex: 9999,
                        animation: 'slideInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                >
                    <div style={{
                        padding: '16px 24px',
                        background: messageType === 'success' ? '#10b981' : 
                                   messageType === 'error' ? '#ef4444' : '#6c63ff',
                        color: 'white',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: '500',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        cursor: 'pointer'
                    }}>
                        {messageType === 'success' ? <FiCheckCircle size={20} /> : 
                         messageType === 'error' ? <FiXCircle size={20} /> : <FiInfo size={20} />}
                        {message}
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                {/* Left Column - User Info */}
                <div style={{
                    flex: '1',
                    minWidth: '300px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '30px',
                    boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: isAdmin 
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : isRecruiter 
                                ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)'
                                : `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: 'white',
                            boxShadow: `0 4px 16px ${roleColor}40`
                        }}>
                            {user.prenom?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 style={{ 
                                color: isDark ? '#fefae0' : '#0f172a', 
                                fontSize: '24px', 
                                marginBottom: '5px' 
                            }}>
                                {user.prenom} {user.nom}
                            </h2>
                            <span style={{
                                display: 'inline-block',
                                background: isAdmin
                                    ? (isDark ? 'rgba(16,185,129,0.2)' : '#dcfce7')
                                    : isRecruiter 
                                    ? (isDark ? 'rgba(255,107,107,0.2)' : '#fee2e2')
                                    : (isDark ? 'rgba(108,99,255,0.2)' : '#eef2ff'),
                                color: isAdmin ? '#10b981' : isRecruiter ? '#ff6b6b' : '#6366f1',
                                padding: '5px 15px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                {user.role === 'Etudiant' ? 'Étudiant' : 
                                 user.role === 'Recruteur' ? 'Recruteur' : 'Administrateur'}
                            </span>
                        </div>
                    </div>

                    <div style={{ 
                        borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        paddingTop: '20px'
                    }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                fontSize: '12px',
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiMail style={{ display: 'inline', marginRight: '6px' }} /> EMAIL
                            </label>
                            <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '16px' }}>
                                {user.email}
                            </p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                fontSize: '12px',
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiUser style={{ display: 'inline', marginRight: '6px' }} /> PRÉNOM
                            </label>
                            <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '16px' }}>
                                {user.prenom}
                            </p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                fontSize: '12px',
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiUser style={{ display: 'inline', marginRight: '6px' }} /> NOM
                            </label>
                            <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '16px' }}>
                                {user.nom}
                            </p>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ 
                                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                fontSize: '12px',
                                display: 'block',
                                marginBottom: '5px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                <FiBriefcase style={{ display: 'inline', marginRight: '6px' }} /> TYPE DE COMPTE
                            </label>
                            <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '16px', textTransform: 'capitalize' }}>
                                {user.role === 'Etudiant' ? 'Étudiant' : 
                                 user.role === 'Recruteur' ? 'Recruteur' : 'Administrateur'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - CV or Company Info */}
                <div style={{
                    flex: '1',
                    minWidth: '300px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '30px',
                    boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                    {isStudent && (
                        <>
                            <h3 style={{ 
                                color: isDark ? '#fefae0' : '#0f172a', 
                                fontSize: '20px', 
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <HiOutlineDocumentText style={{ color: roleColor }} /> Mon CV
                            </h3>

                            {cvInfo ? (
                                <div>
                                    <div style={{
                                        background: isDark ? `rgba(108,99,255,0.08)` : '#f5f3ff',
                                        border: isDark ? `1px solid rgba(108,99,255,0.2)` : '1px solid #ddd6fe',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ 
                                                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                                fontSize: '12px',
                                                display: 'block',
                                                marginBottom: '5px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                <FiFileText style={{ display: 'inline', marginRight: '6px' }} /> NOM FICHIER
                                            </label>
                                            <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px' }}>
                                                {cvInfo.originalName || cvInfo.filename}
                                            </p>
                                        </div>
                                        
                                        {cvInfo.uploadDate && (
                                            <div style={{ marginBottom: '15px' }}>
                                                <label style={{ 
                                                    color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                                    fontSize: '12px',
                                                    display: 'block',
                                                    marginBottom: '5px',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    <FiCalendar style={{ display: 'inline', marginRight: '6px' }} /> TÉLÉCHARGÉ LE
                                                </label>
                                                <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px' }}>
                                                    {new Date(cvInfo.uploadDate).toLocaleDateString('fr-FR', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            onClick={handleViewCV}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                boxShadow: `0 4px 12px ${roleColor}40`
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = `0 6px 20px ${roleColor}50`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = `0 4px 12px ${roleColor}40`;
                                            }}
                                        >
                                            <FiEye /> Voir CV
                                        </button>
                                        
                                        <button 
                                            onClick={() => navigate('/dashboard/cvupload')}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                            }}
                                        >
                                            <FiEdit2 /> Modifier CV
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px'
                                }}>
                                    <HiOutlineDocumentText size={50} style={{ 
                                        marginBottom: '20px', 
                                        color: isDark ? 'rgba(254,250,224,0.2)' : '#94a3b8' 
                                    }} />
                                    <p style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', 
                                        marginBottom: '20px',
                                        fontSize: '14px'
                                    }}>
                                        Aucun CV téléchargé pour le moment
                                    </p>
                                    <button 
                                        onClick={() => navigate('/dashboard/cvupload')}
                                        style={{
                                            padding: '12px 30px',
                                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            boxShadow: `0 4px 12px ${roleColor}40`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = `0 6px 20px ${roleColor}50`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${roleColor}40`;
                                        }}
                                    >
                                        <FiUpload style={{ display: 'inline', marginRight: '8px' }} /> Télécharger votre CV
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {isRecruiter && (
                        <>
                            <h3 style={{ 
                                color: isDark ? '#fefae0' : '#0f172a', 
                                fontSize: '20px', 
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <HiOutlineOfficeBuilding style={{ color: roleColor }} /> Info Entreprise
                            </h3>

                            <div style={{
                                background: isDark ? `rgba(255,107,107,0.08)` : '#fef2f2',
                                border: isDark ? `1px solid rgba(255,107,107,0.2)` : '1px solid #fecaca',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                        fontSize: '12px',
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <FiCalendar style={{ display: 'inline', marginRight: '6px' }} /> RECRUTEUR DEPUIS
                                    </label>
                                    <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px' }}>
                                        {accountInfo?.dateCreation 
                                            ? new Date(accountInfo.dateCreation).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : user?.dateCreation
                                            ? new Date(user.dateCreation).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : 'Date inconnue'
                                        }
                                    </p>
                                </div>
                                
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                        fontSize: '12px',
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <HiOutlineDocumentText style={{ display: 'inline', marginRight: '6px' }} /> OFFRES ACTIVES
                                    </label>
                                    <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px' }}>
                                        {recruiterStats.activeJobs}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                        fontSize: '12px',
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <HiOutlineUserGroup style={{ display: 'inline', marginRight: '6px' }} /> TOTAL CANDIDATURES
                                    </label>
                                    <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px' }}>
                                        {recruiterStats.totalCandidates}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => navigate('/dashboard/offres')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        boxShadow: `0 4px 12px ${roleColor}40`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = `0 6px 20px ${roleColor}50`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${roleColor}40`;
                                    }}
                                >
                                    <FiEdit2 /> Gérer les offres
                                </button>
                                
                                <button 
                                    onClick={() => navigate('/dashboard/candidats')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                    }}
                                >
                                    <HiOutlineUserGroup /> Voir Candidats
                                </button>
                            </div>
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <h3 style={{ 
                                color: isDark ? '#fefae0' : '#0f172a', 
                                fontSize: '20px', 
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <FiBarChart2 style={{ color: roleColor }} /> Panneau d'Administration
                            </h3>

                            <div style={{
                                background: isDark ? `rgba(16,185,129,0.08)` : '#f0fdf4',
                                border: isDark ? `1px solid rgba(16,185,129,0.2)` : '1px solid #bbf7d0',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                        fontSize: '12px',
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <FiUserCheck style={{ display: 'inline', marginRight: '6px' }} /> STATUT DU COMPTE
                                    </label>
                                    <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                        <FiCheckCircle /> Super Administrateur Actif
                                    </p>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                        fontSize: '12px',
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <FiCalendar style={{ display: 'inline', marginRight: '6px' }} /> CRÉÉ LE
                                    </label>
                                    <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px', margin: 0 }}>
                                        {accountInfo?.dateCreation 
                                            ? new Date(accountInfo.dateCreation).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : user?.dateCreation
                                            ? new Date(user.dateCreation).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : 'Date inconnue'
                                        }
                                    </p>
                                </div>
                                
                                <div>
                                    <label style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                        fontSize: '12px',
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <FiAward style={{ display: 'inline', marginRight: '6px' }} /> NIVEAU D'ACCÈS
                                    </label>
                                    <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px', margin: 0 }}>
                                        Gestion totale des utilisateurs et supervision globale du système.
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => navigate('/dashboard/users')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        boxShadow: `0 4px 12px ${roleColor}40`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = `0 6px 20px ${roleColor}50`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${roleColor}40`;
                                    }}
                                >
                                    <FiUsers /> Gérer Utilisateurs
                                </button>
                                
                                <button 
                                    onClick={() => navigate('/dashboard/statistics')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                    }}
                                >
                                    <FiBarChart2 /> Statistiques
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Account Actions Section */}
            <div style={{
                marginTop: '30px',
                background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ 
                    color: isDark ? '#fefae0' : '#0f172a', 
                    fontSize: '20px', 
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FiSettings style={{ color: roleColor }} /> Actions sur le compte
                </h3>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={handleEditProfile}
                        style={{
                            padding: '10px 20px',
                            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                            color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <FiEdit2 style={{ color: roleColor }} /> Modifier le profil
                    </button>
                    
                    <button 
                        onClick={() => setShowChangePassword(true)}
                        style={{
                            padding: '10px 20px',
                            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                            color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <FiLock style={{ color: roleColor }} /> Changer le mot de passe
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        style={{
                            padding: '10px 20px',
                            background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                            color: '#ef4444',
                            border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #fecaca',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.2)' : '#fee2e2';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <FiLogOut /> Déconnexion
                    </button>
                </div>
            </div>

            {/* Edit Profile Modal - WITH ModalPortal */}
            {showEditProfile && (
                <ModalPortal>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px'
                    }}
                    onClick={() => setShowEditProfile(false)}
                    >
                        <div style={{
                            background: isDark ? 'linear-gradient(135deg, #1e1e2d, #2d2d44)' : '#ffffff',
                            borderRadius: '20px',
                            padding: '30px',
                            width: '100%',
                            maxWidth: '420px',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            boxShadow: isDark 
                                ? '0 25px 60px rgba(0,0,0,0.6)' 
                                : '0 25px 60px rgba(0,0,0,0.2)',
                            position: 'relative',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ 
                                color: isDark ? '#fefae0' : '#0f172a', 
                                marginBottom: '25px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px' 
                            }}>
                                <FiEdit2 style={{ color: roleColor }} /> Modifier le profil
                            </h3>
                            <input 
                                style={{
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    marginBottom: '12px',
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                                    borderRadius: '10px', 
                                    color: isDark ? '#fefae0' : '#1e293b', 
                                    fontSize: '14px', 
                                    outline: 'none'
                                }}
                                placeholder="Prénom" 
                                value={editForm.prenom}
                                onChange={e => setEditForm({...editForm, prenom: e.target.value})} 
                            />
                            <input 
                                style={{
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    marginBottom: '12px',
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                                    borderRadius: '10px', 
                                    color: isDark ? '#fefae0' : '#1e293b', 
                                    fontSize: '14px', 
                                    outline: 'none'
                                }}
                                placeholder="Nom" 
                                value={editForm.nom}
                                onChange={e => setEditForm({...editForm, nom: e.target.value})} 
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    onClick={handleSaveProfile}
                                    style={{
                                        flex: 1, 
                                        padding: '12px', 
                                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '10px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold', 
                                        fontSize: '14px', 
                                        display: 'flex',
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '6px',
                                        boxShadow: `0 4px 16px ${roleColor}40`,
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = `0 6px 24px ${roleColor}50`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = `0 4px 16px ${roleColor}40`;
                                    }}
                                >
                                    <FiSave /> Enregistrer
                                </button>
                                <button 
                                    onClick={() => setShowEditProfile(false)}
                                    style={{
                                        padding: '12px 20px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '10px', 
                                        cursor: 'pointer', 
                                        fontSize: '14px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Change Password Modal - WITH ModalPortal */}
            {showChangePassword && (
                <ModalPortal>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '20px'
                    }}
                    onClick={() => setShowChangePassword(false)}
                    >
                        <div style={{
                            background: isDark ? 'linear-gradient(135deg, #1e1e2d, #2d2d44)' : '#ffffff',
                            borderRadius: '20px',
                            padding: '30px',
                            width: '100%',
                            maxWidth: '420px',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            boxShadow: isDark 
                                ? '0 25px 60px rgba(0,0,0,0.6)' 
                                : '0 25px 60px rgba(0,0,0,0.2)',
                            position: 'relative',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <h3 style={{ 
                                color: isDark ? '#fefae0' : '#0f172a', 
                                marginBottom: '25px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px' 
                            }}>
                                <FiLock style={{ color: roleColor }} /> Changer le mot de passe
                            </h3>
                            <input 
                                type="password"
                                style={{
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    marginBottom: '12px',
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                                    borderRadius: '10px', 
                                    color: isDark ? '#fefae0' : '#1e293b', 
                                    fontSize: '14px', 
                                    outline: 'none'
                                }}
                                placeholder="Mot de passe actuel" 
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                            />
                            <input 
                                type="password"
                                style={{
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    marginBottom: '12px',
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                                    borderRadius: '10px', 
                                    color: isDark ? '#fefae0' : '#1e293b', 
                                    fontSize: '14px', 
                                    outline: 'none'
                                }}
                                placeholder="Nouveau mot de passe" 
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                            />
                            <input 
                                type="password"
                                style={{
                                    width: '100%', 
                                    padding: '12px 16px', 
                                    marginBottom: '12px',
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                                    borderRadius: '10px', 
                                    color: isDark ? '#fefae0' : '#1e293b', 
                                    fontSize: '14px', 
                                    outline: 'none'
                                }}
                                placeholder="Confirmer le nouveau mot de passe" 
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    onClick={handleChangePassword}
                                    style={{
                                        flex: 1, 
                                        padding: '12px', 
                                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '10px', 
                                        cursor: 'pointer',
                                        fontWeight: 'bold', 
                                        fontSize: '14px', 
                                        display: 'flex',
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        gap: '6px',
                                        boxShadow: `0 4px 16px ${roleColor}40`,
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = `0 6px 24px ${roleColor}50`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = `0 4px 16px ${roleColor}40`;
                                    }}
                                >
                                    <FiLock /> Mettre à jour
                                </button>
                                <button 
                                    onClick={() => setShowChangePassword(false)}
                                    style={{
                                        padding: '12px 20px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '10px', 
                                        cursor: 'pointer', 
                                        fontSize: '14px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
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
                    width: 50px;
                    height: 50px;
                    border: 4px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
                    border-top: 4px solid ${roleColor};
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

export default Profile;