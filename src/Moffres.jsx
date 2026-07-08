// Moffres.jsx - Complete with Floating Icons & Advanced Features
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext.jsx';
import ModalPortal from './ModalPortal.jsx';
import { 
  FiFileText, FiCheckCircle, FiXCircle, FiClock, FiTrash2, 
  FiEye, FiMail, FiBriefcase, FiMapPin, FiCalendar, FiLock, FiUser,
  FiTarget, FiCode, FiMessageCircle, FiTrendingUp, FiUserCheck,
  FiAward, FiCpu
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineDocumentText } from 'react-icons/hi';

function Moffres() {
    const { isDark, theme } = useTheme();
    const [user, setUser] = useState(null);
    const [mesCandidatures, setMesCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [selectedStatut, setSelectedStatut] = useState('all');
    const [customConfirm, setCustomConfirm] = useState({ show: false, message: '', onConfirm: null });

    const getRoleColor = () => {
        const role = user?.role;
        if (role === 'Recruteur') return '#ff6b6b';
        if (role === 'Admin' || role === 'admin') return '#10b981';
        return '#6366f1';
    };
    const roleColor = getRoleColor();
    const isLightMode = theme === 'light';

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                if (parsedUser.role === 'Etudiant') {
                    fetchMesCandidatures(parsedUser.id);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error:", error);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchMesCandidatures = async (studentId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/candidatures/etudiant/${studentId}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            const candidaturesEnCours = data.filter(c => 
                !['proposition_envoyee', 'embauche_acceptee', 'embauche_refusee'].includes(c.statutCandidature)
            );
            setMesCandidatures(candidaturesEnCours);
        } catch (err) {
            console.error("Error:", err);
            setMessage("❌ Impossible de charger vos candidatures.");
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleAnnulerCandidature = async (offreId, candidatureId) => {
        setCustomConfirm({
            show: true,
            message: "Êtes-vous sûr de vouloir annuler cette candidature ? Cette action est irréversible.",
            onConfirm: async () => {
                try {
                    const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}/candidatures/${candidatureId}`, {
                        method: 'DELETE'
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setMessage("✅ Candidature annulée avec succès.");
                        setMessageType('success');
                        setMesCandidatures(prev => prev.filter(c => c.candidatureId !== candidatureId));
                        setTimeout(() => setMessage(''), 3000);
                    } else {
                        setMessage("❌ Erreur lors de l'annulation.");
                        setMessageType('error');
                        setTimeout(() => setMessage(''), 4000);
                    }
                } catch (err) {
                    setMessage("❌ Impossible de se connecter au serveur.");
                    setMessageType('error');
                    setTimeout(() => setMessage(''), 4000);
                }
            }
        });
    };

    const getTranslatedStatus = (statut) => {
        switch (statut) {
            case 'en attente': return 'En attente';
            case 'acceptée': return 'Acceptée';
            case 'refusée': return 'Refusée';
            default: return statut;
        }
    };

    const getStatusColor = (statut) => {
        switch (statut) {
            case 'en attente': return '#f59e0b';
            case 'acceptée': return '#10b981';
            case 'refusée': return '#ef4444';
            default: return isDark ? 'rgba(255,255,255,0.7)' : '#64748b';
        }
    };

    const getStatusIcon = (statut) => {
        switch (statut) {
            case 'en attente': return <FiClock size={14} />;
            case 'acceptée': return <FiCheckCircle size={14} />;
            case 'refusée': return <FiXCircle size={14} />;
            default: return <FiFileText size={14} />;
        }
    };

    const renderStatutCandidature = (statut) => {
        const label = getTranslatedStatus(statut);
        const color = getStatusColor(statut);
        const icon = getStatusIcon(statut);
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: `${color}20`, color: color, border: `1px solid ${color}40`,
                padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
            }}>
                {icon} {label}
            </span>
        );
    };

    const filteredCandidatures = selectedStatut === 'all'
        ? mesCandidatures
        : mesCandidatures.filter(c => c.statutCandidature === selectedStatut);

    const statsCandidatures = {
        total: mesCandidatures.length,
        enAttente: mesCandidatures.filter(c => c.statutCandidature === 'en attente').length,
        acceptees: mesCandidatures.filter(c => c.statutCandidature === 'acceptée').length,
        refusees: mesCandidatures.filter(c => c.statutCandidature === 'refusée').length
    };

   if (loading) {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh',
            width: '100%',
            background: isDark ? '#0f172a' : '#f1f5f9',
            color: isDark ? '#fefae0' : '#0f172a'
        }}>
            <div className="loading-spinner"></div>
            <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '16px' }}>
                Chargement de vos candidatures...
            </p>
        </div>
    );
}

    if (!user || user.role !== 'Etudiant') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    borderRadius: '16px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    maxWidth: '400px'
                }}>
                    <FiLock size={50} style={{ color: '#ef4444', marginBottom: '20px' }} />
                    <h2 style={{ color: isDark ? '#fefae0' : '#0f172a' }}>Accès Restreint</h2>
                    <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Veuillez vous connecter en tant qu'étudiant.</p>
                    <Link to="/login">
                        <button style={{
                            marginTop: '20px',
                            padding: '12px 30px',
                            background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}>
                            Se connecter
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

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
                        <FiFileText style={{ color: '#6366f1' }} /> Mes Candidatures
                    </h1>
                    <p style={{ 
                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                        fontSize: '16px' 
                    }}>
                        Suivez l'état de vos candidatures et les réponses des recruteurs.
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

            {/* Stats Cards - Design amélioré comme Candidats.jsx */}
<div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
    gap: '16px', 
    marginBottom: '30px',
    maxWidth: '100%'
}}>
    {/* Total */}
    <div style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    }}
    onMouseEnter={(e) => { 
        e.currentTarget.style.transform = 'translateY(-4px)'; 
        e.currentTarget.style.borderColor = roleColor;
        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
    }}>
        <div style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '12px',
            background: `${roleColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: roleColor,
            fontSize: '20px'
        }}>
            <FiFileText size={20} />
        </div>
        <div>
            <div style={{ 
                fontSize: '26px', 
                fontWeight: '700', 
                color: isDark ? '#fefae0' : '#0f172a',
                fontFamily: "'Quicksand', sans-serif",
                lineHeight: 1.2
            }}>
                {statsCandidatures.total}
            </div>
            <div style={{ 
                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                fontSize: '13px',
                fontWeight: '500'
            }}>
                Total
            </div>
        </div>
    </div>

    {/* En attente */}
    <div style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    }}
    onMouseEnter={(e) => { 
        e.currentTarget.style.transform = 'translateY(-4px)'; 
        e.currentTarget.style.borderColor = '#f59e0b';
        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
    }}>
        <div style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
            fontSize: '20px'
        }}>
            <FiClock size={20} />
        </div>
        <div>
            <div style={{ 
                fontSize: '26px', 
                fontWeight: '700', 
                color: isDark ? '#fefae0' : '#0f172a',
                fontFamily: "'Quicksand', sans-serif",
                lineHeight: 1.2
            }}>
                {statsCandidatures.enAttente}
            </div>
            <div style={{ 
                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                fontSize: '13px',
                fontWeight: '500'
            }}>
                En attente
            </div>
        </div>
    </div>

    {/* Acceptées */}
    <div style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    }}
    onMouseEnter={(e) => { 
        e.currentTarget.style.transform = 'translateY(-4px)'; 
        e.currentTarget.style.borderColor = '#10b981';
        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
    }}>
        <div style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            fontSize: '20px'
        }}>
            <FiCheckCircle size={20} />
        </div>
        <div>
            <div style={{ 
                fontSize: '26px', 
                fontWeight: '700', 
                color: isDark ? '#fefae0' : '#0f172a',
                fontFamily: "'Quicksand', sans-serif",
                lineHeight: 1.2
            }}>
                {statsCandidatures.acceptees}
            </div>
            <div style={{ 
                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                fontSize: '13px',
                fontWeight: '500'
            }}>
                Acceptées
            </div>
        </div>
    </div>

    {/* Refusées */}
    <div style={{
        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
    }}
    onMouseEnter={(e) => { 
        e.currentTarget.style.transform = 'translateY(-4px)'; 
        e.currentTarget.style.borderColor = '#ef4444';
        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
    }}>
        <div style={{
            width: '46px',
            height: '46px',
            minWidth: '46px',
            borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            fontSize: '20px'
        }}>
            <FiXCircle size={20} />
        </div>
        <div>
            <div style={{ 
                fontSize: '26px', 
                fontWeight: '700', 
                color: isDark ? '#fefae0' : '#0f172a',
                fontFamily: "'Quicksand', sans-serif",
                lineHeight: 1.2
            }}>
                {statsCandidatures.refusees}
            </div>
            <div style={{ 
                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                fontSize: '13px',
                fontWeight: '500'
            }}>
                Refusées
            </div>
        </div>
    </div>
