// EspEntretien.jsx - Fixed imports and hooks
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext.jsx';
import { 
  FiLock, FiMapPin, FiMessageCircle, FiSend, 
  FiCalendar, FiVideo, FiCheckCircle, FiXCircle, FiMessageSquare,
  FiArrowLeft, FiBriefcase, FiMail, FiInbox, FiBarChart2, FiX, 
  FiZap, FiAlertCircle, FiInfo, FiClock, FiUsers, FiUser,
  FiTarget, FiCode, FiUserCheck, FiTrendingUp,
  FiAward, FiCpu, FiGlobe, FiBookOpen
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineCalendar } from 'react-icons/hi';

function EspEntretien() {
    const { isDark, theme } = useTheme();
    const [user, setUser] = useState(null);
    const [acceptedOffers, setAcceptedOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [interviewActive, setInterviewActive] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [finalScore, setFinalScore] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');

    // Helper to get role color
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
                    fetchAcceptedOffers(parsedUser.id);
                }
            } catch (error) {
                console.error("Error:", error);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchAcceptedOffers = async (studentId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/candidatures/etudiant/${studentId}`);
            const candidatures = await res.json();
            
            const accepted = candidatures.filter(c => c.statutCandidature === 'acceptée');
            
            const acceptedWithDetails = await Promise.all(accepted.map(async (candidature) => {
                try {
                    const offreRes = await fetch(`https://pfe-backend-five.vercel.app/offres/${candidature.offreId}`);
                    if (offreRes.ok) {
                        const fullOffre = await offreRes.json();
                        const myCandidature = fullOffre.candidatures?.find(
                            c => c._id.toString() === candidature.candidatureId.toString()
                        );
                        if (myCandidature) {
                            return {
                                ...candidature,
                                interviewType: myCandidature.interviewType,
                                etapeEntretien: myCandidature.etapeEntretien,
                                creneauChoisi: myCandidature.creneauChoisi,
                                lienVisio: myCandidature.lienVisio,
                                scoreEntretien: myCandidature.scoreEntretien,
                                commentaireEntretien: myCandidature.commentaireEntretien,
                                scores: myCandidature.scores || {}
                            };
                        }
                    }
                } catch (err) {
                    console.error("Error:", err);
                }
                return candidature;
            }));
            
            setAcceptedOffers(acceptedWithDetails);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const isInterviewTime = (offer) => {
        if (!offer.creneauChoisi?.date || !offer.creneauChoisi?.heureDebut) return false;
        const now = new Date();
        const dateStr = offer.creneauChoisi.date.split('T')[0];
        const [year, month, day] = dateStr.split('-');
        const [hours, minutes] = offer.creneauChoisi.heureDebut.split(':');
        const interviewDate = new Date(year, month - 1, day, hours, minutes, 0);
        const earlyAccess = new Date(interviewDate.getTime() - 5 * 60000);
        const interviewEnd = new Date(interviewDate.getTime() + 60 * 60000);
        return now >= earlyAccess && now <= interviewEnd;
    };

    const getTimeUntilInterview = (offer) => {
        if (!offer.creneauChoisi?.date || !offer.creneauChoisi?.heureDebut) return null;
        const now = new Date();
        const dateStr = offer.creneauChoisi.date.split('T')[0];
        const [year, month, day] = dateStr.split('-');
        const [hours, minutes] = offer.creneauChoisi.heureDebut.split(':');
        const interviewDate = new Date(year, month - 1, day, hours, minutes, 0);
        const diffMs = interviewDate - now;
        if (diffMs <= 0) return 'Maintenant';
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (diffDays > 0) return `dans ${diffDays} j et ${diffHours} h`;
        if (diffHours > 0) return `dans ${diffHours} h et ${diffMinutes} min`;
        if (diffMinutes > 0) return `dans ${diffMinutes} min`;
        return 'Très bientôt';
    };

    const handleOpenChat = (offer) => {
        if (offer.scoreEntretien !== undefined && offer.scoreEntretien !== null && offer.scoreEntretien > 0) {
            setSelectedOffer(offer);
            setInterviewActive(false);
            setQuestionCount(0);
            setShowScore(true);
            const existingScores = offer.scores || {
                pertinence: 0, technique: 0, communication: 0, motivation: 0, professionnalisme: 0
            };
            setFinalScore({
                scoreTotal: offer.scoreEntretien,
                scores: existingScores,
                commentaire: offer.commentaireEntretien || "Évaluation déjà complétée"
            });
            setChatMessages([{
                type: 'bot',
                message: 'Vous avez déjà complété cet entretien. Voici vos résultats :',
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }]);
            return;
        }
        setSelectedOffer(offer);
        setInterviewActive(true);
        setQuestionCount(0);
        setShowScore(false);
        setFinalScore(null);
        const initialMessage = {
            type: 'bot',
            message: `Bonjour, je suis le recruteur de ${offer.entreprise}. Merci de vous présenter à cet entretien pour le poste de "${offer.offreTitre}".\n\nPour commencer, parlez-moi un peu de vous et de votre parcours.`,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([initialMessage]);
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !interviewActive) return;

        const newUserMessage = {
            type: 'user',
            message: inputMessage,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };

        const updatedMessages = [...chatMessages, newUserMessage];
        setChatMessages(updatedMessages);
        setInputMessage('');
        const newQuestionCount = questionCount + 1;
        setQuestionCount(newQuestionCount);

        try {
            if (newQuestionCount >= 6) {
                setInterviewActive(false);
                const fullConversation = updatedMessages.map(m => 
                    `${m.type === 'bot' ? 'RECRUTEUR' : 'CANDIDAT'}: ${m.message}`
                ).join('\n');
                
                try {
                    const scoreRes = await fetch('https://pfe-backend-five.vercel.app/chat/score-interview', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            conversation: fullConversation,
                            offreTitre: selectedOffer.offreTitre,
                            entreprise: selectedOffer.entreprise,
                            competences: selectedOffer.competences,
                            offreId: selectedOffer.offreId,
                            candidatureId: selectedOffer.candidatureId
                        })
                    });
                    const scoreData = await scoreRes.json();
                    const finalScoreData = {
                        scoreTotal: scoreData.scoreTotal || 70,
                        scores: {
                            pertinence: scoreData.scores?.pertinence || 20,
                            technique: scoreData.scores?.technique || 18,
                            communication: scoreData.scores?.communication || 14,
                            motivation: scoreData.scores?.motivation || 10,
                            professionnalisme: scoreData.scores?.professionnalisme || 8
                        },
                        commentaire: scoreData.commentaire || "Évaluation complétée."
                    };
                    setFinalScore(finalScoreData);
                    setShowScore(true);
                    
                    try {
                        const saveRes = await fetch(`https://pfe-backend-five.vercel.app/offres/${selectedOffer.offreId}/candidatures/${selectedOffer.candidatureId}/score`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                scoreEntretien: finalScoreData.scoreTotal,
                                commentaireEntretien: finalScoreData.commentaire,
                                scores: finalScoreData.scores
                            })
                        });
                        if (saveRes.ok) {
                            console.log('✅ Score saved to database');
                        }
                    } catch (saveErr) {
                        console.error('❌ Error saving score:', saveErr);
                    }
                    
                    setChatMessages(prev => [...prev, {
                        type: 'bot',
                        message: `L'entretien est terminé. Merci pour votre temps ! Voici votre évaluation...`,
                        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    }]);
                } catch (scoreErr) {
                    console.error("Score error:", scoreErr);
                    const fallbackScoreData = {
                        scoreTotal: 70,
                        scores: { pertinence: 20, technique: 18, communication: 14, motivation: 10, professionnalisme: 8 },
                        commentaire: "L'évaluation sera disponible prochainement."
                    };
                    setFinalScore(fallbackScoreData);
                    setShowScore(true);
                }
            } else {
                const historique = chatMessages.map(m => 
                    `${m.type === 'bot' ? 'RECRUTEUR' : 'CANDIDAT'}: ${m.message}`
                ).join('\n');

                const res = await fetch('https://pfe-backend-five.vercel.app/chat/interview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: inputMessage,
                        offreTitre: selectedOffer.offreTitre,
                        entreprise: selectedOffer.entreprise,
                        competences: selectedOffer.competences,
                        typeContrat: selectedOffer.typeContrat,
                        historique: historique
                    })
                });
                
                if (!res.ok) {
                    setChatMessages(prev => [...prev, {
                        type: 'bot',
                        message: "Une erreur est survenue. Veuillez réessayer.",
                        time: new Date().toLocaleTimeString('fr-FR')
                    }]);
                    return;
                }
                const data = await res.json();
                setChatMessages(prev => [...prev, {
                    type: 'bot',
                    message: data.reply || "Pouvez-vous développer votre réponse ?",
                    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            setChatMessages(prev => [...prev, {
                type: 'bot',
                message: "Une erreur est survenue. Veuillez réessayer.",
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleBackToList = () => {
        setSelectedOffer(null);
        setChatMessages([]);
    };

    const handleJoinVideo = (lienVisio) => {
        window.open(lienVisio, '_blank');
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
                Chargement...
            </p>
        </div>
    );
}

    if (!user || user.role !== 'Etudiant') {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                width: '100%',
                background: isDark ? '#0f172a' : '#f1f5f9'
            }}>
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
                    <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Connectez-vous en tant qu'étudiant pour accéder à l'espace entretien.</p>
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
            {!selectedOffer ? (
                <>
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
                                <FiVideo style={{ color: '#6366f1' }} /> Espace Entretien
                            </h1>
                            <p style={{ 
                                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                fontSize: '16px' 
                            }}>
                                Préparez vos entretiens avec notre assistant IA pour les offres où votre candidature a été acceptée.
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
                                           messageType === 'error' ? '#ef4444' : 
                                           messageType === 'warning' ? '#f59e0b' : '#6c63ff',
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
                                 messageType === 'error' ? <FiXCircle size={20} /> : 
                                 messageType === 'warning' ? <FiClock size={20} /> : <FiInfo size={20} />}
                                {message}
                            </div>
                        </div>
                    )}

                    {/* Accepted Offers List */}
                    {acceptedOffers.length === 0 ? (
                        <div style={{
                            textAlign: 'center', 
                            padding: '80px 20px',
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            borderRadius: '20px', 
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <FiInbox size={60} style={{ color: isDark ? 'rgba(254,250,224,0.2)' : '#94a3b8', marginBottom: '20px' }} />
                            <h3 style={{ color: isDark ? '#fefae0' : '#0f172a', marginBottom: '10px' }}>Aucun entretien disponible</h3>
                            <p style={{ color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', marginBottom: '30px' }}>
                                Vous n'avez pas encore de candidatures acceptées. Continuez à postuler !
                            </p>
                            <Link to="/dashboard/offres">
                                <button style={{
                                    padding: '12px 30px',
                                    background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
                                    color: 'white', border: 'none', borderRadius: '10px',
                                    cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <FiBriefcase style={{ display: 'inline', marginRight: '8px' }} /> Voir les offres
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {acceptedOffers.map((offer) => {
                                const isRealInterview = offer.interviewType === 'reel';
                                const hasCreneau = offer.creneauChoisi && offer.creneauChoisi.date;
                                const isTermine = offer.etapeEntretien === 'termine' || 
                                                  offer.statut === 'evaluation_en_cours' || 
                                                  offer.statut === 'embauché' || 
                                                  offer.statut === 'refusée_final';
                                const canJoin = isRealInterview && hasCreneau && isInterviewTime(offer) && !isTermine && offer.lienVisio;
                                const timeUntil = hasCreneau ? getTimeUntilInterview(offer) : null;
                                
                                let interviewPassed = false;
                                if (isTermine) {
                                    interviewPassed = true;
                                } else if (hasCreneau && offer.creneauChoisi?.heureDebut) {
                                    const now = new Date();
                                    const dateStr = offer.creneauChoisi.date.split('T')[0];
                                    const [year, month, day] = dateStr.split('-');
                                    const [hours, minutes] = offer.creneauChoisi.heureDebut.split(':');
                                    const interviewEndTime = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes), 0);
                                    interviewEndTime.setMinutes(interviewEndTime.getMinutes() + 60);
                                    interviewPassed = now > interviewEndTime && !canJoin;
                                }

                                return (
                                    <div key={offer.candidatureId} className="interview-card" style={{
                                        background: isRealInterview 
                                            ? (isDark ? 'rgba(40, 167, 69, 0.08)' : '#f0fdf4')
                                            : (isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'),
                                        border: isRealInterview
                                            ? (isDark ? '1px solid rgba(40, 167, 69, 0.2)' : '1px solid #bbf7d0')
                                            : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'),
                                        borderRadius: '20px',
                                        padding: '25px',
                                        transition: 'all 0.3s ease',
                                        cursor: isRealInterview && canJoin ? 'pointer' : 'default',
                                        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (isRealInterview && canJoin) {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.08)';
                                            e.currentTarget.style.borderColor = 'rgba(40, 167, 69, 0.5)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (isRealInterview && canJoin) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.04)';
                                            e.currentTarget.style.borderColor = isDark ? 'rgba(40, 167, 69, 0.2)' : '#bbf7d0';
                                        }
                                    }}>
                                        {/* Live indicator - SEPARATE from button */}
                                        {canJoin && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                background: '#ef4444',
                                                color: 'white',
                                                padding: '6px 16px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: 'bold',
                                                animation: 'pulse 2s infinite',
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px'
                                            }}>
                                                <span style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    display: 'inline-block',
                                                    animation: 'pulse 1.5s infinite'
                                                }} />
                                                EN DIRECT
                                            </div>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            flexWrap: 'wrap',
                                            gap: '20px'
                                        }}>
                                            {/* Left side - Offer info */}
                                            <div style={{ flex: 2, minWidth: '250px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                    <h3 style={{ 
                                                        color: isDark ? '#fefae0' : '#0f172a', 
                                                        fontSize: '20px', 
                                                        margin: 0, 
                                                        fontWeight: '600' 
                                                    }}>
                                                        {offer.offreTitre}
                                                    </h3>
                                                    
                                                    {/* Interview Type Badge */}
                                                    <span style={{
                                                        background: isRealInterview
                                                            ? 'rgba(40, 167, 69, 0.2)'
                                                            : 'rgba(108, 99, 255, 0.2)',
                                                        color: isRealInterview ? '#28a745' : '#6c63ff',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        {isRealInterview ? <FiUsers size={12} /> : <FiCpu size={12} />}
                                                        {isRealInterview ? 'Entretien Réel' : 'Entretien IA'}
                                                    </span>
                                                </div>
                                                
                                                <p style={{ 
                                                    color: roleColor, 
                                                    fontSize: '14px', 
                                                    marginBottom: '10px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '12px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    <span><HiOutlineOfficeBuilding style={{ display: 'inline', marginRight: '4px' }} /> {offer.entreprise}</span>
                                                    <span><FiMapPin style={{ display: 'inline', marginRight: '4px' }} /> {offer.localisation}</span>
                                                </p>
                                                
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                                    <span style={{
                                                        background: `${roleColor}20`,
                                                        color: roleColor,
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '12px'
                                                    }}>
                                                        {offer.typeContrat}
                                                    </span>
                                                    {offer.salaire && (
                                                        <span style={{
                                                            background: 'rgba(40, 167, 69, 0.2)',
                                                            color: '#28a745',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <FiBriefcase size={12} /> {offer.salaire}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Real Interview - Scheduled Info */}
                                                {isRealInterview && hasCreneau && (
                                                    <div style={{
                                                        marginTop: '15px',
                                                        padding: '15px',
                                                        background: canJoin 
                                                            ? 'linear-gradient(135deg, rgba(40, 167, 69, 0.2), rgba(32, 201, 151, 0.2))'
                                                            : isDark ? 'rgba(108, 99, 255, 0.1)' : '#f5f3ff',
                                                        borderRadius: '12px',
                                                        border: canJoin
                                                            ? '2px solid rgba(40, 167, 69, 0.4)'
                                                            : isDark ? '1px solid rgba(108, 99, 255, 0.2)' : '1px solid #ddd6fe'
                                                    }}>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px',
                                                            marginBottom: '8px',
                                                            color: canJoin ? '#28a745' : '#6c63ff',
                                                            fontWeight: 'bold',
                                                            fontSize: '14px'
                                                        }}>
                                                            {canJoin ? (
                                                                <><FiVideo /> L'entretien est en cours !</>
                                                            ) : interviewPassed ? (
                                                                <><FiCheckCircle /> Entretien terminé</>
                                                            ) : (
                                                                <><FiCalendar /> Entretien planifié</>
                                                            )}
                                                        </div>
                                                        
                                                        <div style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '16px', fontWeight: '600', marginBottom: '5px' }}>
                                                            {new Date(offer.creneauChoisi.date).toLocaleDateString('fr-FR', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        
                                                        <div style={{ color: isDark ? 'rgba(254,250,224,0.7)' : '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span><FiClock /> {offer.creneauChoisi.heureDebut} - {offer.creneauChoisi.heureFin}</span>
                                                            {!canJoin && !interviewPassed && timeUntil && (
                                                                <span style={{
                                                                    background: 'rgba(245, 158, 11, 0.2)',
                                                                    color: '#f59e0b',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '11px',
                                                                    fontWeight: '500'
                                                                }}>
                                                                    <FiClock size={12} style={{ display: 'inline', marginRight: '4px' }} /> {timeUntil}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Real Interview - Waiting for slot */}
                                                {isRealInterview && !hasCreneau && (
                                                    <div style={{
                                                        marginTop: '15px',
                                                        padding: '15px',
                                                        background: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb',
                                                        borderRadius: '12px',
                                                        border: isDark ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid #fde68a'
                                                    }}>
                                                        <div style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: '8px',
                                                            color: '#f59e0b',
                                                            fontWeight: 'bold',
                                                            fontSize: '14px',
                                                            marginBottom: '5px'
                                                        }}>
                                                            <FiClock /> En attente de planification
                                                        </div>
                                                        <p style={{ 
                                                            color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', 
                                                            fontSize: '13px', 
                                                            margin: 0 
                                                        }}>
                                                            Le recruteur va bientôt choisir un créneau pour votre entretien. Vous serez notifié dès qu'une date sera fixée.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Right side - Action Buttons */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', minWidth: '220px' }}>
                                                {/* Real Interview - Join Button */}
                                                {isRealInterview && hasCreneau && !interviewPassed && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (canJoin && offer.lienVisio) {
                                                                window.open(offer.lienVisio, '_blank');
                                                            }
                                                        }}
                                                        disabled={!canJoin || !offer.lienVisio}
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px 32px',
                                                            background: (canJoin && offer.lienVisio) 
                                                                ? 'linear-gradient(135deg, #28a745, #20c997)'
                                                                : (isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'),
                                                            color: (canJoin && offer.lienVisio) 
                                                                ? 'white' 
                                                                : (isDark ? 'rgba(254,250,224,0.3)' : '#94a3b8'),
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            cursor: (canJoin && offer.lienVisio) ? 'pointer' : 'not-allowed',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold',
                                                            transition: 'all 0.3s',
                                                            boxShadow: (canJoin && offer.lienVisio) ? '0 4px 20px rgba(40, 167, 69, 0.4)' : 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (canJoin && offer.lienVisio) {
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(40, 167, 69, 0.5)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (canJoin && offer.lienVisio) {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(40, 167, 69, 0.4)';
                                                            }
                                                        }}
                                                    >
                                                        {canJoin && offer.lienVisio ? <FiVideo size={18} /> : <FiClock size={18} />}
                                                        {(canJoin && offer.lienVisio) ? "Rejoindre l'entretien" : `Rejoindre (${timeUntil})`}
                                                    </button>
                                                )}
                                                
                                                {/* Separator - only show if there are other buttons */}
                                                {(isRealInterview && hasCreneau && !interviewPassed) && (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '1px',
                                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                                                        margin: '4px 0'
                                                    }} />
                                                )}
                                                
                                                {/* AI Interview - Start */}
                                                {(!isRealInterview || offer.interviewType === 'ai') && !offer.scoreEntretien && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenChat(offer);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px 32px',
                                                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold',
                                                            transition: 'all 0.3s',
                                                            boxShadow: `0 4px 15px ${roleColor}40`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = `0 6px 20px ${roleColor}50`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = `0 4px 15px ${roleColor}40`;
                                                        }}
                                                    >
                                                        <FiCpu size={18} /> Commencer l'entretien IA
                                                    </button>
                                                )}
                                                
                                                {/* View Results (completed) */}
                                                {offer.scoreEntretien && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenChat(offer);
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            padding: '14px 32px',
                                                            background: isDark ? 'rgba(108, 99, 255, 0.2)' : '#eef2ff',
                                                            color: '#6c63ff',
                                                            border: isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #c7d2fe',
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold',
                                                            transition: 'all 0.3s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = isDark ? 'rgba(108, 99, 255, 0.3)' : '#e0e7ff';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = isDark ? 'rgba(108, 99, 255, 0.2)' : '#eef2ff';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        <FiBarChart2 size={18} /> Voir les résultats ({offer.scoreEntretien}%)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                <>
                    {/* Back Button */}
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={handleBackToList}
                            style={{
                                padding: '12px 24px',
                                background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                                color: isDark ? '#fefae0' : '#1e293b',
                                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9';
                            }}
                        >
                            <FiArrowLeft /> Retour aux entretiens
                        </button>
                    </div>

                    {/* Chat Interface */}
                    <div style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                        borderRadius: '20px',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                    }}>
                        {/* Chat Header */}
                        <div style={{
                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                            padding: '25px',
                            borderBottom: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '15px'
                            }}>
                                <div>
                                    <h2 style={{ color: 'white', fontSize: '22px', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FiCpu /> Assistant Entretien
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '14px' }}>
                                        {selectedOffer.offreTitre} • {selectedOffer.entreprise}
                                    </p>
                                </div>
                                <div style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        background: '#10b981',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        animation: 'pulse 2s infinite'
                                    }} />
                                    <span style={{ color: 'white', fontSize: '13px' }}>
                                        En ligne
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div style={{
                            height: '450px',
                            overflowY: 'auto',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            background: isDark ? 'rgba(15, 23, 42, 0.95)' : '#f8fafc'
                        }}>
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                        animation: 'fadeIn 0.3s ease'
                                    }}
                                >
                                    {msg.type === 'bot' && (
                                        <div style={{
                                            width: '35px',
                                            height: '35px',
                                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '10px',
                                            flexShrink: 0,
                                            color: 'white'
                                        }}>
                                            <FiZap size={18} />
                                        </div>
                                    )}
                                    
                                    <div style={{
                                        maxWidth: '70%',
                                        background: msg.type === 'user'
                                            ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`
                                            : isDark ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                        border: msg.type === 'user'
                                            ? 'none'
                                            : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                        padding: '14px 18px',
                                        borderRadius: msg.type === 'user'
                                            ? '15px 15px 0 15px'
                                            : '15px 15px 15px 0',
                                        color: msg.type === 'user' ? 'white' : isDark ? '#fefae0' : '#1e293b',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        boxShadow: (!isDark && msg.type === 'bot') ? '0 1px 2px rgba(0,0,0,0.04)' : 'none'
                                    }}>
                                        <p style={{ margin: '0 0 5px 0', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                        <span style={{
                                            fontSize: '11px',
                                            color: msg.type === 'user'
                                                ? 'rgba(255,255,255,0.7)'
                                                : isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8',
                                            display: 'block',
                                            textAlign: 'right'
                                        }}>
                                            {msg.time}
                                        </span>
                                    </div>

                                    {msg.type === 'user' && (
                                        <div style={{
                                            width: '35px',
                                            height: '35px',
                                            background: 'linear-gradient(135deg, #28a745, #20c997)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginLeft: '10px',
                                            flexShrink: 0,
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '14px'
                                        }}>
                                            {user.prenom?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <div style={{
                            padding: '20px',
                            borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            background: isDark ? 'rgba(15, 23, 42, 0.95)' : '#f8fafc'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                borderRadius: '15px',
                                padding: '5px',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                            }}>
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Écrivez votre message..."
                                    rows="2"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: isDark ? '#fefae0' : '#1e293b',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    disabled={!interviewActive}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || !interviewActive}
                                    style={{
                                        padding: '12px 25px',
                                        background: (inputMessage.trim() && interviewActive)
                                            ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`
                                            : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                                        color: (inputMessage.trim() && interviewActive) ? 'white' : (isDark ? 'rgba(254,250,224,0.3)' : '#94a3b8'),
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: (inputMessage.trim() && interviewActive) ? 'pointer' : 'not-allowed',
                                        fontSize: '18px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (inputMessage.trim() && interviewActive) {
                                            e.target.style.transform = 'scale(1.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                >
                                    <FiSend />
                                </button>
                            </div>
                            {!interviewActive && (
                                <p style={{
                                    marginTop: '8px',
                                    fontSize: '12px',
                                    color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8',
                                    textAlign: 'center'
                                }}>
                                    L'entretien est terminé. {showScore ? 'Consultez vos résultats ci-dessous.' : 'Revenez plus tard pour voir vos résultats.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Score Display */}
                    {showScore && finalScore && (
                        <div style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #ddd6fe',
                            borderRadius: '16px',
                            padding: '25px',
                            marginTop: '20px',
                            boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h3 style={{ 
                                    color: isDark ? '#fefae0' : '#0f172a', 
                                    marginBottom: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '20px'
                                }}>
                                    <FiBarChart2 style={{ color: roleColor }} /> Score Final
                                </h3>
                                <div style={{
                                    fontSize: '56px',
                                    fontWeight: 'bold',
                                    color: finalScore.scoreTotal >= 70 ? '#10b981' : 
                                           finalScore.scoreTotal >= 50 ? '#f59e0b' : '#ef4444',
                                    fontFamily: "'Quicksand', sans-serif"
                                }}>
                                    {finalScore.scoreTotal}/100
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {Object.entries(finalScore.scores).map(([key, value]) => {
                                    const iconMap = {
                                        pertinence: <FiTarget />,
                                        technique: <FiCode />,
                                        communication: <FiMessageCircle />,
                                        motivation: <FiTrendingUp />,
                                        professionnalisme: <FiUserCheck />
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
                                            padding: '12px 16px',
                                            background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                            borderRadius: '10px',
                                            color: isDark ? '#fefae0' : '#1e293b',
                                            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: roleColor }}>{iconMap[key]}</span>
                                                {labelMap[key]}
                                            </span>
                                            <span style={{ fontWeight: 'bold', color: roleColor }}>{value}/30</span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <p style={{ 
                                color: isDark ? 'rgba(254,250,224,0.7)' : '#64748b', 
                                marginTop: '15px', 
                                fontStyle: 'italic', 
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <FiMessageSquare style={{ color: roleColor, marginTop: '2px' }} /> {finalScore.commentaire}
                            </p>
                        </div>
                    )}
                </>
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
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes pulseButton {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03); }
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

export default EspEntretien;