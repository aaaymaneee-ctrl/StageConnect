// EntretienRecruteur.jsx - Design amélioré avec cartes modernes
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext.jsx';
import CalendrierEntretien from './CalendrierEntretien.jsx';
import ModalPortal from './ModalPortal.jsx';
import { 
  FiVideo, FiUsers, FiCheckCircle, FiXCircle, FiClock, FiCalendar,
  FiMessageCircle, FiBarChart2, FiUser, FiBriefcase, FiMapPin,
  FiMail, FiCpu, FiEye, FiTrash2, FiEdit2, FiPlus, FiSend,
  FiZap, FiTool, FiTarget, FiAward, FiFileText, FiFilter,
  FiSearch, FiRefreshCw, FiTrendingUp, FiStar, FiInfo,
  FiLock, FiUserCheck, FiLogOut, FiUpload, FiSettings,
  FiSave, FiX, FiAlertCircle, FiActivity, FiArrowRight, FiMessageSquare,
  FiInbox
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineCalendar } from 'react-icons/hi';

function EntretienRecruteur() {
    const { isDark } = useTheme();
    const [user, setUser] = useState(null);
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('tous');
    const [schedulingInterview, setSchedulingInterview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Variables de thème
    const textPrimary = isDark ? 'white' : '#0f172a';
    const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b';
    const textMuted = isDark ? 'rgba(255, 255, 255, 0.4)' : '#94a3b8';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0';
    const modalBg = isDark ? '#1e1e2d' : '#ffffff';
    const overlayBg = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';
    const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
    const inputBorder = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1';

    const icons = {
        video: <FiVideo size={16} />,
        robot: <FiCpu size={16} />,
        users: <FiUsers size={16} />,
        calendar: <FiCalendar size={14} />,
        clock: <FiClock size={14} />,
        checkCircle: <FiCheckCircle size={16} />,
        xCircle: <FiXCircle size={16} />,
        hourglass: <FiClock size={16} />,
        chart: <FiBarChart2 size={16} />,
        chat: <FiMessageCircle size={16} />
    };

    // --- FONCTIONS DE TEMPS SÉCURISÉES ---
    const isInterviewTime = (creneauChoisi) => {
        if (!creneauChoisi?.date || !creneauChoisi?.heureDebut) return false;
        
        const now = new Date();
        const dateStr = creneauChoisi.date.split('T')[0];
        const [year, month, day] = dateStr.split('-');
        const [hours, minutes] = creneauChoisi.heureDebut.split(':');
        
        const interviewDate = new Date(year, month - 1, day, hours, minutes, 0);
        const earlyAccess = new Date(interviewDate.getTime() - 5 * 60000);
        const interviewEnd = new Date(interviewDate.getTime() + 60 * 60000);
        
        return now >= earlyAccess && now <= interviewEnd;
    };

    const isInterviewPassed = (creneauChoisi) => {
        if (!creneauChoisi?.date || !creneauChoisi?.heureDebut) return false;
        const now = new Date();
        const dateStr = creneauChoisi.date.split('T')[0];
        const [year, month, day] = dateStr.split('-');
        const [hours, minutes] = creneauChoisi.heureDebut.split(':');
        
        const interviewEndTime = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0);
        interviewEndTime.setMinutes(interviewEndTime.getMinutes() + 60);
        
        return now > interviewEndTime;
    };

    const [customConfirm, setCustomConfirm] = useState({ show: false, message: '', onConfirm: null });

    const getTimeUntilInterview = (creneauChoisi) => {
        if (!creneauChoisi?.date || !creneauChoisi?.heureDebut) return null;
        const now = new Date();
        const dateStr = creneauChoisi.date.split('T')[0];
        const [year, month, day] = dateStr.split('-');
        const [hours, minutes] = creneauChoisi.heureDebut.split(':');
        
        const interviewDate = new Date(year, month - 1, day, hours, minutes, 0);
        const diffMs = interviewDate - now;
        
        if (diffMs <= 0) return 'Maintenant';
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) return `dans ${diffDays}j ${diffHours}h`;
        if (diffHours > 0) return `dans ${diffHours}h ${diffMinutes}m`;
        if (diffMinutes > 0) return `dans ${diffMinutes}min`;
        return 'Très bientôt';
    };

    // --- CHARGEMENT DES DONNÉES ---
    const fetchInterviews = async (recruteurId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/recruteur/${recruteurId}`);
            const offres = await res.json();
            
            let allInterviews = [];
            
            for (const offre of offres) {
                if (!offre.candidatures) continue;
                
                for (const candidature of offre.candidatures) {
                    if (
                        (candidature.interviewType === 'ai' && candidature.scoreEntretien) ||
                        (candidature.interviewType === 'reel' && candidature.creneauChoisi)
                    ) {
                        let etudiantNom = 'Candidat inconnu';
                        try {
                            const userRes = await fetch(`https://pfe-backend-five.vercel.app/users/${candidature.etudiantId}`);
                            if (userRes.ok) {
                                const userData = await userRes.json();
                                etudiantNom = `${userData.prenom} ${userData.nom}`;
                            }
                        } catch (e) { console.error("Erreur user", e); }

                        allInterviews.push({
                            ...candidature,
                            candidatureId: candidature._id,
                            offreId: offre._id,
                            offreTitre: offre.titre,
                            offreEntreprise: offre.entreprise,
                            offreLocalisation: offre.localisation,
                            etudiantNom: etudiantNom,
                            estTermine: ['embauché', 'refusée_final', 'proposition_envoyee', 'embauche_acceptee', 'embauche_refusee'].includes(candidature.statut)
                        });
                    }
                }
            }
            
            allInterviews.sort((a, b) => {
                if (a.creneauChoisi?.date && b.creneauChoisi?.date) {
                    return new Date(b.creneauChoisi.date) - new Date(a.creneauChoisi.date);
                }
                return 0;
            });

            setInterviews(allInterviews);
        } catch (err) {
            console.error("Erreur de chargement:", err);
            setMessage('❌ Erreur lors du chargement des entretiens.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            if (parsedUser.role === 'Recruteur') {
                fetchInterviews(parsedUser.id);
            } else {
                setLoading(false);
            }
        }
    }, []);

    // --- ACTIONS FINALES ---
    const handleFinalDecision = async (offreId, candidatureId, decision) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir ${decision === 'proposition_envoyee' ? 'FAIRE UNE PROPOSITION' : 'REFUSER DÉFINITIVEMENT'} ce candidat ?`)) return;
        
        setIsSubmitting(true);
        try {
            const commentaireFinal = decision === 'proposition_envoyee' 
                ? "Félicitations ! Suite à votre entretien, nous souhaitons vous faire une proposition de recrutement." 
                : "Suite à votre entretien, nous ne pouvons malheureusement pas donner suite à votre candidature.";

            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}/candidatures/${candidatureId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    statut: decision,
                    commentaire: commentaireFinal 
                })
            });

            if (res.ok) {
                setMessage(`✅ ${decision === 'proposition_envoyee' ? 'Proposition envoyée' : 'Candidat refusé'} avec succès.`);
                setShowModal(false);
                fetchInterviews(user.id); 
                setTimeout(() => setMessage(''), 4000);
            } else {
                setMessage(`❌ Erreur lors de l'enregistrement de la décision.`);
            }
        } catch (err) {
            console.error(err);
            setMessage(`❌ Impossible de contacter le serveur.`);
        } finally {
            setIsSubmitting(false);
        }
    };  

    const handleTerminerVisio = async (offreId, candidatureId) => {
        if (!window.confirm("Voulez-vous vraiment clôturer cet appel ? L'étudiant verra que l'entretien est terminé.")) return;
        
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}/candidatures/${candidatureId}/terminer-visio`, {
                method: 'PUT'
            });
            
            if (res.ok) {
                setMessage('✅ Entretien terminé. Vous pouvez maintenant saisir votre décision finale.');
                fetchInterviews(user.id);
            } else {
                setMessage('❌ Erreur lors de la clôture de l\'entretien.');
            }
        } catch (err) {
            setMessage('❌ Erreur de connexion au serveur.');
        }
    };

    const renderScoreBar = (label, score, max = 30) => {
        const percentage = (score / max) * 100;
        return (
            <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px', color: textSecondary }}>
                    <span>{label}</span>
                    <span style={{ fontWeight: 'bold', color: textPrimary }}>{score}/{max}</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: '3px' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #6c63ff, #8b5cf6)', borderRadius: '3px', transition: 'width 0.8s ease' }}></div>
                </div>
            </div>
        );
    };

    // Statistiques
    const stats = {
        total: interviews.length,
        real: interviews.filter(i => i.interviewType === 'reel').length,
        ai: interviews.filter(i => i.interviewType === 'ai').length,
        enAttente: interviews.filter(i => i.statut === 'en attente').length,
        enCours: interviews.filter(i => i.etapeEntretien === 'visio_en_cours').length,
        termines: interviews.filter(i => i.estTermine).length,
        aVenir: interviews.filter(i => i.creneauChoisi && !isInterviewPassed(i.creneauChoisi) && !isInterviewTime(i.creneauChoisi)).length
    };

    // Filtrage
    const filteredInterviews = interviews.filter(i => {
        const matchTab = activeTab === 'tous' || i.interviewType === activeTab;
        const matchSearch = !searchTerm || 
            i.etudiantNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.offreTitre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.offreEntreprise?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || 
            (filterStatus === 'termine' && i.estTermine) ||
            (filterStatus === 'en_cours' && i.etapeEntretien === 'visio_en_cours') ||
            (filterStatus === 'a_venir' && i.creneauChoisi && !isInterviewPassed(i.creneauChoisi) && !isInterviewTime(i.creneauChoisi)) ||
            (filterStatus === 'en_attente' && i.statut === 'en attente');
        return matchTab && matchSearch && matchStatus;
    });

    const safeMessageStr = String(message?.props?.children || message);
    const isErrorMessage = safeMessageStr.includes('Erreur') || safeMessageStr.includes('Impossible');

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: textSecondary }}>
                <div style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }}>
                    <FiActivity size={40} color="#6c63ff" />
                </div>
                <p style={{ fontWeight: 'bold', fontSize: '16px' }}>Chargement des entretiens...</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user || user.role !== 'Recruteur') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', padding: '48px', background: cardBg, borderRadius: '20px', border: cardBorder, maxWidth: '440px' }}>
                    <FiLock size={50} style={{ color: '#ef4444', marginBottom: '20px' }} />
                    <h2 style={{ color: textPrimary }}>Accès Restreint</h2>
                    <p style={{ color: textSecondary, marginBottom: '24px' }}>Accès réservé aux recruteurs.</p>
                    <Link to="/login">
                        <button style={{ padding: '12px 30px', background: 'linear-gradient(135deg, #6c63ff, #4834d4)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
                            Se connecter
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '40px', color: textPrimary }}>
            {/* En-tête avec icônes */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ 
                    fontSize: '32px', 
                    marginBottom: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    fontWeight: '700',
                    fontFamily: "'Quicksand', sans-serif"
                }}>
                    <span style={{ color: '#ff6b6b' }}><FiVideo size={28} /></span>
                    Suivi des Entretiens
                </h1>
                <p style={{ color: textSecondary, fontSize: '16px' }}>
                    Gérez vos appels en direct, consultez les évaluations IA et prenez vos décisions finales d'embauche.
                </p>
            </div>

            {/* Message Toast */}
            {message && (
                <div 
                    onClick={() => setMessage(null)}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <style>
                    {`
                        .animate-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                        .svg-icon { width: 80px; height: 80px; stroke-width: 3; margin: 0 auto 20px; display: block; }
                        .svg-circle { stroke-dasharray: 166; stroke-dashoffset: 166; fill: none; animation: drawStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
                        .svg-check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards; }
                        .svg-cross { stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards; }
                        @keyframes drawStroke { 100% { stroke-dashoffset: 0; } }
                    `}
                    </style>
                    <div className="animate-pop" style={{ background: '#ffffff', padding: '40px 50px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                        {isErrorMessage ? (
                            <svg className="svg-icon" style={{ stroke: '#ef4444' }} viewBox="0 0 52 52">
                                <circle className="svg-circle" cx="26" cy="26" r="25" />
                                <path className="svg-cross" fill="none" strokeLinecap="round" d="M16,16 L36,36 M36,16 L16,36" />
                            </svg>
                        ) : (
                            <svg className="svg-icon" style={{ stroke: '#10b981' }} viewBox="0 0 52 52">
                                <circle className="svg-circle" cx="26" cy="26" r="25" />
                                <path className="svg-check" fill="none" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                            </svg>
                        )}
                        <h3 style={{ margin: '0 0 10px 0', color: isErrorMessage ? '#ef4444' : '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
                            {isErrorMessage ? 'Erreur' : 'Succès !'}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '16px', margin: '0', lineHeight: '1.5' }}>{safeMessageStr}</p>
                    </div>
                </div>
            )}

            {/* Cartes de statistiques */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '14px', 
                marginBottom: '25px' 
            }}>
                <StatCard label="Total" value={stats.total} icon={<FiFileText size={20} />} color="#6c63ff" isDark={isDark} />
                <StatCard label="Entretiens Réels" value={stats.real} icon={<FiVideo size={20} />} color="#10b981" isDark={isDark} />
                <StatCard label="Entretiens IA" value={stats.ai} icon={<FiCpu size={20} />} color="#8b5cf6" isDark={isDark} />
                <StatCard label="En attente" value={stats.enAttente} icon={<FiClock size={20} />} color="#f59e0b" isDark={isDark} />
                <StatCard label="Visio en cours" value={stats.enCours} icon={<FiActivity size={20} />} color="#ef4444" isDark={isDark} />
                <StatCard label="À venir" value={stats.aVenir} icon={<FiCalendar size={20} />} color="#3b82f6" isDark={isDark} />
                <StatCard label="Terminés" value={stats.termines} icon={<FiCheckCircle size={20} />} color="#10b981" isDark={isDark} />
            </div>

            {/* Barre de filtres */}
            <div style={{
                background: cardBg,
                border: cardBorder,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '25px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                    <FiSearch size={16} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: textMuted
                    }} />
                    <input
                        type="text"
                        placeholder="Rechercher candidat, offre, entreprise..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 15px 10px 40px',
                            borderRadius: '10px',
                            background: inputBg,
                            border: inputBorder,
                            color: textPrimary,
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#6c63ff'}
                        onBlur={(e) => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1'}
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '10px',
                        background: inputBg,
                        border: inputBorder,
                        color: textPrimary,
                        fontSize: '14px',
                        cursor: 'pointer',
                        minWidth: '150px'
                    }}
                >
                    <option value="all">Tous les statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="a_venir">À venir</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminés</option>
                </select>

                {(searchTerm || filterStatus !== 'all') && (
                    <button
                        onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                        style={{
                            padding: '10px 16px',
                            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                            color: textSecondary,
                            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <FiRefreshCw size={14} /> Réinitialiser
                    </button>
                )}
            </div>

            {/* Onglets de filtrage - Design amélioré */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '25px',
                flexWrap: 'wrap',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                paddingBottom: '15px'
            }}>
                {[
                    { id: 'tous', label: 'Tous', icon: <FiFileText size={14} />, count: stats.total },
                    { id: 'reel', label: 'Entretiens Réels', icon: <FiVideo size={14} />, count: stats.real },
                    { id: 'ai', label: 'Entretiens IA', icon: <FiCpu size={14} />, count: stats.ai }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: activeTab === tab.id ? '600' : '500',
                            background: activeTab === tab.id 
                                ? `${isDark ? 'rgba(108,99,255,0.25)' : '#eef2ff'}`
                                : 'transparent',
                            color: activeTab === tab.id ? '#6c63ff' : textSecondary,
                            border: activeTab === tab.id 
                                ? '1px solid rgba(108,99,255,0.4)' 
                                : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== tab.id) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        <span style={{
                            background: activeTab === tab.id 
                                ? 'rgba(108,99,255,0.15)' 
                                : isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: activeTab === tab.id ? '#6c63ff' : textMuted
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Résultat de recherche */}
            <div style={{ marginBottom: '15px', color: textMuted, fontSize: '14px' }}>
                {filteredInterviews.length} entretien{filteredInterviews.length > 1 ? 's' : ''} trouvé{filteredInterviews.length > 1 ? 's' : ''}
            </div>

            {/* Liste des entretiens - Design amélioré */}
            <div style={{ display: 'grid', gap: '16px' }}>
                {filteredInterviews.length === 0 ? (
                    <div style={{ 
                        padding: '60px 20px', 
                        textAlign: 'center', 
                        color: textSecondary, 
                        background: cardBg, 
                        borderRadius: '20px', 
                        border: cardBorder 
                    }}>
                        <FiInbox size={50} style={{ opacity: 0.3, marginBottom: '15px', color: textMuted }} />
                        <h3 style={{ margin: '0 0 8px 0', color: textPrimary }}>Aucun entretien trouvé</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            {activeTab !== 'tous' 
                                ? `Aucun entretien ${activeTab === 'reel' ? 'réel' : 'IA'} à afficher.` 
                                : 'Aucun entretien à afficher pour le moment.'}
                        </p>
                    </div>
                ) : (
                    filteredInterviews.map((interview) => {
                        const isReal = interview.interviewType === 'reel';
                        const canJoin = isReal && isInterviewTime(interview.creneauChoisi);
                        const isPassed = isReal && isInterviewPassed(interview.creneauChoisi);
                        const timeUntil = isReal ? getTimeUntilInterview(interview.creneauChoisi) : null;
                        const hasDecision = ['embauché', 'refusée_final', 'proposition_envoyee', 'embauche_acceptee', 'embauche_refusee'].includes(interview.statut);

                        return (
                            <div 
                                key={interview.candidatureId} 
                                style={{
                                    background: cardBg,
                                    border: cardBorder,
                                    borderRadius: '16px',
                                    padding: '22px 25px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '16px',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    opacity: hasDecision ? 0.7 : 1
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.borderColor = '#6c63ff';
                                    e.currentTarget.style.boxShadow = isDark ? '0 8px 30px rgba(0,0,0,0.3)' : '0 8px 30px rgba(0,0,0,0.06)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Badge de statut en haut à droite */}
                                {hasDecision && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        background: interview.statut === 'embauché' || interview.statut === 'embauche_acceptee'
                                            ? 'rgba(16,185,129,0.15)'
                                            : 'rgba(239,68,68,0.15)',
                                        color: interview.statut === 'embauché' || interview.statut === 'embauche_acceptee'
                                            ? '#10b981'
                                            : '#ef4444'
                                    }}>
                                        {interview.statut === 'embauché' || interview.statut === 'embauche_acceptee' 
                                            ? '✅ Accepté' 
                                            : '❌ Refusé'}
                                    </div>
                                )}

                                {/* Info candidat */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '2', minWidth: '250px' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        minWidth: '50px',
                                        borderRadius: '14px',
                                        background: isReal 
                                            ? 'linear-gradient(135deg, #10b981, #059669)'
                                            : 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        boxShadow: isReal 
                                            ? '0 4px 12px rgba(16,185,129,0.3)'
                                            : '0 4px 12px rgba(108,99,255,0.3)'
                                    }}>
                                        {interview.etudiantNom?.charAt(0) || 'C'}
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                            <h3 style={{ color: textPrimary, margin: 0, fontSize: '17px', fontWeight: '600' }}>
                                                {interview.etudiantNom}
                                            </h3>
                                            {/* Type badge */}
                                            <span style={{
                                                fontSize: '11px',
                                                padding: '3px 12px',
                                                borderRadius: '20px',
                                                fontWeight: 'bold',
                                                background: isReal 
                                                    ? 'rgba(16,185,129,0.15)'
                                                    : 'rgba(108,99,255,0.15)',
                                                color: isReal ? '#10b981' : '#6c63ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}>
                                                {isReal ? <FiVideo size={12} /> : <FiCpu size={12} />}
                                                {isReal ? 'Réel' : 'IA'}
                                            </span>
                                        </div>
                                        <p style={{ color: textSecondary, margin: '4px 0 0 0', fontSize: '14px' }}>
                                            <FiBriefcase size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {interview.offreTitre}
                                            <span style={{ marginLeft: '12px', color: textMuted }}>
                                                <HiOutlineOfficeBuilding size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                {interview.offreEntreprise}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Info temps / score */}
                                <div style={{ flex: '1', minWidth: '150px' }}>
                                    {isReal ? (
                                        <div>
                                            {interview.creneauChoisi && (
                                                <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: textSecondary }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FiCalendar size={12} /> 
                                                        {new Date(interview.creneauChoisi.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FiClock size={12} /> 
                                                        {interview.creneauChoisi.heureDebut}
                                                    </span>
                                                </div>
                                            )}
                                            {!hasDecision && !canJoin && !isPassed && timeUntil && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    marginTop: '6px',
                                                    padding: '2px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    background: 'rgba(59,130,246,0.12)',
                                                    color: '#3b82f6'
                                                }}>
                                                    <FiClock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                    {timeUntil}
                                                </span>
                                            )}
                                            {canJoin && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    marginTop: '6px',
                                                    padding: '2px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    background: 'rgba(239,68,68,0.15)',
                                                    color: '#ef4444',
                                                    animation: 'pulse 2s infinite'
                                                }}>
                                                    <span style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        background: '#ef4444',
                                                        borderRadius: '50%',
                                                        display: 'inline-block',
                                                        marginRight: '6px'
                                                    }} />
                                                    EN DIRECT
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                                            <FiCheckCircle size={14} /> 
                                            Évalué (Score: {interview.scoreEntretien}/100)
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {isReal && !hasDecision && (
                                        <>
                                            {interview.statut !== 'evaluation_en_cours' && (
                                                <button
                                                    onClick={() => {
                                                        if (canJoin && interview.lienVisio) window.open(interview.lienVisio, '_blank');
                                                    }}
                                                    disabled={!canJoin || !interview.lienVisio}
                                                    style={{
                                                        padding: '10px 20px',
                                                        background: (canJoin && interview.lienVisio) 
                                                            ? 'linear-gradient(135deg, #10b981, #059669)' 
                                                            : isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0',
                                                        color: (canJoin && interview.lienVisio) ? 'white' : textMuted,
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        cursor: (canJoin && interview.lienVisio) ? 'pointer' : 'not-allowed',
                                                        fontWeight: 'bold',
                                                        fontSize: '13px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.3s',
                                                        boxShadow: (canJoin && interview.lienVisio) 
                                                            ? '0 4px 16px rgba(16,185,129,0.3)' 
                                                            : 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (canJoin && interview.lienVisio) {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.4)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (canJoin && interview.lienVisio) {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.3)';
                                                        }
                                                    }}
                                                >
                                                    {(canJoin && interview.lienVisio) ? (
                                                        <><FiVideo size={14} /> Rejoindre</>
                                                    ) : (
                                                        <><FiClock size={14} /> {timeUntil || 'En attente'}</>
                                                    )}
                                                </button>
                                            )}

                                            {interview.statut !== 'evaluation_en_cours' && canJoin && (
                                                <button 
                                                    onClick={() => handleTerminerVisio(interview.offreId, interview.candidatureId)}
                                                    style={{ 
                                                        padding: '10px 16px',
                                                        background: 'transparent',
                                                        border: '2px solid #ef4444',
                                                        color: '#ef4444',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '13px',
                                                        transition: 'all 0.3s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <FiXCircle size={14} /> Terminer
                                                </button>
                                            )}
                                            
                                            {(isPassed || interview.statut === 'evaluation_en_cours') && (
                                                <button 
                                                    onClick={() => { setSelectedInterview(interview); setShowModal(true); }}
                                                    style={{ 
                                                        padding: '10px 20px',
                                                        background: isDark ? 'rgba(108,99,255,0.2)' : '#eef2ff',
                                                        border: isDark ? '1px solid rgba(108,99,255,0.3)' : '1px solid #c7d2fe',
                                                        borderRadius: '10px',
                                                        cursor: 'pointer',
                                                        color: '#6c63ff',
                                                        fontWeight: 'bold',
                                                        fontSize: '13px',
                                                        transition: 'all 0.3s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(108,99,255,0.2)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <FiBarChart2 size={14} /> Décision
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {!isReal && !hasDecision && (
                                        <button 
                                            onClick={() => { setSelectedInterview(interview); setShowModal(true); }}
                                            style={{ 
                                                padding: '10px 20px',
                                                background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '13px',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                boxShadow: '0 4px 16px rgba(108,99,255,0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(108,99,255,0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(108,99,255,0.3)';
                                            }}
                                        >
                                            <FiEye size={14} /> Examiner
                                        </button>
                                    )}

                                    {hasDecision && (
                                        <button 
                                            onClick={() => { setSelectedInterview(interview); setShowModal(true); }}
                                            style={{ 
                                                padding: '10px 20px',
                                                background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                color: textSecondary,
                                                fontWeight: '500',
                                                fontSize: '13px',
                                                transition: 'all 0.3s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                            }}
                                        >
                                            <FiFileText size={14} /> Dossier
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL DE DÉCISION / DÉTAILS - Avec ModalPortal et fond flou complet */}
            {showModal && selectedInterview && (
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
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '20px',
                        margin: 0
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowModal(false);
                            setSelectedInterview(null);
                        }
                    }}
                    >
                        <div style={{
                            background: modalBg,
                            border: cardBorder,
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '820px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: isDark ? '0 25px 80px rgba(0,0,0,0.6)' : '0 25px 80px rgba(0,0,0,0.15)',
                            position: 'relative',
                            zIndex: 1001
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header Modal */}
                            <div style={{ 
                                padding: '20px 25px', 
                                borderBottom: cardBorder, 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                borderRadius: '24px 24px 0 0',
                                flexShrink: 0
                            }}>
                                <div>
                                    <h2 style={{ margin: 0, color: textPrimary, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiUser size={20} style={{ color: '#6c63ff' }} />
                                        Dossier de {selectedInterview.etudiantNom}
                                    </h2>
                                    <p style={{ margin: '4px 0 0 0', color: textSecondary, fontSize: '14px' }}>
                                        <FiBriefcase size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                        {selectedInterview.offreTitre} • {selectedInterview.offreEntreprise}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => { setShowModal(false); setSelectedInterview(null); }}
                                    style={{ 
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', 
                                        border: 'none', 
                                        color: textPrimary, 
                                        width: '38px', 
                                        height: '38px', 
                                        borderRadius: '50%', 
                                        cursor: 'pointer', 
                                        fontSize: '18px',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
                                    }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Body Modal */}
                            <div style={{ padding: '25px', overflowY: 'auto', flex: 1 }}>
                                {/* Section IA */}
                                {selectedInterview.interviewType === 'ai' && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '25px' }}>
                                            {/* Colonne Score */}
                                            <div style={{ 
                                                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                                                padding: '20px', 
                                                borderRadius: '16px',
                                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'
                                            }}>
                                                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                                    <div style={{ 
                                                        fontSize: '48px', 
                                                        fontWeight: 'bold', 
                                                        color: selectedInterview.scoreEntretien >= 70 ? '#10b981' : '#f59e0b',
                                                        fontFamily: "'Quicksand', sans-serif"
                                                    }}>
                                                        {selectedInterview.scoreEntretien}
                                                    </div>
                                                    <div style={{ color: textSecondary, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Score Global IA
                                                    </div>
                                                </div>
                                                {selectedInterview.scores && (
                                                    <div>
                                                        {renderScoreBar('Pertinence', selectedInterview.scores.pertinence, 30)}
                                                        {renderScoreBar('Technique', selectedInterview.scores.technique, 25)}
                                                        {renderScoreBar('Communication', selectedInterview.scores.communication, 20)}
                                                        {renderScoreBar('Motivation', selectedInterview.scores.motivation, 15)}
                                                        {renderScoreBar('Professionnalisme', selectedInterview.scores.professionnalisme, 10)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Colonne Commentaire & Historique */}
                                            <div>
                                                <h4 style={{ color: textPrimary, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
                                                    <FiMessageCircle size={16} style={{ color: '#6c63ff' }} /> Synthèse de l'IA
                                                </h4>
                                                <p style={{ 
                                                    color: textSecondary, 
                                                    background: isDark ? 'rgba(108,99,255,0.08)' : '#eef2ff', 
                                                    padding: '16px 18px', 
                                                    borderRadius: '12px', 
                                                    borderLeft: '4px solid #6c63ff', 
                                                    fontStyle: 'italic', 
                                                    fontSize: '14px', 
                                                    lineHeight: '1.7',
                                                    margin: '0 0 16px 0'
                                                }}>
                                                    "{selectedInterview.commentaireEntretien}"
                                                </p>

                                                <h4 style={{ color: textPrimary, margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
                                                    <FiMessageSquare size={16} style={{ color: '#6c63ff' }} /> Historique du Chat
                                                </h4>
                                                <div style={{ 
                                                    background: isDark ? 'rgba(0,0,0,0.25)' : '#f1f5f9', 
                                                    padding: '16px', 
                                                    borderRadius: '12px', 
                                                    height: '180px', 
                                                    overflowY: 'auto', 
                                                    fontSize: '13px', 
                                                    color: textSecondary,
                                                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'
                                                }}>
                                                    {selectedInterview.historiqueChat && selectedInterview.historiqueChat.length > 0 ? (
                                                        selectedInterview.historiqueChat.map((msg, idx) => (
                                                            <div key={idx} style={{ 
                                                                marginBottom: '8px', 
                                                                padding: '10px 14px', 
                                                                background: msg.role === 'user' 
                                                                    ? isDark ? 'rgba(108,99,255,0.15)' : '#eef2ff'
                                                                    : isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', 
                                                                borderRadius: '10px',
                                                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'
                                                            }}>
                                                                <strong style={{ color: msg.role === 'user' ? '#6c63ff' : textPrimary }}>
                                                                    {msg.role === 'user' ? 'Candidat' : 'IA'}:
                                                                </strong> 
                                                                <span style={{ color: textSecondary }}>{msg.content}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.6 }}>
                                                            <em>L'historique de la conversation n'a pas été sauvegardé.</em>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Section Réel */}
                                {selectedInterview.interviewType === 'reel' && (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '30px 20px',
                                        background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                        borderRadius: '16px',
                                        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ 
                                            fontSize: '48px', 
                                            color: '#10b981', 
                                            marginBottom: '15px',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}>
                                            <FiVideo size={48} />
                                        </div>
                                        <h3 style={{ color: textPrimary, marginBottom: '8px', fontSize: '20px' }}>
                                            Entretien Visioconférence
                                        </h3>
                                        <p style={{ color: textSecondary, fontSize: '15px', maxWidth: '450px', margin: '0 auto' }}>
                                            {isInterviewPassed(selectedInterview.creneauChoisi) 
                                                ? "L'entretien est terminé. Quelle est votre décision finale ?" 
                                                : "L'entretien est planifié ou en cours. Vous pourrez prendre votre décision une fois terminé."}
                                        </p>
                                        {selectedInterview.creneauChoisi && (
                                            <div style={{ 
                                                marginTop: '15px', 
                                                padding: '14px 20px', 
                                                background: isDark ? 'rgba(16,185,129,0.08)' : '#f0fdf4',
                                                borderRadius: '12px',
                                                display: 'inline-block',
                                                border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid #bbf7d0'
                                            }}>
                                                <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FiCalendar size={16} />
                                                    {new Date(selectedInterview.creneauChoisi.date).toLocaleDateString('fr-FR', { 
                                                        weekday: 'long', 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                    <FiClock size={16} style={{ marginLeft: '8px' }} />
                                                    {selectedInterview.creneauChoisi.heureDebut} - {selectedInterview.creneauChoisi.heureFin}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer Modal - Actions */}
                            {!(selectedInterview.statut === 'embauché' || selectedInterview.statut === 'refusée_final') && (
                                <div style={{ 
                                    padding: '20px 25px', 
                                    borderTop: cardBorder, 
                                    display: 'flex', 
                                    gap: '14px',
                                    background: isDark ? 'rgba(0,0,0,0.15)' : '#f8fafc',
                                    borderRadius: '0 0 24px 24px',
                                    flexWrap: 'wrap',
                                    flexShrink: 0
                                }}>
                                    {selectedInterview.interviewType === 'ai' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    // Close the decision modal and open the calendar
                                                    setShowModal(false);
                                                    setSchedulingInterview(selectedInterview);
                                                }}
                                                disabled={isSubmitting}
                                                style={{
                                                    flex: 1,
                                                    padding: '14px 24px',
                                                    background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.3s',
                                                    boxShadow: '0 4px 16px rgba(108,99,255,0.3)',
                                                    opacity: isSubmitting ? 0.6 : 1,
                                                    minWidth: '150px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSubmitting) {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(108,99,255,0.4)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(108,99,255,0.3)';
                                                }}
                                            >
                                                <FiCalendar size={18} /> Planifier un entretien réel
                                            </button>
                                            <button
                                                onClick={() => handleFinalDecision(selectedInterview.offreId, selectedInterview.candidatureId, 'refusée_final')}
                                                disabled={isSubmitting}
                                                style={{
                                                    padding: '14px 24px',
                                                    background: 'transparent',
                                                    color: '#ef4444',
                                                    border: '2px solid #ef4444',
                                                    borderRadius: '12px',
                                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '15px',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.3s',
                                                    opacity: isSubmitting ? 0.6 : 1,
                                                    minWidth: '150px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSubmitting) {
                                                        e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'transparent';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <FiXCircle size={18} /> Refuser définitivement
                                            </button>
                                        </>
                                    )}

                                    {selectedInterview.interviewType === 'reel' && (
                                        (isInterviewPassed(selectedInterview.creneauChoisi) || 
                                         selectedInterview.etapeEntretien === 'termine' || 
                                         selectedInterview.statut === 'evaluation_en_cours') ? (
                                            <>
                                                <button
                                                    onClick={() => handleFinalDecision(selectedInterview.offreId, selectedInterview.candidatureId, 'proposition_envoyee')}
                                                    disabled={isSubmitting}
                                                    style={{
                                                        flex: 1,
                                                        padding: '14px 24px',
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '15px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                                                        opacity: isSubmitting ? 0.6 : 1,
                                                        minWidth: '150px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSubmitting) {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(16,185,129,0.4)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.3)';
                                                    }}
                                                >
                                                    <FiSend size={18} /> Faire une proposition
                                                </button>
                                                <button
                                                    onClick={() => handleFinalDecision(selectedInterview.offreId, selectedInterview.candidatureId, 'refusée_final')}
                                                    disabled={isSubmitting}
                                                    style={{
                                                        padding: '14px 24px',
                                                        background: 'transparent',
                                                        color: '#ef4444',
                                                        border: '2px solid #ef4444',
                                                        borderRadius: '12px',
                                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '15px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        transition: 'all 0.3s',
                                                        opacity: isSubmitting ? 0.6 : 1,
                                                        minWidth: '150px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSubmitting) {
                                                            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <FiXCircle size={18} /> Refuser définitivement
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{ 
                                                width: '100%', 
                                                textAlign: 'center', 
                                                color: textSecondary, 
                                                padding: '12px',
                                                fontWeight: '500',
                                                fontSize: '14px'
                                            }}>
                                                <FiClock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                                                La décision finale sera disponible une fois l'entretien terminé.
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                            
                            {(selectedInterview.statut === 'embauché' || selectedInterview.statut === 'refusée_final') && (
                                <div style={{ 
                                    padding: '16px 25px', 
                                    borderTop: cardBorder, 
                                    textAlign: 'center', 
                                    color: textSecondary,
                                    background: isDark ? 'rgba(0,0,0,0.15)' : '#f8fafc',
                                    borderRadius: '0 0 24px 24px',
                                    fontSize: '14px',
                                    flexShrink: 0
                                }}>
                                    Ce dossier est clôturé. Décision : 
                                    <strong style={{ 
                                        color: selectedInterview.statut === 'embauché' || selectedInterview.statut === 'embauche_acceptee' 
                                            ? '#10b981' 
                                            : '#ef4444',
                                        marginLeft: '4px'
                                    }}>
                                        {selectedInterview.statut === 'embauché' || selectedInterview.statut === 'embauche_acceptee' 
                                            ? 'Embauché ✅' 
                                            : 'Refusé ❌'}
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* MODAL DE PLANIFICATION - CalendrierEntretien a déjà son propre overlay */}
            {schedulingInterview && (
                <CalendrierEntretien
                    offre={{ 
                        _id: schedulingInterview.offreId,
                        offreTitre: schedulingInterview.offreTitre,
                        entreprise: schedulingInterview.offreEntreprise,
                        etudiantName: schedulingInterview.etudiantNom
                    }}
                    onClose={() => {
                        setSchedulingInterview(null);
                        // Optionally reopen the decision modal if needed
                        // setShowModal(true);
                    }}
                    onConfirm={async (creneau) => {
                        try {
                            const safeCandidatureId = schedulingInterview.candidatureId || schedulingInterview._id;
                            const safeOffreId = schedulingInterview.offreId || schedulingInterview.idOffre || schedulingInterview.offre?._id;
                            const safeEtudiantId = schedulingInterview.etudiantId?._id || schedulingInterview.etudiantId || schedulingInterview.etudiant?._id;

                            console.log('📅 Planning interview with:', { safeCandidatureId, safeOffreId, safeEtudiantId, creneau });

                            // 1. UPDATE STATUS: Tell the database this is now a Real Interview
                            const updateRes = await fetch(`https://pfe-backend-five.vercel.app/offres/${safeOffreId}/candidatures/${safeCandidatureId}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    statut: 'acceptée',
                                    commentaire: `Suite à votre évaluation IA, un entretien réel a été planifié le ${creneau.date} à ${creneau.heureDebut}`,
                                    interviewType: 'reel',
                                    etapeEntretien: 'creneau_choisi'
                                })
                            });

                            if (!updateRes.ok) {
                                const errorText = await updateRes.text();
                                console.error('❌ Failed to update candidature:', errorText);
                                setMessage('❌ Erreur lors de la mise à jour de la candidature.');
                                setSchedulingInterview(null);
                                return;
                            }

                            // 2. SCHEDULE SLOT: Planify the interview
                            const planifyRes = await fetch(`https://pfe-backend-five.vercel.app/creneaux/planifier-recruteur`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    idCandidature: safeCandidatureId,
                                    idOffre: safeOffreId,
                                    idEtudiant: safeEtudiantId,
                                    idRecruteur: user.id,
                                    date: creneau.date,
                                    heureDebut: creneau.heureDebut,
                                    heureFin: creneau.heureFin
                                })
                            });

                            const planifyData = await planifyRes.json();

                            if (planifyRes.ok) {
                                setMessage(`✅ Entretien réel planifié avec succès pour le ${creneau.date} à ${creneau.heureDebut}.`);
                                setSchedulingInterview(null);
                                setShowModal(false);
                                fetchInterviews(user.id);
                                setTimeout(() => setMessage(''), 5000);
                            } else {
                                console.error('❌ Failed to schedule:', planifyData);
                                setMessage('❌ Erreur lors de la planification.');
                                setSchedulingInterview(null);
                            }
                        } catch (err) {
                            console.error('❌ Error:', err);
                            setMessage('❌ Erreur de connexion au serveur.');
                            setSchedulingInterview(null);
                        }
                    }}
                    mode="recruteur"
                />
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
                .stat-card-enhanced {
                    transition: all 0.3s ease;
                }
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

// Composant StatCard réutilisable
const StatCard = ({ label, value, icon, color, isDark }) => (
    <div style={{
        background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'all 0.3s ease',
        cursor: 'default'
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.06)';
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
        e.currentTarget.style.boxShadow = 'none';
    }}>
        <div style={{
            width: '42px',
            height: '42px',
            minWidth: '42px',
            borderRadius: '12px',
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: '18px'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: isDark ? '#fefae0' : '#0f172a',
                fontFamily: "'Quicksand', sans-serif",
                lineHeight: 1.2
            }}>
                {value}
            </div>
            <div style={{ 
                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                fontSize: '12px',
                fontWeight: '500'
            }}>
                {label}
            </div>
        </div>
    </div>
);

export default EntretienRecruteur;