</div>

            {/* Filter by Status */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '25px',
                flexWrap: 'wrap'
            }}>
                <label style={{ 
                    color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', 
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    Filtrer par statut :
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                        { value: 'all', label: 'Tous', color: roleColor },
                        { value: 'en attente', label: 'En attente', color: '#f59e0b' },
                        { value: 'acceptée', label: 'Acceptées', color: '#10b981' },
                        { value: 'refusée', label: 'Refusées', color: '#ef4444' },
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setSelectedStatut(filter.value)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: selectedStatut === filter.value 
                                    ? `2px solid ${filter.color}` 
                                    : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                background: selectedStatut === filter.value 
                                    ? `${filter.color}20`
                                    : 'transparent',
                                color: selectedStatut === filter.value 
                                    ? filter.color 
                                    : isDark ? 'rgba(254,250,224,0.5)' : '#64748b',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: selectedStatut === filter.value ? '600' : '500',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            {filteredCandidatures.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    borderRadius: '20px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                }}>
                    <FiMail size={60} style={{ color: isDark ? 'rgba(254,250,224,0.2)' : '#94a3b8', marginBottom: '20px' }} />
                    <p style={{ fontSize: '18px', marginBottom: '20px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>
                        {selectedStatut === 'all'
                            ? "Vous n'avez postulé à aucune offre pour le moment."
                            : `Aucune candidature avec le statut "${getTranslatedStatus(selectedStatut)}".`}
                    </p>
                    <Link to="/dashboard/offres">
                        <button style={{
                            padding: '12px 30px',
                            background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <FiBriefcase style={{ display: 'inline', marginRight: '8px' }} /> Voir les offres disponibles
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {filteredCandidatures.map((candidature) => (
                        <div key={candidature.candidatureId} className="application-card" style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '25px',
                            transition: 'all 0.3s ease',
                            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = roleColor;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)';
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                flexWrap: 'wrap',
                                gap: '20px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ flex: 2, minWidth: '250px' }}>
                                    <h3 style={{ 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        fontSize: '20px', 
                                        margin: '0 0 8px 0',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <FiBriefcase style={{ color: roleColor }} /> {candidature.offreTitre}
                                    </h3>
                                    <p style={{ 
                                        color: roleColor, 
                                        fontSize: '14px', 
                                        marginBottom: '10px',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span><HiOutlineOfficeBuilding style={{ display: 'inline', marginRight: '4px' }} /> {candidature.entreprise}</span>
                                        <span><FiMapPin style={{ display: 'inline', marginRight: '4px' }} /> {candidature.localisation}</span>
                                    </p>
                                    <p style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', 
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <FiCalendar size={14} /> Postulé le {new Date(candidature.dateCandidature).toLocaleDateString('fr-FR', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>{renderStatutCandidature(candidature.statutCandidature)}</div>
                            </div>

                            {/* Motivation Letter */}
                            {candidature.lettreMotivation && (
                                <div style={{
                                    background: `${roleColor}10`,
                                    borderRadius: '12px',
                                    padding: '15px',
                                    borderLeft: `3px solid ${roleColor}`,
                                    marginBottom: '15px'
                                }}>
                                    <p style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', 
                                        fontSize: '12px', 
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <HiOutlineDocumentText /> Lettre de motivation
                                    </p>
                                    <p style={{ 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        fontSize: '14px', 
                                        fontStyle: 'italic',
                                        margin: 0
                                    }}>
                                        "{candidature.lettreMotivation}"
                                    </p>
                                </div>
                            )}

                            {/* Recruiter Message */}
                            {candidature.statutCandidature !== 'en attente' && candidature.commentaireRecruteur && (
                                <div style={{
                                    background: candidature.statutCandidature === 'acceptée' 
                                        ? 'rgba(16,185,129,0.08)' 
                                        : 'rgba(239,68,68,0.08)',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    borderLeft: candidature.statutCandidature === 'acceptée' 
                                        ? '3px solid #10b981' 
                                        : '3px solid #ef4444',
                                    marginBottom: '15px'
                                }}>
                                    <p style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', 
                                        fontSize: '12px', 
                                        marginBottom: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <FiMail /> Message du recruteur
                                    </p>
                                    <p style={{ 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        fontSize: '14px', 
                                        margin: 0 
                                    }}>
                                        {candidature.commentaireRecruteur}
                                    </p>
                                </div>
                            )}

                            {/* Interview Score Display */}
                            {candidature.statutCandidature === 'acceptée' && candidature.scoreEntretien !== undefined && candidature.scoreEntretien !== null && (
                                <div style={{
                                    background: isDark ? 'rgba(108,99,255,0.08)' : '#f5f3ff',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    borderLeft: `3px solid ${roleColor}`,
                                    marginBottom: '15px'
                                }}>
                                    <p style={{ 
                                        color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', 
                                        fontSize: '11px', 
                                        marginBottom: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <FiAward size={14} /> Résultat de l'entretien
                                    </p>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        marginBottom: '15px',
                                        padding: '15px',
                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{
                                            fontSize: '42px',
                                            fontWeight: '700',
                                            color: candidature.scoreEntretien >= 70 ? '#10b981' : 
                                                   candidature.scoreEntretien >= 50 ? '#f59e0b' : '#ef4444',
                                            fontFamily: "'Quicksand', sans-serif"
                                        }}>
                                            {candidature.scoreEntretien}/100
                                        </div>
                                        <p style={{ 
                                            color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', 
                                            fontSize: '12px', 
                                            margin: 0 
                                        }}>
                                            Score global
                                        </p>
                                    </div>
                                    {candidature.scores && (
                                        <div style={{ 
                                            display: 'grid', 
                                            gap: '8px', 
                                            marginBottom: '15px',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'
                                        }}>
                                            {Object.entries(candidature.scores).map(([key, value]) => {
                                                const iconMap = {
                                                    pertinence: <FiTarget size={14} />,
                                                    technique: <FiCpu size={14} />,
                                                    communication: <FiMessageCircle size={14} />,
                                                    motivation: <FiTrendingUp size={14} />,
                                                    professionnalisme: <FiUserCheck size={14} />
                                                };
                                                const labelMap = {
                                                    pertinence: 'Pertinence',
                                                    technique: 'Technique',
                                                    communication: 'Communication',
                                                    motivation: 'Motivation',
                                                    professionnalisme: 'Professionnalisme'
                                                };
                                                return (
                                                    <div key={key} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '8px 12px',
                                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                        borderRadius: '8px',
                                                        color: isDark ? '#fefae0' : '#0f172a',
                                                        fontSize: '12px'
                                                    }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            {iconMap[key]} {labelMap[key]}
                                                        </span>
                                                        <span style={{ fontWeight: 'bold', color: roleColor }}>{value}/30</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {candidature.commentaireEntretien && (
                                        <div style={{
                                            padding: '12px',
                                            background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                            borderRadius: '8px',
                                            border: isDark ? '1px solid rgba(108,99,255,0.1)' : '1px solid #ddd6fe'
                                        }}>
                                            <p style={{ 
                                                color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', 
                                                fontSize: '11px', 
                                                marginBottom: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <FiMessageCircle size={12} /> Commentaire
                                            </p>
                                            <p style={{ 
                                                color: isDark ? '#fefae0' : '#0f172a', 
                                                fontSize: '13px', 
                                                margin: 0,
                                                fontStyle: 'italic'
                                            }}>
                                                {candidature.commentaireEntretien}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                                paddingTop: '15px',
                                flexWrap: 'wrap'
                            }}>
                                <Link to="/dashboard/offres" style={{ textDecoration: 'none' }}>
                                    <button style={{
                                        padding: '8px 20px',
                                        background: `${roleColor}20`,
                                        color: roleColor,
                                        border: `1px solid ${roleColor}30`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                        <FiEye size={14} /> Voir l'offre
                                    </button>
                                </Link>
                                {candidature.statutCandidature === 'en attente' && (
                                    <button
                                        onClick={() => handleAnnulerCandidature(candidature.offreId, candidature.candidatureId)}
                                        style={{
                                            padding: '8px 20px',
                                            background: 'rgba(239,68,68,0.12)',
                                            color: '#ef4444',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <FiTrash2 size={14} /> Annuler ma candidature
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal - Now with ModalPortal */}
            {customConfirm.show && (
                <ModalPortal>
                    <div 
                        onClick={() => setCustomConfirm({ show: false, message: '', onConfirm: null })}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100vw',
                            height: '100vh',
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'fadeIn 0.2s ease-out'
                        }}
                    >
                        <div 
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#ffffff',
                                padding: '40px 50px',
                                borderRadius: '24px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                                textAlign: 'center',
                                maxWidth: '400px',
                                width: '90%',
                                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
                            }}
                        >
                            <svg style={{ width: '80px', height: '80px', margin: '0 auto 20px', display: 'block' }} viewBox="0 0 52 52">
                                <circle cx="26" cy="26" r="25" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="166" strokeDashoffset="0" style={{ animation: 'drawStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards' }} />
                                <path d="M26 14v12" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                                <circle cx="26" cy="34" r="2" fill="#f59e0b" />
                            </svg>
                            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '22px', fontWeight: 'bold' }}>
                                Êtes-vous sûr ?
                            </h3>
                            <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 30px 0', lineHeight: '1.5' }}>
                                {customConfirm.message}
                            </p>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                <button 
                                    onClick={() => setCustomConfirm({ show: false, message: '', onConfirm: null })}
                                    style={{
                                        padding: '12px 24px', borderRadius: '10px', border: 'none',
                                        background: '#f1f5f9', color: '#64748b', fontWeight: 'bold',
                                        cursor: 'pointer', flex: 1, transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                                    onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                                >
                                    Annuler
                                </button>
                                <button 
                                    onClick={() => {
                                        customConfirm.onConfirm();
                                        setCustomConfirm({ show: false, message: '', onConfirm: null });
                                    }}
                                    style={{
                                        padding: '12px 24px', borderRadius: '10px', border: 'none',
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: 'white', fontWeight: 'bold', flex: 1,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)'
                                    }}
                                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                >
                                    Oui, continuer
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
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes drawStroke {
                    100% { stroke-dashoffset: 0; }
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
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

export default Moffres;