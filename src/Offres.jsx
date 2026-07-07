// Offres.jsx - Complete with Fixed Modal Overlays
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext.jsx';
import ModalPortal from './ModalPortal.jsx';
import { 
  FiLoader, FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiCheck, FiX,
  FiEdit2, FiTrash2, FiPlus, FiEye, FiSend, FiZap, FiTool,
  FiTarget, FiBarChart2, FiCalendar, FiUser, FiMail, FiMessageCircle,
  FiLock, FiAward, FiFileText, FiFilter, FiSearch, FiRefreshCw,
  FiCheckCircle, FiXCircle, FiTrendingUp, FiStar,
  FiUsers, FiInfo
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineUserGroup, HiOutlineDocumentText } from 'react-icons/hi';

// AutoApplyResultsModal Component - NOW WRAPPED WITH PORTAL
const AutoApplyResultsModal = ({ results, onClose }) => {
    const { isDark } = useTheme();
    const [enrichedDetails, setEnrichedDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
        enrichSkippedOffers();
    }, [results]);

    const enrichSkippedOffers = async () => {
        try {
            const res = await fetch('https://pfe-backend-five.vercel.app/offres');
            const allOffres = await res.json();
            const offresMap = {};
            allOffres.forEach(offre => { offresMap[offre._id] = offre; });

            const enriched = results.details.map(detail => {
                const fullOffre = offresMap[detail.offreId || detail._id];
                return {
                    ...detail,
                    entreprise: detail.entreprise || fullOffre?.entreprise || '',
                    titre: detail.titre || fullOffre?.titre || 'Offre sans titre'
                };
            });
            setEnrichedDetails(enriched);
        } catch (err) {
            console.error("Error enriching offer details:", err);
            setEnrichedDetails(results.details);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (loadingDetails) {
        return (
            <ModalPortal>
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
                        borderRadius: '20px', padding: '40px', textAlign: 'center',
                        color: isDark ? 'white' : '#0f1419'
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}><FiLoader /></div>
                        <p>Chargement des détails...</p>
                    </div>
                </div>
            </ModalPortal>
        );
    }

    const appliedOffers = enrichedDetails.filter(d => d.status === 'applied');
    const skippedOffers = enrichedDetails.filter(d => d.status === 'skipped');

    return (
        <ModalPortal>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1000, padding: '20px'
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            >
                <div style={{
                    background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb',
                    borderRadius: '20px', width: '100%', maxWidth: '700px',
                    maxHeight: '80vh', overflowY: 'auto',
                    boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.08)'
                }}
                onClick={(e) => e.stopPropagation()}
                >
                    <div style={{
                        padding: '25px 30px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #f3f4f6',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        position: 'sticky', top: 0, background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff',
                        borderRadius: '20px 20px 0 0', zIndex: 1
                    }}>
                        <h2 style={{ color: isDark ? 'white' : '#0f1419', fontSize: '22px', margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiZap style={{ color: '#28a745' }} /> Résultats - Candidature Automatique
                        </h2>
                        <button onClick={onClose} style={{
                            background: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
                            border: 'none',
                            color: isDark ? 'white' : '#0f1419',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>✕</button>
                    </div>

                    <div style={{ padding: '30px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
                            <div style={{ textAlign: 'center', padding: '15px', background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderRadius: '12px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6366f1' }}>{results.total}</div>
                                <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#666666', fontSize: '12px' }}>Offres analysées</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', background: isDark ? 'rgba(40,167,69,0.1)' : '#f0fdf4', borderRadius: '12px', border: isDark ? '1px solid rgba(40,167,69,0.2)' : '1px solid #d4edda' }}>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{results.applied}</div>
                                <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#666666', fontSize: '12px' }}>Candidatures envoyées</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '15px', background: isDark ? 'rgba(255,193,7,0.1)' : '#fffbf0', borderRadius: '12px', border: isDark ? '1px solid rgba(255,193,7,0.2)' : '1px solid #feebc8' }}>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{results.skipped}</div>
                                <div style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#666666', fontSize: '12px' }}>Ignorées (&lt;70%)</div>
                            </div>
                        </div>

                        {appliedOffers.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ color: '#28a745', fontSize: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiCheckCircle /> Candidatures envoyées avec succès
                                </h3>
                                {appliedOffers.map((detail, index) => (
                                    <div key={index} style={{
                                        padding: '15px', background: isDark ? 'rgba(40,167,69,0.08)' : '#f0fdf4',
                                        border: isDark ? '1px solid rgba(40,167,69,0.2)' : '1px solid #d4edda',
                                        borderRadius: '12px', marginBottom: '10px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h4 style={{ color: isDark ? 'white' : '#0f1419', margin: 0, fontSize: '15px' }}>{detail.titre}</h4>
                                            <span style={{ background: isDark ? 'rgba(40,167,69,0.2)' : '#d4edda', color: '#28a745', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                                {detail.matchPercentage}% match
                                            </span>
                                        </div>
                                        {detail.entreprise && (
                                            <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#666666', fontSize: '13px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <HiOutlineOfficeBuilding size={14} /> {detail.entreprise}
                                            </p>
                                        )}
                                        {detail.matchedSkills && detail.matchedSkills.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {detail.matchedSkills.map((skill, idx) => (
                                                    <span key={idx} style={{ background: isDark ? 'rgba(40,167,69,0.2)' : '#d4edda', color: '#28a745', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <FiCheck size={10} /> {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {skippedOffers.length > 0 && (
                            <div>
                                <h3 style={{ color: '#f59e0b', fontSize: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiXCircle /> Offres ignorées (correspondance &lt; 70%)
                                </h3>
                                {skippedOffers.map((detail, index) => (
                                    <div key={index} style={{
                                        padding: '12px', background: isDark ? 'rgba(255,193,7,0.05)' : '#fffbf0',
                                        border: isDark ? '1px solid rgba(255,193,7,0.1)' : '1px solid #feebc8',
                                        borderRadius: '8px', marginBottom: '8px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <span style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#666666', fontSize: '13px' }}>
                                            {detail.titre}{detail.entreprise && ` - ${detail.entreprise}`}
                                        </span>
                                        <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 'bold' }}>{detail.matchPercentage}%</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button onClick={onClose} style={{
                            width: '100%', padding: '14px', marginTop: '20px',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: 'white', border: 'none', borderRadius: '10px',
                            cursor: 'pointer', fontSize: '16px', fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <FiCheck style={{ display: 'inline', marginRight: '8px' }} /> Compris, fermer
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

function Offres() {
    const navigate = useNavigate();
    const { isDark, theme } = useTheme();
    const [offres, setOffres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [autoApplying, setAutoApplying] = useState(false);
    const [showAutoApplyModal, setShowAutoApplyModal] = useState(false);
    const [autoApplyResults, setAutoApplyResults] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingOffre, setEditingOffre] = useState(null);
    const [formData, setFormData] = useState({
        titre: '', description: '', entreprise: '', localisation: '',
        typeContrat: '', salaire: '', competences: '', dateLimite: '', 
        nombrePostes: 1
    });
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedOffre, setSelectedOffre] = useState(null);
    const [lettreMotivation, setLettreMotivation] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [appliedOfferIds, setAppliedOfferIds] = useState(new Set());
    const [showAllOffers, setShowAllOffers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypeContrat, setSelectedTypeContrat] = useState('all');
    const [selectedStatut, setSelectedStatut] = useState('all');

    // Get role-based color
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
                fetchOffres(parsedUser);
            } catch (err) {
                console.error("Error parsing user:", err);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            setLoading(true);
            fetchOffres(user);
        }
    }, [showAllOffers]);

    const fetchOffres = async (userData) => {
        try {
            let url = 'https://pfe-backend-five.vercel.app/offres';
            
            if (userData?.role === 'Recruteur') {
                const res = await fetch(`https://pfe-backend-five.vercel.app/offres/recruteur/${userData.id}`);
                const data = await res.json();
                if (data.offers) {
                    setOffres(data.offers);
                } else {
                    setOffres(data);
                }
                setLoading(false);
                return;
            }
            
            const res = await fetch(url);
            const allOffres = await res.json();
            
            if (userData?.role === 'Etudiant' && userData.id) {
                const candidaturesRes = await fetch(`https://pfe-backend-five.vercel.app/candidatures/etudiant/${userData.id}`);
                if (candidaturesRes.ok) {
                    const candidaturesData = await candidaturesRes.json();
                    const appliedIds = new Set(candidaturesData.map(c => c.offreId));
                    setAppliedOfferIds(appliedIds);
                    
                    if (!showAllOffers) {
                        const availableOffres = allOffres.filter(offre => !appliedIds.has(offre._id));
                        setOffres(availableOffres);
                    } else {
                        setOffres(allOffres);
                    }
                } else {
                    setAppliedOfferIds(new Set());
                    setOffres(allOffres);
                }
            } else {
                setOffres(allOffres);
            }
        } catch (err) {
            console.error("Error fetching offres:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateNew = () => {
        setEditingOffre(null);
        setFormData({ 
            titre: '', description: '', entreprise: '', localisation: '', 
            typeContrat: '', salaire: '', competences: '', dateLimite: '', 
            nombrePostes: 1 
        });
        setShowForm(true);
    };

    const handleEdit = (offre) => {
        setEditingOffre(offre);
        setFormData({
            titre: offre.titre, description: offre.description, entreprise: offre.entreprise,
            localisation: offre.localisation, typeContrat: offre.typeContrat,
            salaire: offre.salaire || '', competences: offre.competences.join(', '),
            dateLimite: offre.dateLimite ? offre.dateLimite.split('T')[0] : '',
            nombrePostes: offre.nombrePostes || 1
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (formData.dateLimite) {
            const selectedDate = new Date(formData.dateLimite);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                setMessage('❌ Erreur : La date limite ne peut pas être dans le passé.');
                setMessageType('error');
                setTimeout(() => setMessage(''), 4000);
                return;
            }
        }
        const offreData = { 
            ...formData, 
            competences: formData.competences.split(',').map(s => s.trim()).filter(s => s), 
            recruteurId: user.id 
        };
        try {
            let res;
            if (editingOffre) {
                res = await fetch(`https://pfe-backend-five.vercel.app/offres/${editingOffre._id}`, { 
                    method: 'PUT', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(offreData) 
                });
            } else {
                res = await fetch('https://pfe-backend-five.vercel.app/offres', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(offreData) 
                });
            }
            const data = await res.json();
            if (res.ok) { 
                setMessage(data.message || '✅ Opération réussie'); 
                setMessageType('success');
                setShowForm(false); 
                fetchOffres(user); 
            } else { 
                setMessage(data.error || '❌ Une erreur est survenue'); 
                setMessageType('error');
            }
        } catch (err) { 
            setMessage('❌ Impossible de se connecter au serveur'); 
            setMessageType('error');
        }
    };

    const handleDelete = async (offreId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}`, { method: 'DELETE' });
            if (res.ok) { 
                setOffres(offres.filter(o => o._id !== offreId)); 
                setMessage('✅ Offre supprimée avec succès'); 
                setMessageType('success');
            }
        } catch (err) { 
            setMessage('❌ Erreur lors de la suppression'); 
            setMessageType('error');
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${selectedOffre._id}/postuler`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ etudiantId: user.id, lettreMotivation })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('✅ Candidature envoyée avec succès!');
                setMessageType('success');
                setShowApplyModal(false); 
                setLettreMotivation('');
                setAppliedOfferIds(prev => new Set([...prev, selectedOffre._id]));
                if (!showAllOffers) fetchOffres(user);
            } else { 
                setMessage(data.error || '❌ Erreur lors de la candidature'); 
                setMessageType('error');
            }
        } catch (err) { 
            setMessage('❌ Impossible de se connecter au serveur'); 
            setMessageType('error');
        }
    };

    const checkCVExists = async () => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users/${user.id}`);
            const userData = await res.json();
            if (!userData.cv || !userData.cv.filename) {
                setMessage("❌ Erreur : Vous devez d'abord télécharger votre CV.");
                setMessageType('error');
                setTimeout(() => setMessage(''), 4000);
                return false;
            }
            return true;
        } catch (err) { return false; }
    };

    const handleAutoApply = async () => {
        const hasCV = await checkCVExists();
        if (!hasCV) return;
        setAutoApplying(true);
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/auto-apply/${user.id}`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) { 
                setAutoApplyResults(data.results); 
                setShowAutoApplyModal(true); 
                setMessage(`✅ ${data.message}`); 
                setMessageType('success');
                fetchOffres(user);
            } else { 
                setMessage(data.error || "❌ Erreur lors de la candidature automatique."); 
                setMessageType('error');
            }
        } catch (err) { 
            setMessage("❌ Impossible de se connecter au serveur."); 
            setMessageType('error');
        } finally { 
            setAutoApplying(false); 
            setTimeout(() => setMessage(''), 5000); 
        }
    };

    const contractTypes = [
        { value: 'Stage', label: 'Stage' },
        { value: 'Alternance', label: 'Alternance' }
    ];

    const statusTypes = [
        { value: 'active', label: 'Active' },
        { value: 'fermée', label: 'Fermée' }
    ];

    const filteredOffres = offres.filter(offre => {
        const matchContrat = selectedTypeContrat === 'all' || offre.typeContrat === selectedTypeContrat;
        const matchStatut = selectedStatut === 'all' || offre.statut === selectedStatut;
        const matchSearch = !searchTerm || 
            offre.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offre.entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            offre.localisation?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchContrat && matchStatut && matchSearch;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Chargement des offres...           </p>
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
                    <h2 style={{ color: isDark ? '#fefae0' : '#0f172a' }}>Access Restricted</h2>
                    <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', marginBottom: '24px' }}>Please log in first to access your dashboard</p>
                    <button onClick={() => navigate('/login')} style={{
                        marginTop: '20px', padding: '12px 30px',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        border: 'none', borderRadius: '8px', color: 'white',
                        cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                    }}>Go to Login</button>
                </div>
            </div>
        );
    }

    const isRecruiter = user.role === 'Recruteur';
    const isStudent = user.role === 'Etudiant';
    const isAdmin = user.role === 'Admin' || user.role === 'admin';

    return (
        <div style={{ padding: '40px', color: isDark ? '#fefae0' : '#0f172a' }}>
            {/* Header with Icon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
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
                            <><FiBarChart2 style={{ color: '#00A86B' }} /> Gestion des Offres</>
                        ) : isRecruiter ? (
                            <><FiBriefcase style={{ color: roleColor }} /> Mes Offres</>
                        ) : (
                            <><FiBriefcase style={{ color: roleColor }} /> Offres disponibles</>
                        )}
                    </h1>
                    <p style={{ color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', fontSize: '16px' }}>
                        {isAdmin ? 'Gérez toutes les offres de la plateforme' :
                         isRecruiter ? 'Gérez vos offres d\'emploi' : 
                         'Parcourez et postulez aux offres'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {isStudent && (
                        <>
                            <button 
                                onClick={handleAutoApply} 
                                disabled={autoApplying}
                                style={{
                                    padding: '12px 24px',
                                    background: autoApplying 
                                        ? (isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb')
                                        : 'linear-gradient(135deg, #28a745, #20c997)',
                                    color: autoApplying 
                                        ? (isDark ? 'rgba(254,250,224,0.3)' : '#94a3b8')
                                        : 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: autoApplying ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s',
                                    boxShadow: autoApplying ? 'none' : '0 4px 16px rgba(40,167,69,0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!autoApplying) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(40,167,69,0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!autoApplying) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(40,167,69,0.3)';
                                    }
                                }}
                            >
                               {autoApplying ? <><FiClock /> Analyse en cours...</> : <><FiZap /> Postuler automatiquement</>}
                            </button>
                            
                            <button 
                                onClick={() => { setShowAllOffers(!showAllOffers); }}
                                style={{
                                    padding: '12px 20px',
                                    background: showAllOffers 
                                        ? (isDark ? 'rgba(40,167,69,0.15)' : '#f0fdf4')
                                        : (isDark ? 'rgba(108,99,255,0.15)' : '#eef2ff'),
                                    color: showAllOffers ? '#28a745' : '#6366f1',
                                    border: `1px solid ${showAllOffers ? 'rgba(40,167,69,0.2)' : 'rgba(108,99,255,0.2)'}`,
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {showAllOffers ? <><FiCheckCircle /> Voir disponibles uniquement</> : <><FiEye /> Voir toutes les offres</>}
                            </button>
                        </>
                    )}
                    
                    {isRecruiter && (
                        <button 
                            onClick={handleCreateNew}
                            style={{
                                padding: '12px 30px',
                                background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s',
                                boxShadow: `0 4px 16px ${roleColor}40`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `0 6px 20px ${roleColor}50`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 16px ${roleColor}40`;
                            }}
                        >
                            <FiPlus /> Nouvelle Offre
                        </button>
                    )}
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
                                   messageType === 'warning' ? '#f59e0b' : '#6366f1',
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

            {/* Filters */}
            {(isStudent || isAdmin) && offres.length > 0 && (
                <div style={{
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '25px'
                }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: '1 1 250px', position: 'relative' }}>
                            <FiSearch size={16} style={{ 
                                position: 'absolute', 
                                left: '15px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8' 
                            }} />
                            <input 
                                type="text" 
                                placeholder="Rechercher par titre, entreprise, ville..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 15px 10px 40px', 
                                    borderRadius: '10px', 
                                    outline: 'none',
                                    background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
                                    color: isDark ? '#fefae0' : '#1e293b',
                                    fontSize: '14px'
                                }} 
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <label style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiBriefcase size={14} /> Type :
                            </label>
                            <select 
                                value={selectedTypeContrat} 
                                onChange={(e) => setSelectedTypeContrat(e.target.value)} 
                                style={{ 
                                    minWidth: '140px',
                                    background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
                                    color: isDark ? '#fefae0' : '#1e293b',
                                    padding: '10px 15px',
                                    borderRadius: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">Tous les types</option>
                                {contractTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <label style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiClock size={14} /> Statut :
                            </label>
                            <select 
                                value={selectedStatut} 
                                onChange={(e) => setSelectedStatut(e.target.value)} 
                                style={{ 
                                    minWidth: '130px',
                                    background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
                                    color: isDark ? '#fefae0' : '#1e293b',
                                    padding: '10px 15px',
                                    borderRadius: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">Tous les statuts</option>
                                {statusTypes.map(status => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>

                        {(selectedTypeContrat !== 'all' || selectedStatut !== 'all' || searchTerm) && (
                            <button 
                                onClick={() => { setSelectedTypeContrat('all'); setSelectedStatut('all'); setSearchTerm(''); }}
                                style={{
                                    padding: '10px 20px',
                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                    color: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
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
                </div>
            )}

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <p style={{ color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', fontSize: '14px' }}>
                    {filteredOffres.length} offre(s) trouvée(s)
                </p>
            </div>

            {/* Offers List */}
            <div style={{ display: 'grid', gap: '20px' }}>
                {filteredOffres.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px',
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                        borderRadius: '20px',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'
                    }}>
                        <FiBriefcase size={60} style={{ color: isDark ? 'rgba(254,250,224,0.2)' : '#94a3b8', marginBottom: '20px' }} />
                        <p style={{ fontSize: '18px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>
                            {isRecruiter ? "Vous n'avez pas encore créé d'offre" : 
                             showAllOffers ? "Aucune offre disponible pour le moment" : 
                             "Vous avez postulé à toutes les offres disponibles !"}
                        </p>
                        {isRecruiter && (
                            <button 
                                onClick={handleCreateNew}
                                style={{
                                    marginTop: '15px',
                                    padding: '12px 30px',
                                    background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <FiPlus /> Créer une offre
                            </button>
                        )}
                        {isStudent && !showAllOffers && (
                            <button 
                                onClick={() => setShowAllOffers(true)}
                                style={{
                                    marginTop: '15px',
                                    padding: '10px 25px',
                                    background: isDark ? 'rgba(108,99,255,0.2)' : '#eef2ff',
                                    color: '#6366f1',
                                    border: isDark ? '1px solid rgba(108,99,255,0.3)' : '1px solid #c7d2fe',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FiEye /> Voir toutes les offres
                            </button>
                        )}
                    </div>
                ) : (
                    filteredOffres.map(offre => (
                        <div key={offre._id} style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '25px',
                            transition: 'all 0.3s ease',
                            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                            opacity: offre.recruteurBlocked ? 0.75 : 1,
                            position: 'relative'
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
                            {/* Blocked Recruiter Badge */}
                            {offre.recruteurBlocked && (
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: '#ef4444',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    zIndex: 1
                                }}>
                                    <FiXCircle size={12} /> Recruteur bloqué
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ 
                                        fontSize: '20px', 
                                        marginBottom: '5px', 
                                        color: isDark ? '#fefae0' : '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <FiBriefcase style={{ color: roleColor }} /> {offre.titre}
                                    </h3>
                                    <p style={{ color: roleColor, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <span><HiOutlineOfficeBuilding style={{ display: 'inline', marginRight: '4px' }} /> {offre.entreprise}</span>
                                        <span><FiMapPin style={{ display: 'inline', marginRight: '4px' }} /> {offre.localisation}</span>
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        background: offre.statut === 'active' 
                                            ? 'rgba(40,167,69,0.2)' 
                                            : 'rgba(239,68,68,0.2)',
                                        color: offre.statut === 'active' ? '#28a745' : '#ef4444',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {offre.statut === 'active' ? <FiCheck size={12} /> : <FiX size={12} />}
                                        {offre.statut === 'active' ? 'Active' : 'Fermée'}
                                    </span>
                                    <span style={{
                                        background: 'rgba(108,99,255,0.2)',
                                        color: '#6366f1',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <FiBriefcase size={12} /> {offre.typeContrat}
                                    </span>
                                </div>
                            </div>

                            <p style={{ 
                                color: isDark ? 'rgba(254,250,224,0.7)' : '#64748b', 
                                marginBottom: '15px', 
                                lineHeight: '1.6' 
                            }}>
                                {offre.description.length > 200 ? offre.description.substring(0, 200) + '...' : offre.description}
                            </p>

                            {offre.salaire && (
                                <p style={{ color: '#28a745', marginBottom: '15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FiDollarSign /> {offre.salaire}
                                </p>
                            )}

                            {isRecruiter && (
                                <p style={{ color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', marginBottom: '15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiUsers size={14} /> 
                                    <span style={{ 
                                        fontWeight: 'bold', 
                                        color: (offre.candidatures?.filter(c => c.statut === 'embauche_acceptee').length || 0) >= (offre.nombrePostes || 1) 
                                            ? '#28a745' 
                                            : isDark ? '#fefae0' : '#0f172a'
                                    }}>
                                        {offre.candidatures ? offre.candidatures.filter(c => c.statut === 'embauche_acceptee').length : 0} / {offre.nombrePostes || 1}
                                    </span> 
                                    postes pourvus
                                </p>
                            )}

                            {offre.competences && offre.competences.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    {offre.competences.map((skill, index) => (
                                        <span key={index} style={{
                                            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                            color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                            padding: '4px 10px',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <FiTool size={10} /> {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Blocked Recruiter Warning */}
                            {offre.recruteurBlocked && (
                                <div style={{
                                    marginBottom: '15px',
                                    padding: '12px',
                                    background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                                    border: isDark ? '1px solid rgba(239,68,68,0.2)' : '1px solid #fecaca',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{ color: '#ef4444', fontSize: '20px' }}>⚠️</span>
                                    <span style={{ color: isDark ? 'rgba(254,250,224,0.7)' : '#7f1d1d', fontSize: '13px' }}>
                                        Ce recruteur est actuellement bloqué. Les candidatures sont temporairement suspendues.
                                    </span>
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #f1f5f9',
                                paddingTop: '15px',
                                flexWrap: 'wrap'
                            }}>
                                {isRecruiter && (
                                    <>
                                        <button 
                                            onClick={() => handleEdit(offre)}
                                            style={{
                                                padding: '8px 20px',
                                                background: isDark ? 'rgba(108,99,255,0.2)' : '#eef2ff',
                                                color: '#6366f1',
                                                border: isDark ? '1px solid rgba(108,99,255,0.3)' : '1px solid #c7d2fe',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <FiEdit2 size={14} /> Modifier
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(offre._id)}
                                            style={{
                                                padding: '8px 20px',
                                                background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
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
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <FiTrash2 size={14} /> Supprimer
                                        </button>
                                    </>
                                )}

                                {isStudent && (
                                    appliedOfferIds.has(offre._id) ? (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span style={{
                                                background: isDark ? 'rgba(40,167,69,0.2)' : '#f0fdf4',
                                                color: '#28a745',
                                                padding: '8px 20px',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <FiCheckCircle size={14} /> Déjà postulé
                                            </span>
                                            <button 
                                                onClick={() => navigate('/dashboard/moffres')}
                                                style={{
                                                    padding: '8px 20px',
                                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                                    color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                                    border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <FiFileText size={14} /> Voir ma candidature
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => { 
                                                if (!offre.recruteurBlocked) {
                                                    setSelectedOffre(offre); 
                                                    setShowApplyModal(true);
                                                }
                                            }} 
                                            disabled={offre.recruteurBlocked}
                                            style={{
                                                padding: '10px 30px',
                                                background: offre.recruteurBlocked 
                                                    ? (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')
                                                    : `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                                color: offre.recruteurBlocked 
                                                    ? (isDark ? 'rgba(254,250,224,0.3)' : '#94a3b8')
                                                    : 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: offre.recruteurBlocked ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                opacity: offre.recruteurBlocked ? 0.6 : 1,
                                                transition: 'all 0.3s',
                                                boxShadow: offre.recruteurBlocked ? 'none' : `0 4px 16px ${roleColor}40`
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!offre.recruteurBlocked) {
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                    e.currentTarget.style.boxShadow = `0 6px 20px ${roleColor}50`;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!offre.recruteurBlocked) {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = `0 4px 16px ${roleColor}40`;
                                                }
                                            }}
                                            title={offre.recruteurBlocked ? "Le recruteur est bloqué, vous ne pouvez pas postuler pour le moment" : "Postuler à cette offre"}
                                        >
                                            {offre.recruteurBlocked ? (
                                                <>
                                                    <FiXCircle size={14} /> Recruteur indisponible
                                                </>
                                            ) : (
                                                <>
                                                    <FiSend size={14} /> Postuler
                                                </>
                                            )}
                                        </button>
                                    )
                                )}

                                {isAdmin && (
                                    <>
                                        <button 
                                            onClick={() => handleEdit(offre)}
                                            style={{
                                                padding: '8px 20px',
                                                background: isDark ? 'rgba(108,99,255,0.2)' : '#eef2ff',
                                                color: '#6366f1',
                                                border: isDark ? '1px solid rgba(108,99,255,0.3)' : '1px solid #c7d2fe',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <FiEdit2 size={14} /> Modifier
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(offre._id)}
                                            style={{
                                                padding: '8px 20px',
                                                background: isDark ? 'rgba(239,68,68,0.2)' : '#fef2f2',
                                                color: '#ef4444',
                                                border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #fecaca',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <FiTrash2 size={14} /> Supprimer
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Form Modal - Already with ModalPortal */}
            {showForm && (
                <ModalPortal>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        padding: '20px',
                        margin: 0
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowForm(false);
                        }
                    }}
                    >
                        <div style={{
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0',
                            borderRadius: '20px',
                            padding: '30px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)',
                            position: 'relative',
                            zIndex: 10000
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ 
                                marginBottom: '20px', 
                                color: isDark ? '#fefae0' : '#0f172a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <FiBriefcase style={{ color: roleColor }} /> {editingOffre ? 'Modifier l\'offre' : 'Nouvelle Offre'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                {/* ... form fields ... */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Titre *</label>
                                    <input type="text" name="titre" value={formData.titre} onChange={handleChange} required 
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }} />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Description *</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b', resize: 'vertical' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Entreprise *</label>
                                        <input type="text" name="entreprise" value={formData.entreprise} onChange={handleChange} required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Localisation *</label>
                                        <input type="text" name="localisation" value={formData.localisation} onChange={handleChange} required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Type de contrat *</label>
                                        <select name="typeContrat" value={formData.typeContrat} onChange={handleChange} required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }}>
                                            <option value="">Sélectionner...</option>
                                            <option value="Stage">Stage</option>
                                            <option value="Alternance">Alternance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Salaire</label>
                                        <input type="text" name="salaire" value={formData.salaire} onChange={handleChange} placeholder="ex: 8000 - 12000 MAD"
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Compétences (séparées par des virgules)</label>
                                    <input type="text" name="competences" value={formData.competences} onChange={handleChange} placeholder="ex: React, Node.js, MongoDB"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Date limite</label>
                                        <input type="date" name="dateLimite" value={formData.dateLimite} onChange={handleChange}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Nombre de postes *</label>
                                        <input type="number" name="nombrePostes" value={formData.nombrePostes} onChange={handleChange} min="1" required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', color: isDark ? '#fefae0' : '#1e293b' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={{
                                        flex: 1, padding: '12px',
                                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        cursor: 'pointer', fontWeight: 'bold',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        {editingOffre ? 'Modifier' : 'Créer'} l'offre
                                    </button>
                                    <button type="button" onClick={() => setShowForm(false)} style={{
                                        flex: 1, padding: '12px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        cursor: 'pointer'
                                    }}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Apply Modal - NOW WITH MODAL PORTAL */}
            {showApplyModal && selectedOffre && (
                <ModalPortal>
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.85)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowApplyModal(false);
                            setLettreMotivation('');
                        }
                    }}
                    >
                        <div style={{
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0',
                            borderRadius: '20px',
                            padding: '30px',
                            width: '100%',
                            maxWidth: '500px',
                            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: isDark ? '#fefae0' : '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiSend style={{ color: roleColor }} /> Postuler à : {selectedOffre.titre}
                                </h3>
                                <button onClick={() => { setShowApplyModal(false); setLettreMotivation(''); }}
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
                                        border: 'none',
                                        color: isDark ? '#fefae0' : '#0f172a',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>✕</button>
                            </div>
                            <form onSubmit={handleApply}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>Lettre de motivation</label>
                                    <textarea 
                                        value={lettreMotivation} 
                                        onChange={(e) => setLettreMotivation(e.target.value)} 
                                        rows="5" 
                                        placeholder="Pourquoi souhaitez-vous postuler à cette offre ?"
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px', 
                                            borderRadius: '8px', 
                                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', 
                                            background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                                            color: isDark ? '#fefae0' : '#1e293b', 
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }} 
                                        required 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" style={{
                                        flex: 1, padding: '12px',
                                        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                                        color: 'white', border: 'none', borderRadius: '10px',
                                        cursor: 'pointer', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <FiSend size={14} /> Envoyer ma candidature
                                    </button>
                                    <button type="button" onClick={() => { setShowApplyModal(false); setLettreMotivation(''); }} style={{
                                        flex: 1, padding: '12px',
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                                        color: isDark ? 'rgba(254,250,224,0.7)' : '#475569',
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1',
                                        borderRadius: '10px',
                                        cursor: 'pointer'
                                    }}>
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Auto Apply Results Modal - NOW WITH MODAL PORTAL (inside component) */}
            {showAutoApplyModal && autoApplyResults && (
                <AutoApplyResultsModal 
                    results={autoApplyResults} 
                    onClose={() => { 
                        setShowAutoApplyModal(false); 
                        setAutoApplyResults(null); 
                    }} 
                />
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
                    align-items: center;
                }
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

export default Offres;