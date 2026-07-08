// Propositions.jsx - Design amélioré avec données complètes
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext.jsx';
import { 
  FiAward, FiCheckCircle, FiXCircle, FiClock, FiInbox, 
  FiBriefcase, FiUser, FiMapPin 
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';

function Propositions() {
    const { isDark } = useTheme();
    const [user, setUser] = useState(null);
    const [propositions, setPropositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Theme Variables
    const textPrimary = isDark ? 'white' : '#0f172a';
    const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b';
    const textMuted = isDark ? 'rgba(255, 255, 255, 0.35)' : '#94a3b8';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0';

    // Couleur selon le rôle
    const getRoleColor = () => {
        const role = user?.role;
        if (role === 'Etudiant') return '#6366f1';
        if (role === 'Recruteur') return '#f59e0b';
        return '#6c63ff';
    };
    const roleColor = getRoleColor();
    const isEtudiant = user?.role === 'Etudiant';
    const isRecruteur = user?.role === 'Recruteur';

    // SVG Icons
    const icons = {
        briefcase: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
        ),
        building: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                <line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/>
                <line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/>
                <line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/>
            </svg>
        ),
        user: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
        ),
        checkCircle: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        ),
        xCircle: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
        ),
        hourglass: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2h12M6 22h12M12 14c2.5 0 4-1.5 4-4V6H8v4c0 2.5 1.5 4 4 4z"/>
                <path d="M12 10c-2.5 0-4 1.5-4 4v4h8v-4c0-2.5-1.5-4-4-4z"/>
            </svg>
        ),
        inbox: (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
        ),
        spinner: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
        )
    };

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
            fetchPropositions(userData);
        }
    }, []);

    const fetchPropositions = async (userData) => {
        setLoading(true);
        try {
            if (userData.role === 'Etudiant') {
                const res = await fetch(`https://pfe-backend-five.vercel.app/candidatures/etudiant/${userData.id}`);
                const data = await res.json();
                
                // Deduplicate by offreId using Map
                const uniqueMap = new Map();
                
                data.forEach(c => {
                    if (['proposition_envoyee', 'embauche_acceptee', 'embauche_refusee'].includes(c.statutCandidature)) {
                        if (!uniqueMap.has(c.offreId)) {
                            uniqueMap.set(c.offreId, {
                                ...c,
                                statut: c.statutCandidature,
                                entreprise: c.entreprise || 'Entreprise inconnue'
                            });
                        }
                    }
                });
                
                let finalStages = Array.from(uniqueMap.values());
                finalStages.sort((a, b) => {
                    if (a.statut === 'proposition_envoyee' && b.statut !== 'proposition_envoyee') return -1;
                    if (a.statut !== 'proposition_envoyee' && b.statut === 'proposition_envoyee') return 1;
                    return 0;
                });
                
                setPropositions(finalStages);
                
            } else if (userData.role === 'Recruteur') {
                const res = await fetch(`https://pfe-backend-five.vercel.app/offres/recruteur/${userData.id}`);
                const data = await res.json();
                const offres = data.offers || data;
                
                const promises = offres.flatMap(offre => 
                    (offre.candidatures || [])
                        .filter(c => ['proposition_envoyee', 'embauche_acceptee', 'embauche_refusee'].includes(c.statut))
                        .map(async c => {
                            let candidatNom = 'Candidat inconnu';
                            try {
                                const userRes = await fetch(`https://pfe-backend-five.vercel.app/users/${c.etudiantId}`);
                                if (userRes.ok) {
                                    const uData = await userRes.json();
                                    candidatNom = `${uData.prenom} ${uData.nom}`;
                                }
                            } catch (e) {
                                console.error("Could not fetch user", e);
                            }
                            return { 
                                ...c, 
                                offreInfo: offre, 
                                candidatNom,
                                offreTitre: offre.titre,
                                entreprise: offre.entreprise,
                                localisation: offre.localisation,
                                dateCandidature: c.dateCandidature
                            };
                        })
                );
                
                let finalCandidates = await Promise.all(promises);
                finalCandidates.sort((a, b) => {
                    if (a.statut === 'proposition_envoyee' && b.statut !== 'proposition_envoyee') return -1;
                    if (a.statut !== 'proposition_envoyee' && b.statut === 'proposition_envoyee') return 1;
                    return 0;
                });
                
                setPropositions(finalCandidates);
            }
        } catch (error) {
            console.error("Erreur:", error);
            setMessage('❌ Erreur lors du chargement des propositions.');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentDecision = async (offreId, decision) => {
       
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/candidatures/${offreId}/${user.id}/decision`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision })
            });
            
            if (res.ok) {
                // Remove the proposition from the list immediately
                setPropositions(prevPropositions => 
                    prevPropositions.filter(prop => prop.offreId !== offreId)
                );
                
                setMessage(decision === 'embauche_acceptee' ? 'Félicitations ! Vous avez accepté le poste.' : 'Vous avez décliné l\'offre avec succès.');
                setTimeout(() => setMessage(''), 4000);
            } else {
                const data = await res.json();
                setMessage('❌ ' + (data.error || 'Erreur lors de l\'enregistrement de votre décision.'));
            }
        } catch (err) {
            console.error("Decision error:", err);
            setMessage('❌ Erreur de connexion au serveur.');
        }
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
                color: textSecondary 
            }}>
                {icons.spinner}
                <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '16px' }}>
                    Chargement des propositions...
                </p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const safeMessageStr = String(message?.props?.children || message);
    const isErrorMessage = safeMessageStr.includes('Erreur') || safeMessageStr.includes('Impossible');

    return (
        <div style={{ 
            padding: '30px', 
            color: textPrimary, 
            maxWidth: '1200px', 
            margin: '0 auto' 
        }}>
            
            {/* Header */}
            <div style={{ 
                marginBottom: '35px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                flexWrap: 'wrap',
                justifyContent: 'space-between'
            }}>
                <div>
                    <h1 style={{ 
                        fontSize: '32px', 
                        marginBottom: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        fontWeight: '600',
                        fontFamily: "'Quicksand', sans-serif"
                    }}>
                        <FiAward style={{ color: '#ff6b6b' }} /> Suivi des Propositions
                    </h1>
                    <p style={{ color: textSecondary, fontSize: '16px', margin: 0 }}>
                        {isEtudiant 
                            ? 'Félicitations ! Ces entreprises souhaitent vous recruter définitivement. Examinez leurs offres.'
                            : 'Consultez les réponses des candidats à qui vous avez fait une offre définitive d\'embauche.'}
                    </p>
                </div>
            </div>

            {/* Notification Toast */}
            {message && (
                <div 
                    onClick={() => setMessage(null)} 
                    style={{
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0,
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
                        .svg-icon { width: 80px; height: 80px; stroke-width: 3; stroke-miterlimit: 10; margin: 0 auto 20px; display: block; }
                        .svg-circle { stroke-dasharray: 166; stroke-dashoffset: 166; fill: none; animation: drawStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
                        .svg-check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards; }
                        .svg-cross { stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards; }
                        @keyframes drawStroke { 100% { stroke-dashoffset: 0; } }
                    `}
                    </style>
                    <div className="animate-pop" style={{ 
                        background: '#ffffff', 
                        padding: '40px 50px', 
                        borderRadius: '24px', 
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', 
                        textAlign: 'center', 
                        maxWidth: '400px', 
                        width: '90%' 
                    }}>
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

            {/* Liste des propositions */}
            <div style={{ display: 'grid', gap: '18px' }}>
                {propositions.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '70px 20px', 
                        color: textSecondary, 
                        background: cardBg, 
                        borderRadius: '20px', 
                        border: cardBorder,
                        boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                        {icons.inbox}
                        <h3 style={{ margin: '15px 0 8px 0', color: textPrimary, fontSize: '20px' }}>
                            Aucune proposition
                        </h3>
                        <p style={{ margin: 0, fontSize: '15px' }}>
                            {isEtudiant 
                                ? "Vous n'avez pas encore reçu de proposition d'embauche définitive."
                                : "Vous n'avez pas encore fait de proposition d'embauche à un candidat."}
                        </p>
                    </div>
                ) : (
                    propositions.map((prop, index) => {
                        const isPending = prop.statut === 'proposition_envoyee';
                        const isAccepted = prop.statut === 'embauche_acceptee';
                        const isRefused = prop.statut === 'embauche_refusee';
                        
                        return (
                            <div 
                                key={index} 
                                style={{ 
                                    background: cardBg,
                                    border: isPending 
                                        ? (isDark ? `1px solid ${roleColor}40` : `1px solid ${roleColor}30`)
                                        : cardBorder,
                                    borderRadius: '16px',
                                    padding: '24px 28px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '16px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isPending 
                                        ? (isDark ? `0 0 0 1px ${roleColor}20` : `0 0 0 1px ${roleColor}20`)
                                        : (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.03)'),
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = isDark 
                                        ? '0 10px 30px rgba(0,0,0,0.25)' 
                                        : '0 10px 30px rgba(0,0,0,0.06)';
                                    if (!isPending) {
                                        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = isPending 
                                        ? (isDark ? `0 0 0 1px ${roleColor}20` : `0 0 0 1px ${roleColor}20`)
                                        : (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.03)');
                                    if (!isPending) {
                                        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                                    }
                                }}
                            >
                                {/* Badge de statut */}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 14px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: isPending 
                                        ? (isDark ? `rgba(245,158,11,0.15)` : '#fffbeb')
                                        : isAccepted 
                                        ? (isDark ? 'rgba(16,185,129,0.15)' : '#f0fdf4')
                                        : (isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2'),
                                    color: isPending ? '#f59e0b' : isAccepted ? '#10b981' : '#ef4444'
                                }}>
                                    {isPending ? icons.hourglass : isAccepted ? icons.checkCircle : icons.xCircle}
                                    {isPending 
                                        ? (isEtudiant ? 'À répondre' : 'En attente') 
                                        : isAccepted ? 'Acceptée' : 'Refusée'}
                                </div>

                                {/* Partie gauche - Détails */}
                                <div style={{ flex: '1', minWidth: '220px', paddingRight: '100px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            minWidth: '44px',
                                            borderRadius: '12px',
                                            background: isPending 
                                                ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`
                                                : isAccepted
                                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                                : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '18px',
                                            fontWeight: 'bold'
                                        }}>
                                            {isEtudiant 
                                                ? prop.entreprise?.charAt(0).toUpperCase() || 'E'
                                                : prop.candidatNom?.charAt(0).toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <h3 style={{ 
                                                fontSize: '18px', 
                                                margin: 0, 
                                                color: textPrimary,
                                                fontWeight: '600'
                                            }}>
                                                {isEtudiant ? prop.offreTitre : prop.offreInfo?.titre || 'Offre inconnue'}
                                            </h3>
                                            <div style={{ 
                                                color: textSecondary, 
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginTop: '2px',
                                                flexWrap: 'wrap'
                                            }}>
                                                {isEtudiant ? (
                                                    <>
                                                        <FiBriefcase size={14} />
                                                        <span style={{ fontWeight: '500', color: textPrimary }}>
                                                            {prop.entreprise || 'Entreprise inconnue'}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUser size={14} />
                                                        {prop.candidatNom}
                                                    </>
                                                )}
                                            </div>
                                            {isEtudiant && prop.localisation && (
                                                <div style={{ 
                                                    color: textMuted, 
                                                    fontSize: '12px',
                                                    marginTop: '2px'
                                                }}>
                                                    <FiMapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                    {prop.localisation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Partie droite - Actions */}
                                {isEtudiant && isPending && (
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '10px', 
                                        flexWrap: 'wrap',
                                        marginLeft: 'auto'
                                    }}>
                                        <button 
                                            onClick={() => handleStudentDecision(prop.offreId, 'embauche_acceptee')}
                                            style={{ 
                                                padding: '12px 28px',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 4px 16px rgba(16,185,129,0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(16,185,129,0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.3)';
                                            }}
                                        >
                                            {icons.checkCircle} Accepter
                                        </button>
                                        <button 
                                            onClick={() => handleStudentDecision(prop.offreId, 'embauche_refusee')}
                                            style={{ 
                                                padding: '12px 28px',
                                                background: 'transparent',
                                                color: '#ef4444',
                                                border: '2px solid #ef4444',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s'
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
                                            {icons.xCircle} Décliner
                                        </button>
                                    </div>
                                )}

                                {/* Pour les recruteurs ou propositions déjà traitées */}
                                {(isRecruteur || !isPending) && (
                                    <div style={{ 
                                        marginLeft: 'auto',
                                        color: textMuted,
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                       
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

export default Propositions;