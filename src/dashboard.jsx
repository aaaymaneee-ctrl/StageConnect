// dashboard.jsx - Avec icônes flottantes et design moderne
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeContext.jsx';
import { 
  FiFileText, FiCalendar, FiBriefcase, FiCheckCircle, FiTrendingUp,
  FiUsers, FiAward, FiLock, FiUserCheck, FiSmile, FiSun, FiMoon,
  FiStar, FiTarget, FiZap, FiSettings, FiUserPlus, FiMail, FiEye, FiXCircle
} from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlineOfficeBuilding, HiOutlineUserGroup, HiOutlineAcademicCap } from 'react-icons/hi';

function Dashboard() { 
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        activeOffres: 0,
        totalCandidates: 0,
        scheduledInterviews: 0,
        positionsFilled: 0,
        activeApplications: 0,
        upcomingInterviews: 0,
        savedOffers: 0,
        completedAssessments: 0
    });
    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalRecruiters: 0,
        totalOffers: 0,
        activeOffers: 0,
        totalApplications: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentOffers, setRecentOffers] = useState([]);

    // Couleur selon le rôle pour l'icône d'en-tête
    const getRoleColor = () => {
        const role = user?.role;
        if (role === 'Recruteur') return '#ff6b6b';
        if (role === 'admin') return '#ef4444';
        return '#6366f1';
    };
    
    const roleColor = getRoleColor();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                console.log("Utilisateur depuis localStorage:", parsedUser);
                setUser(parsedUser);
                
                fetchUserInfo(parsedUser.id);
                
                if (parsedUser.role === 'Etudiant') {
                    fetchCVInfo(parsedUser.id);
                    fetchStudentStats(parsedUser.id);
                    setLoading(false);
                } else if (parsedUser.role === 'Recruteur') {
                    fetchRecruiterStats(parsedUser.id);
                    setLoading(false);
                } else if (parsedUser.role === 'admin') {
                    fetchAdminStats();
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Erreur lors du parsing des données utilisateur:", err);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserInfo = async (userId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users/${userId}`);
            const userData = await res.json();
            console.log("Données utilisateur récupérées:", userData);
            return userData;
        } catch (err) {
            console.error("Erreur lors de la récupération des infos utilisateur:", err);
        }
    };

    const fetchCVInfo = async (userId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users`);
            if (!res.ok) {
                console.error("Échec de la récupération des utilisateurs:", res.status);
                setLoading(false);
                return;
            }
            const users = await res.json();
            const currentUser = users.find(u => u._id === userId);
            console.log("Infos CV récupérées:", currentUser?.cv);
        } catch (err) {
            console.error("Erreur lors de la récupération du CV:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminStats = async () => {
        try {
            const usersRes = await fetch('https://pfe-backend-five.vercel.app/users');
            const users = await usersRes.json();
            
            const totalUsers = users.length;
            const totalStudents = users.filter(u => u.role === 'Etudiant').length;
            const totalRecruiters = users.filter(u => u.role === 'Recruteur').length;
            
            const offersRes = await fetch('https://pfe-backend-five.vercel.app/offres');
            const offers = await offersRes.json();
            
            const totalOffers = offers.length;
            const activeOffers = offers.filter(o => o.statut === 'active').length;
            
            let totalApplications = 0;
            offers.forEach(offer => {
                totalApplications += offer.candidatures?.length || 0;
            });
            
            const sortedUsers = users.sort((a, b) => 
                new Date(b.dateCreation) - new Date(a.dateCreation)
            );
            setRecentUsers(sortedUsers.slice(0, 5));
            
            const sortedOffers = offers.sort((a, b) => 
                new Date(b.dateCreation) - new Date(a.dateCreation)
            );
            setRecentOffers(sortedOffers.slice(0, 5));
            
            setAdminStats({
                totalUsers,
                totalStudents,
                totalRecruiters,
                totalOffers,
                activeOffers,
                totalApplications
            });
            
        } catch (err) {
            console.error("Erreur lors de la récupération des statistiques admin:", err);
        }
    };

    const fetchRecruiterStats = async (recruiterId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/stats/recruteur/${recruiterId}`);
            const statsData = await res.json();
            
            if (statsData.isBlocked) {
                setStats(prev => ({ ...prev, activeOffres: 0, totalCandidates: 0, scheduledInterviews: 0, positionsFilled: 0 }));
                return;
            }

            const offresRes = await fetch(`https://pfe-backend-five.vercel.app/offres/recruteur/${recruiterId}`);
            const offres = await offresRes.json();
            
            let realPositionsFilled = 0;
            offres.forEach(offre => {
                realPositionsFilled += offre.candidatures?.filter(c => c.statut === 'embauché').length || 0;
            });
            
            setStats({
                activeOffres: statsData.activeOffres,
                totalCandidates: statsData.totalCandidates,
                scheduledInterviews: statsData.scheduledInterviews,
                positionsFilled: realPositionsFilled
            });
            
        } catch (err) {
            console.error("Erreur lors de la récupération des statistiques recruteur:", err);
        }
    };

    const fetchStudentStats = async (studentId) => {
        try {
            const res = await fetch('https://pfe-backend-five.vercel.app/offres');
            const offres = await res.json();
            
            let activeApplications = 0;
            let upcomingInterviews = 0;
            let completedAssessments = 0;
            
            offres.forEach(offre => {
                const studentApplications = offre.candidatures?.filter(
                    c => c.etudiantId === studentId || c.etudiantId?._id === studentId
                );
                
                if (studentApplications) {
                    activeApplications += studentApplications.filter(
                        c => c.statut === 'en attente' || c.statut === 'evaluation_en_cours'
                    ).length;
                    
                    upcomingInterviews += studentApplications.filter(
                        c => c.statut === 'acceptée' && 
                        (!c.scoreEntretien || c.scoreEntretien === null)
                    ).length;
                    
                    completedAssessments += studentApplications.filter(
                        c => c.statut === 'embauché'
                    ).length;
                }
            });
            
            setStats({
                activeApplications,
                upcomingInterviews,
                savedOffers: offres.length,
                completedAssessments
            });
            
        } catch (err) {
            console.error("Erreur lors de la récupération des statistiques étudiant:", err);
        }
    };

    const getWelcomeIcon = () => {
        const hour = new Date().getHours();
        if (hour < 12) return <FiSun style={{ color: '#f59e0b' }} />;
        if (hour < 18) return <FiSmile style={{ color: '#f59e0b' }} />;
        return <FiMoon style={{ color: '#818cf8' }} />;
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                width: '100%'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <FiTrendingUp size={50} style={{ 
                        animation: 'spin 2s linear infinite', 
                        marginBottom: '20px', 
                        color: '#6c63ff' 
                    }} />
                    <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                        Chargement...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="auth-required" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="auth-card" style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    borderRadius: '16px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    maxWidth: '400px'
                }}>
                    <FiLock size={50} style={{ marginBottom: '1rem', color: '#ef4444' }} />
                    <h2 style={{ color: isDark ? 'white' : '#0f172a' }}>Accès Restreint</h2>
                    <p style={{ marginBottom: '2rem', color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>
                        Veuillez vous connecter pour accéder à votre tableau de bord
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
    const isAdmin = user.role === 'admin';
    const firstName = user.prenom || 'Utilisateur';
    const headerIconColor = getRoleColor();

    return (
        <div>
            {/* En-tête de bienvenue avec icône */}
            <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '1.8rem', 
                            fontWeight: '700', 
                            color: isDark ? 'white' : '#0f172a', 
                            margin: 0, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            flexWrap: 'wrap' 
                        }}>
                            {isStudent ? (
                                <><HiOutlineAcademicCap style={{ color: '#6366f1' }} /> Bon retour, {firstName} ! <span style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center' }}></span></>
                            ) : isRecruiter ? (
                                <><HiOutlineOfficeBuilding style={{ color: '#ff6b6b' }} /> Bon retour, {firstName} ! <span style={{ color: '#ff6b6b', display: 'inline-flex', alignItems: 'center' }}></span></>
                            ) : (
                                <><FiUsers style={{ color: '#10b981' }} /> Bon retour, {firstName} ! <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center' }}></span></>
                            )}
                        </h1>
                        <p style={{ 
                            color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', 
                            marginTop: '5px', 
                            fontSize: '0.95rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            flexWrap: 'wrap' 
                        }}>
                            {isStudent 
                                ? <>Suivez vos candidatures, préparez vos entretiens et décrochez votre stage de rêve <FiTarget style={{ color: '#6366f1' }} /></>
                                : isRecruiter
                                ? <>Gérez vos offres, examinez les candidats et trouvez les meilleurs talents <FiZap style={{ color: '#ff6b6b' }} /></>
                                : <>Gérez les utilisateurs, les offres et surveillez l'activité de la plateforme <FiTrendingUp style={{ color: '#10b981' }} /></>
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Grille de statistiques */}
            <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {isStudent && (
                    <>
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#6366f1';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(99, 102, 241, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiFileText className="float-icon" style={{ fontSize: '1.8rem', color: '#6366f1', animation: 'floatIcon 3s ease-in-out infinite' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#6366f1', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.activeApplications}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiFileText size={12} style={{ display: 'inline', marginRight: '4px' }} /> Candidatures actives
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#10b981';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(16, 185, 129, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiCalendar className="float-icon" style={{ fontSize: '1.8rem', color: '#10b981', animation: 'floatIcon 3s ease-in-out infinite 0.5s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#10b981', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.upcomingInterviews}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> Entretiens à venir
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#f59e0b';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(245, 158, 11, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiBriefcase className="float-icon" style={{ fontSize: '1.8rem', color: '#f59e0b', animation: 'floatIcon 3s ease-in-out infinite 1s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#f59e0b', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.savedOffers}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiBriefcase size={12} style={{ display: 'inline', marginRight: '4px' }} /> Offres disponibles
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(139, 92, 246, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiCheckCircle className="float-icon" style={{ fontSize: '1.8rem', color: '#8b5cf6', animation: 'floatIcon 3s ease-in-out infinite 1.5s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#8b5cf6', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.completedAssessments}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiCheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Postes obtenus
                                </p>
                            </div>
                        </div>
                    </>
                )}
                
                {isRecruiter && (
                    <>
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#6366f1';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(99, 102, 241, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <HiOutlineDocumentText className="float-icon" style={{ fontSize: '1.8rem', color: '#6366f1', animation: 'floatIcon 3s ease-in-out infinite' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#6366f1', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.activeOffres}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <HiOutlineDocumentText size={12} style={{ display: 'inline', marginRight: '4px' }} /> Offres actives
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#10b981';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(16, 185, 129, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <HiOutlineUserGroup className="float-icon" style={{ fontSize: '1.8rem', color: '#10b981', animation: 'floatIcon 3s ease-in-out infinite 0.5s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#10b981', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.totalCandidates}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <HiOutlineUserGroup size={12} style={{ display: 'inline', marginRight: '4px' }} /> Total candidats
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#f59e0b';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(245, 158, 11, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiUserCheck className="float-icon" style={{ fontSize: '1.8rem', color: '#f59e0b', animation: 'floatIcon 3s ease-in-out infinite 1s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#f59e0b', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.scheduledInterviews}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiUserCheck size={12} style={{ display: 'inline', marginRight: '4px' }} /> Candidats acceptés
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(239, 68, 68, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiAward className="float-icon" style={{ fontSize: '1.8rem', color: '#ef4444', animation: 'floatIcon 3s ease-in-out infinite 1.5s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#ef4444', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{stats.positionsFilled}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiAward size={12} style={{ display: 'inline', marginRight: '4px' }} /> Postes pourvus
                                </p>
                            </div>
                        </div>
                    </>
                )}
                
                {isAdmin && (
                    <>
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#6c63ff';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(108, 99, 255, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiUsers className="float-icon" style={{ fontSize: '1.8rem', color: '#6c63ff', animation: 'floatIcon 3s ease-in-out infinite' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#6c63ff', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{adminStats.totalUsers}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiUsers size={12} style={{ display: 'inline', marginRight: '4px' }} /> Total utilisateurs
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#22c55e';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(34, 197, 94, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <HiOutlineAcademicCap className="float-icon" style={{ fontSize: '1.8rem', color: '#22c55e', animation: 'floatIcon 3s ease-in-out infinite 0.5s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#22c55e', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{adminStats.totalStudents}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <HiOutlineAcademicCap size={12} style={{ display: 'inline', marginRight: '4px' }} /> Étudiants
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#ff6b6b';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255, 107, 107, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <HiOutlineOfficeBuilding className="float-icon" style={{ fontSize: '1.8rem', color: '#ff6b6b', animation: 'floatIcon 3s ease-in-out infinite 1s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#ff6b6b', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{adminStats.totalRecruiters}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <HiOutlineOfficeBuilding size={12} style={{ display: 'inline', marginRight: '4px' }} /> Recruteurs
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#f59e0b';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(245, 158, 11, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiBriefcase className="float-icon" style={{ fontSize: '1.8rem', color: '#f59e0b', animation: 'floatIcon 3s ease-in-out infinite 1.5s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#f59e0b', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{adminStats.activeOffers}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiBriefcase size={12} style={{ display: 'inline', marginRight: '4px' }} /> Offres actives
                                </p>
                            </div>
                        </div>
                        
                        <div className="stat-card hover-gradient" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.borderColor = '#8b5cf6';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.3)' : '0 8px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                            <div className="stat-icon" style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(139, 92, 246, 0.15)',
                                transition: 'all 0.3s ease'
                            }}>
                                <FiCheckCircle className="float-icon" style={{ fontSize: '1.8rem', color: '#8b5cf6', animation: 'floatIcon 3s ease-in-out infinite 2s' }} />
                            </div>
                            <div className="stat-info">
                                <h3 style={{ color: '#8b5cf6', fontSize: '1.875rem', fontWeight: '700', margin: 0 }}>{adminStats.totalApplications}</h3>
                                <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center' }}>
                                    <FiCheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Candidatures
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Actions rapides Admin */}
            {isAdmin && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <button
                        onClick={() => navigate('/dashboard/users')}
                        style={{
                            padding: '20px',
                            background: isDark 
                                ? 'linear-gradient(135deg, rgba(108, 99, 255, 0.2), rgba(72, 52, 212, 0.2))' 
                                : 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                            border: isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #c7d2fe',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            color: isDark ? 'white' : '#1e293b',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ color: '#6c63ff' }}><FiUsers size={24} /></span>
                        Gérer les utilisateurs
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/offres')}
                        style={{
                            padding: '20px',
                            background: isDark 
                                ? 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(238, 90, 36, 0.2))' 
                                : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                            border: isDark ? '1px solid rgba(255, 107, 107, 0.3)' : '1px solid #fecaca',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            color: isDark ? 'white' : '#1e293b',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ color: '#ff6b6b' }}><FiBriefcase size={24} /></span>
                        Gérer les offres
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/statistics')}
                        style={{
                            padding: '20px',
                            background: isDark 
                                ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.2), rgba(25, 135, 84, 0.2))' 
                                : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                            border: isDark ? '1px solid rgba(40, 167, 69, 0.3)' : '1px solid #bbf7d0',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            color: isDark ? 'white' : '#1e293b',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <span style={{ color: '#22c55e' }}><FiTrendingUp size={24} /></span>
                        Voir les statistiques
                    </button>
                </div>
            )}

            {/* Tableau des utilisateurs récents - Pour Admin */}
            {isAdmin && recentUsers.length > 0 && (
                <div style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '25px',
                    marginBottom: '20px',
                    boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h4 style={{ 
                            color: isDark ? 'white' : '#0f172a', 
                            fontSize: '18px', 
                            margin: 0,
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{ color: '#6c63ff' }}><FiUsers size={20} /></span>
                            Utilisateurs récents
                        </h4>
                        
                        <button 
                            onClick={() => navigate('/dashboard/users')}
                            style={{
                                padding: '6px 14px',
                                background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 99, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="13 17 18 12 13 7"/>
                                <polyline points="6 17 11 12 6 7"/>
                            </svg>
                            Voir tout
                        </button>
                    </div>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ 
                                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' 
                                }}>
                                    <th style={{ 
                                        padding: '12px', 
                                        textAlign: 'left', 
                                        color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>Nom</th>
                                    <th style={{ 
                                        padding: '12px', 
                                        textAlign: 'left', 
                                        color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>Email</th>
                                    <th style={{ 
                                        padding: '12px', 
                                        textAlign: 'left', 
                                        color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>Rôle</th>
                                    <th style={{ 
                                        padding: '12px', 
                                        textAlign: 'left', 
                                        color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>Créé le</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map((u, index) => (
                                    <tr key={u._id || index} style={{ 
                                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' 
                                    }}>
                                        <td style={{ 
                                            padding: '12px', 
                                            color: isDark ? 'white' : '#1e293b',
                                            fontSize: '14px'
                                        }}>
                                            {u.prenom} {u.nom}
                                        </td>
                                        <td style={{ 
                                            padding: '12px', 
                                            color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
                                            fontSize: '14px'
                                        }}>
                                            {u.email}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                background: u.role === 'Recruteur' 
                                                    ? (isDark ? 'rgba(255, 107, 107, 0.2)' : '#fee2e2')
                                                    : u.role === 'admin'
                                                    ? (isDark ? 'rgba(108, 99, 255, 0.2)' : '#eef2ff')
                                                    : (isDark ? 'rgba(40, 167, 69, 0.2)' : '#f0fdf4'),
                                                color: u.role === 'Recruteur' 
                                                    ? '#ff6b6b'
                                                    : u.role === 'admin'
                                                    ? '#6c63ff'
                                                    : '#22c55e'
                                            }}>
                                                {u.role === 'Etudiant' ? 'Étudiant' : u.role === 'Recruteur' ? 'Recruteur' : 'Administrateur'}
                                            </span>
                                        </td>
                                        <td style={{ 
                                            padding: '12px', 
                                            color: isDark ? 'rgba(255,255,255,0.7)' : '#64748b',
                                            fontSize: '14px'
                                        }}>
                                            {u.dateCreation 
                                                ? new Date(u.dateCreation).toLocaleDateString('fr-FR')
                                                : 'N/A'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes floatIcon {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .page-header-icon {
                    animation: floatIcon 3s ease-in-out infinite;
                }
                
                .stat-card {
                    transition: all 0.3s ease;
                }
                
                .stat-card:hover {
                    transform: translateY(-4px);
                }
                
                .hover-gradient {
                    position: relative;
                    overflow: hidden;
                }
                
                .hover-gradient::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transition: left 0.5s ease;
                }
                
                .hover-gradient:hover::before {
                    left: 100%;
                }
                
                .auth-required {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                }
            `}</style>
        </div>
    );
}

export default Dashboard;