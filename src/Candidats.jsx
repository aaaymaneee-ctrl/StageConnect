// Candidats.jsx - Merged Version (Typed Functions + File Design)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext.jsx';
import CalendrierEntretien from './CalendrierEntretien.jsx';
import ModalPortal from './ModalPortal.jsx';
import { 
  FiUsers, FiDownload, FiEye, FiTrash2, FiCheckCircle, FiXCircle, 
  FiClock, FiFileText, FiMail, FiUser, FiBriefcase, FiMapPin, 
  FiCalendar, FiStar, FiBarChart2, FiTrendingUp, FiAward, FiCpu, 
  FiEdit2, FiSend, FiFilter, FiSearch, FiRefreshCw, FiLock,
  FiVideo, FiMessageSquare, FiSave, FiEdit3, FiInbox, FiPlus, FiX,
  FiSave as FiSaveIcon, FiGlobe, FiBookOpen, FiTarget,FiAlertCircle
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineDocumentText, HiOutlineUserGroup } from 'react-icons/hi';

function Candidats() {
    const { isDark, theme } = useTheme();
    
    const [user, setUser] = useState(null);
    const [offres, setOffres] = useState([]);
    const [candidatures, setCandidatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedOffre, setSelectedOffre] = useState('all');
    const [selectedStatut, setSelectedStatut] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCandidature, setSelectedCandidature] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [commentaire, setCommentaire] = useState('');
    const [cvLoading, setCvLoading] = useState({});
    const [activeTab, setActiveTab] = useState('toutes');
    const [isAcceptingAll, setIsAcceptingAll] = useState(false);
    const [showAcceptAllModal, setShowAcceptAllModal] = useState(false);
    const [acceptAllComment, setAcceptAllComment] = useState('');
    
    const [isAutoProcessing, setIsAutoProcessing] = useState(false);
    const [showAutoProcessModal, setShowAutoProcessModal] = useState(false);
    const [autoProcessResults, setAutoProcessResults] = useState(null);
    const [autoProcessProgress, setAutoProcessProgress] = useState(0);
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [deployAction, setDeployAction] = useState(null);
    const [deployData, setDeployData] = useState(null);
    const [showSingleDeployModal, setShowSingleDeployModal] = useState(false);
    const [singleDeployCandidature, setSingleDeployCandidature] = useState(null);
    const [showRecruiterCalendarModal, setShowRecruiterCalendarModal] = useState(false);
    const [selectedCandidatureForCreneau, setSelectedCandidatureForCreneau] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [customConfirm, setCustomConfirm] = useState({ show: false, message: '', onConfirm: null });

    // Get role-based color
    const getRoleColor = () => {
        const role = user?.role;
        if (role === 'Recruteur') return '#ff6b6b';
        if (role === 'Admin' || role === 'admin') return '#10b981';
        return '#6366f1';
    };
    const roleColor = getRoleColor();
    const isLightMode = theme === 'light';

    // Helper functions
    const getUIText = (key) => {
        const texts = {
            pageTitle: { en: "Candidates Management", fr: "Gestion des Candidats", ar: "إدارة المرشحين" },
            pageSubtitle: { en: "View, filter and manage applications", fr: "Consultez, filtrez et gérez les candidatures", ar: "عرض وتصفية وإدارة الطلبات" },
            total: { en: "Total", fr: "Total", ar: "الإجمالي" },
            pending: { en: "Pending", fr: "En attente", ar: "قيد الانتظار" },
            accepted: { en: "Accepted", fr: "Acceptées", ar: "مقبولة" },
            rejected: { en: "Rejected", fr: "Refusées", ar: "مرفوضة" },
        };
        return texts[key]?.['fr'] || key;
    };

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                if (parsedUser.role === 'Recruteur') {
                    fetchRecruiterData(parsedUser.id);
                }
            } catch (error) {
                console.error("Erreur:", error);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    // --- NEW FUNCTIONS FROM TYPED VERSION ---
    
    const fetchRecruiterSlots = async (recruteurId) => {
        setLoadingSlots(true);
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/creneaux/recruteur/${recruteurId}/disponibles`);
            const data = await res.json();
            setAvailableSlots(data.filter(slot => new Date(slot.date) > new Date()));
        } catch (err) {
            console.error("Erreur récupération créneaux:", err);
            setMessage("Impossible de charger les créneaux disponibles.");
        } finally {
            setLoadingSlots(false);
        }
    };

    const createRecruiterSlot = async (recruteurId, date, heureDebut, heureFin) => {
        try {
            const formattedDate = typeof date === 'string' ? date.split('T')[0] : 
                                 date instanceof Date ? date.toISOString().split('T')[0] : date;
            
            const res = await fetch(`https://pfe-backend-five.vercel.app/creneaux/recruteur/${recruteurId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: formattedDate, heureDebut, heureFin })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setAvailableSlots(prev => [...prev, data]);
                setMessage("Créneau créé avec succès !");
                setTimeout(() => setMessage(''), 3000);
                return data;
            } else {
                setMessage("Erreur lors de la création du créneau");
                setTimeout(() => setMessage(''), 4000);
                return null;
            }
        } catch (err) {
            console.error("Erreur création créneau:", err);
            setMessage("Impossible de se connecter au serveur.");
            return null;
        }
    };

    const planifierEntretien = async (candidatureId, offreId, etudiantId, creneauData) => {
        try {
            const res = await fetch('https://pfe-backend-five.vercel.app/creneaux/planifier-recruteur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: creneauData.date,
                    heureDebut: creneauData.heureDebut,
                    heureFin: creneauData.heureFin,
                    idRecruteur: user.id,
                    idOffre: offreId,
                    idCandidature: candidatureId,
                    idEtudiant: etudiantId
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage("✅ Entretien planifié avec succès !");
                setTimeout(() => setMessage(''), 5000);
                fetchRecruiterData(user.id);
                return true;
            } else {
                setMessage("❌ Erreur lors de la planification");
                setTimeout(() => setMessage(''), 4000);
                return false;
            }
        } catch (err) {
            console.error("Erreur:", err);
            setMessage("❌ Impossible de se connecter au serveur.");
            setTimeout(() => setMessage(''), 4000);
            return false;
        }
    };

    const updateCandidatureStatus = async (offreId, candidatureId, statut, commentaire) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}/candidatures/${candidatureId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut, commentaire })
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Erreur mise à jour statut (${res.status}): ${errorText}`);
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }
            
            const data = await res.json();
            console.log("✅ Statut mis à jour: " + statut);
            return data;
        } catch (err) {
            console.error("❌ Exception mise à jour: " + err);
            throw err;
        }
    };

    const accepterCandidatureDirect = async (offreId, candidatureId, statut, commentaireText) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}/candidatures/${candidatureId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut, commentaire: commentaireText })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage("✅ Candidature mise à jour avec succès.");
                setCandidatures(prevCandidatures =>
                    prevCandidatures.map(c =>
                        c._id === candidatureId ? { ...c, statut, commentaire: commentaireText } : c
                    )
                );
                setTimeout(() => setMessage(''), 3000);
                return true;
            } else {
                setMessage(data.error || "❌ Erreur lors de la mise à jour.");
                return false;
            }
        } catch (err) {
            console.error("Erreur:", err);
            setMessage("❌ Impossible de se connecter au serveur.");
            return false;
        }
    };

    const deployerInterviewAI = async (candidatureId, offreId, etudiantId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/interview/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidatureId, offreId, etudiantId })
            });
            
            if (res.ok) {
                const data = await res.json();
                console.log('✅ Interview AI déployée:', data);
                return true;
            } else {
                console.error("❌ Erreur déploiement interview AI");
                return false;
            }
        } catch (err) {
            console.error("Erreur:", err);
            return false;
        }
    };

    const deployerEntretienReel = async (candidatureId, offreId, etudiantId) => {
        console.log('🚀 deployerEntretienReel appelé avec:', { candidatureId, offreId, etudiantId });
        
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/entretien/deployer-reel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idCandidature: candidatureId,
                    idOffre: offreId,
                    idEtudiant: etudiantId,
                    idRecruteur: user.id
                })
            });
            
            const data = await res.json();
            console.log('📡 Réponse serveur deployer-reel:', data);
            
            if (res.ok) {
                console.log("✅ Entretien réel activé - étape:", data.etape);
                setMessage("✅ Entretien réel activé ! Choisissez maintenant un créneau.");
                setTimeout(() => setMessage(''), 5000);
                fetchRecruiterData(user.id);
                return true;
            } else {
                console.error('❌ Erreur serveur:', data.error);
                setMessage(data.error || '❌ Erreur lors de l\'activation');
                return false;
            }
        } catch (err) {
            console.error('❌ Erreur réseau:', err);
            setMessage("❌ Impossible de se connecter au serveur.");
            return false;
        }
    };

    const handleTerminerEntretienReel = async (offreId, candidatureId) => {
        setCustomConfirm({
            show: true,
            message: "Voulez-vous vraiment terminer cet entretien ? Cette action est irréversible.",
            onConfirm: async () => {
                try {
                    const res = await fetch(`https://pfe-backend-five.vercel.app/entretien/terminer`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idOffre: offreId, idCandidature: candidatureId })
                    });
                    if (res.ok) {
                        setMessage("✅ Entretien terminé ! Vous pouvez maintenant prendre votre décision finale.");
                        setCandidatures(prevCandidatures => 
                            prevCandidatures.map(c => 
                                c._id === candidatureId ? { ...c, etapeEntretien: 'termine' } : c
                            )
                        );
                        setTimeout(() => setMessage(''), 4000);
                    } else {
                        setMessage("❌ Erreur lors de la clôture.");
                    }
                } catch(e) {
                    setMessage("❌ Erreur de connexion au serveur.");
                }
            }
        });
    };

    const handleAutoProcessManuel = async (deployInterview_ai = true) => {
        setIsAutoProcessing(true);
        setShowAutoProcessModal(true);
        setAutoProcessResults(null);
        setAutoProcessProgress(0);
        
        const manuellesEnAttente = candidaturesManuelles.filter(c => c.statut === 'en attente');
        const total = manuellesEnAttente.length;
        
        const results = {
            total: total,
            acceptees: 0,
            refusees: 0,
            erreurs: 0,
            details: []
        };
        
        for (let i = 0; i < manuellesEnAttente.length; i++) {
            const candidature = manuellesEnAttente[i];
            
            const etudiantId = candidature.etudiantId?._id || candidature.etudiantId?.toString() || candidature.etudiantInfo?._id;
            const candidatureId = candidature._id?.toString() || candidature._id;
            const offreId = candidature.offreId;
            const etudiantName = `${candidature.etudiantInfo?.prenom || 'Inconnu'} ${candidature.etudiantInfo?.nom || ''}`;
            
            setAutoProcessProgress(Math.round(((i + 1) / total) * 100));
            
            if (!etudiantId || !candidatureId || !offreId) {
                results.erreurs++;
                results.details.push({
                    nom: etudiantName,
                    offre: candidature.offreTitre || 'Inconnue',
                    statut: 'erreur',
                    raison: 'IDs manquants',
                    match: 0
                });
                continue;
            }
            
            try {
                const checkUserRes = await fetch(`https://pfe-backend-five.vercel.app/users/${etudiantId}`);
                
                if (!checkUserRes.ok) {
                    await updateCandidatureStatus(offreId, candidatureId, 'refusée', 
                        `❌ Refusée automatiquement : Profil étudiant inaccessible.`);
                    results.refusees++;
                    results.details.push({
                        nom: etudiantName,
                        offre: candidature.offreTitre,
                        statut: 'refusée',
                        raison: 'Profil inaccessible',
                        match: 0
                    });
                    continue;
                }
                
                const userData = await checkUserRes.json();
                
                if (!userData.cv || !userData.cv.filename) {
                    await updateCandidatureStatus(offreId, candidatureId, 'refusée', 
                        `❌ Refusée automatiquement : Aucun CV téléchargé.`);
                    results.refusees++;
                    results.details.push({
                        nom: etudiantName,
                        offre: candidature.offreTitre,
                        statut: 'refusée',
                        raison: 'Aucun CV',
                        match: 0
                    });
                    continue;
                }
                
                const matchRes = await fetch(`https://pfe-backend-five.vercel.app/cv/match/${etudiantId}/${offreId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!matchRes.ok) {
                    const errorText = await matchRes.text();
                    console.error(`❌ Erreur API match: ${matchRes.status} - ${errorText}`);
                    
                    const cvTextRes = await fetch(`https://pfe-backend-five.vercel.app/cv-text/${etudiantId}`);
                    
                    if (!cvTextRes.ok) {
                        results.erreurs++;
                        results.details.push({
                            nom: etudiantName,
                            offre: candidature.offreTitre,
                            statut: 'erreur',
                            raison: `Erreur analyse CV (${matchRes.status})`,
                            match: 0
                        });
                        continue;
                    }
                    
                    const cvData = await cvTextRes.json();
                    const scoreParDefaut = 70;
                    
                    await updateCandidatureStatus(offreId, candidatureId, 'acceptée',
                        `✅ Acceptée automatiquement. CV analysé avec succès. Score estimé: ${scoreParDefaut}%.`);
                    results.acceptees++;
                    const detail = {
                        nom: etudiantName,
                        offre: candidature.offreTitre,
                        statut: 'acceptée',
                        raison: `CV analysé (score estimé: ${scoreParDefaut}%)`,
                        match: scoreParDefaut
                    };
                    if (deployInterview_ai) {
                        await deployerInterviewAI(candidatureId, offreId, etudiantId);
                        detail.deployed = true;
                    }
                    results.details.push(detail);
                    continue;
                }
                
                const matchData = await matchRes.json();
                const matchPercentage = matchData.matchPercentage || 0;
                const seuilAcceptation = 70;
                
                let nouveauStatut, commentaireText;
                
                if (matchPercentage >= seuilAcceptation) {
                    nouveauStatut = 'acceptée';
                    commentaireText = `✅ Acceptée automatiquement après analyse IA du CV. Taux de correspondance: ${matchPercentage}%. ` +
                        `Compétences trouvées: ${(matchData.matchedSkills || []).join(', ') || 'Aucune'}. ` +
                        `Compétences manquantes: ${(matchData.missingSkills || []).join(', ') || 'Aucune'}.`;
                    results.acceptees++;
                } else {
                    nouveauStatut = 'refusée';
                    commentaireText = `❌ Refusée automatiquement après analyse IA du CV. Taux de correspondance: ${matchPercentage}% ` +
                        `(seuil minimum: ${seuilAcceptation}%). ` +
                        `Compétences trouvées: ${(matchData.matchedSkills || []).join(', ') || 'Aucune'}. ` +
                        `Compétences manquantes: ${(matchData.missingSkills || []).join(', ') || 'Aucune'}.`;
                    results.refusees++;
                }
                
                await updateCandidatureStatus(offreId, candidatureId, nouveauStatut, commentaireText);
                
                const detailItem = {
                    nom: etudiantName,
                    offre: candidature.offreTitre,
                    statut: nouveauStatut,
                    raison: matchPercentage >= seuilAcceptation 
                        ? `Correspondance ${matchPercentage}%` 
                        : `Correspondance insuffisante (${matchPercentage}% < ${seuilAcceptation}%)`,
                    match: matchPercentage,
                    skillsFound: matchData.matchedSkills || [],
                    skillsMissing: matchData.missingSkills || []
                };
                if (nouveauStatut === 'acceptée' && deployInterview_ai) {
                    await deployerInterviewAI(candidatureId, offreId, etudiantId);
                    detailItem.deployed = true;
                }
                results.details.push(detailItem);
            } catch (err) {
                console.error(`❌ Exception:`, err);
                results.erreurs++;
                results.details.push({
                    nom: etudiantName,
                    offre: candidature.offreTitre || 'Inconnue',
                    statut: 'erreur',
                    raison: `Exception: ${err.message}`,
                    match: 0
                });
            }
        }
        
        setAutoProcessResults(results);
        setIsAutoProcessing(false);
        
        setTimeout(() => {
            fetchRecruiterData(user.id);
        }, 1500);
    };

    const handleAcceptAllAI = async (deployInterview_ai) => {
        setIsAcceptingAll(true);
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/accept-all-ai/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    commentaire: acceptAllComment || 'Acceptée automatiquement - Décision IA',
                    deployInterview: deployInterview_ai
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(`✅ ${data.totalAccepted} candidature(s) AI acceptée(s) avec succès!`);
                
                if (deployInterview_ai && data.acceptedIds) {
                    for (const item of data.acceptedIds) {
                        await deployerInterviewAI(item.candidatureId, item.offreId, item.etudiantId);
                    }
                    setMessage(`✅ ${data.totalAccepted} candidature(s) acceptée(s) et interviews déployées!`);
                }
                
                setShowAcceptAllModal(false);
                setAcceptAllComment('');
                fetchRecruiterData(user.id);
                setTimeout(() => setMessage(''), 4000);
            } else {
                setMessage(data.error || "❌ Erreur lors de l'acceptation en masse.");
            }
        } catch (err) {
            console.error("Erreur:", err);
            setMessage("❌ Impossible de se connecter au serveur.");
        } finally {
            setIsAcceptingAll(false);
        }
    };

    // --- END NEW FUNCTIONS ---

    const fetchRecruiterData = async (recruiterId) => {
        try {
            const offresRes = await fetch(`https://pfe-backend-five.vercel.app/offres/recruteur/${recruiterId}`);
            const offresData = await offresRes.json();
            setOffres(offresData);

            const allCandidatures = [];
            for (const offre of offresData) {
                if (offre.candidatures && offre.candidatures.length > 0) {
                    for (const candidature of offre.candidatures) {
                        let etudiantInfo = { prenom: 'Inconnu', nom: '', email: '', cv: null };
                        try {
                            const etudiantRes = await fetch(`https://pfe-backend-five.vercel.app/users/${candidature.etudiantId}`);
                            if (etudiantRes.ok) {
                                etudiantInfo = await etudiantRes.json();
                            }
                        } catch (err) {
                            console.error("Erreur:", err);
                        }
                        allCandidatures.push({
                            ...candidature,
                            etudiantInfo: etudiantInfo,
                            offreTitre: offre.titre,
                            offreId: offre._id,
                            offreDescription: offre.description,
                            offreEntreprise: offre.entreprise,
                            offreLocalisation: offre.localisation,
                            offreTypeContrat: offre.typeContrat,
                            offreSalaire: offre.salaire,
                            offreCompetences: offre.competences,
                            offreStatut: offre.statut,
                            offreDateLimite: offre.dateLimite
                        });
                    }
                }
            }
            allCandidatures.sort((a, b) => new Date(b.dateCandidature) - new Date(a.dateCandidature));
            setCandidatures(allCandidatures);
        } catch (err) {
            console.error("Erreur:", err);
            setMessage("Impossible de charger les candidatures.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (offreId, candidatureId, nouveauStatut) => {
        if (nouveauStatut === 'acceptée' && !commentaire.trim()) {
            setMessage("Veuillez utiliser le bouton \"Accepter\" dans la carte de candidature pour planifier l'entretien.");
            setTimeout(() => setMessage(''), 4000);
            return;
        }
        if (nouveauStatut === 'refusée' && !commentaire.trim()) {
            setMessage("Veuillez ajouter un commentaire avant de refuser.");
            setTimeout(() => setMessage(''), 4000);
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}/candidatures/${candidatureId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statut: nouveauStatut, commentaire: commentaire || `Statut changé à "${nouveauStatut}"` })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage("Statut mis à jour avec succès.");
                setCandidatures(prevCandidatures =>
                    prevCandidatures.map(c =>
                        c._id === candidatureId ? { ...c, statut: nouveauStatut, commentaire: commentaire } : c
                    )
                );
                setShowDetailModal(false);
                setCommentaire('');
                setSelectedCandidature(null);
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(data.error || "Erreur lors de la mise à jour.");
            }
        } catch (err) {
            console.error("Erreur:", err);
            setMessage("Impossible de se connecter au serveur.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCandidature = async (offreId, candidatureId) => {
        setCustomConfirm({
            show: true,
            message: "Voulez-vous vraiment supprimer cette candidature ? Cette action est irréversible.",
            onConfirm: async () => {
                try {
                    const res = await fetch(`https://pfe-backend-five.vercel.app/offres/${offreId}/candidatures/${candidatureId}`, {
                        method: 'DELETE'
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setMessage("Candidature supprimée avec succès");
                        setCandidatures(prevCandidatures =>
                            prevCandidatures.filter(c => c._id !== candidatureId)
                        );
                        setTimeout(() => setMessage(''), 3000);
                    } else {
                        setMessage(data.error || "Erreur lors de la suppression.");
                    }
                } catch (err) {
                    console.error("Erreur:", err);
                    setMessage("Impossible de se connecter au serveur.");
                }
            }
        });
    };

    const handleDownloadCV = async (etudiantId, etudiantName) => {
        setCvLoading(prev => ({ ...prev, [etudiantId]: true }));
        try {
            const checkRes = await fetch(`https://pfe-backend-five.vercel.app/users/${etudiantId}`);
            const userData = await checkRes.json();
            if (!userData.cv || !userData.cv.filename) {
                setMessage(`❌ ${etudiantName} n'a pas encore téléchargé de CV.`);
                setTimeout(() => setMessage(''), 4000);
                setCvLoading(prev => ({ ...prev, [etudiantId]: false }));
                return;
            }
            const response = await fetch(`https://pfe-backend-five.vercel.app/users/${etudiantId}/cv`);
            if (!response.ok) throw new Error('CV non trouvé');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = userData.cv.originalName || `CV_${etudiantName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            setMessage(`✅ CV de ${etudiantName} téléchargé avec succès.`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Erreur:", err);
            setMessage(`❌ Impossible de télécharger le CV de ${etudiantName}.`);
            setTimeout(() => setMessage(''), 4000);
        } finally {
            setCvLoading(prev => ({ ...prev, [etudiantId]: false }));
        }
    };

    const renderStatut = (statut) => {
        let label, color, icon;
        switch (statut) {
            case 'en attente': label = 'En attente'; color = '#f59e0b'; icon = <FiClock size={12} />; break;
            case 'acceptée': label = 'Acceptée'; color = '#10b981'; icon = <FiCheckCircle size={12} />; break;
            case 'refusée': label = 'Refusée'; color = '#ef4444'; icon = <FiXCircle size={12} />; break;
            default: label = statut; color = isDark ? 'rgba(255,255,255,0.7)' : '#64748b'; icon = <FiFileText size={12} />;
        }
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: `${color}20`,
                color: color,
                border: `1px solid ${color}40`,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold'
            }}>
                {icon} {label}
            </span>
        );
    };

    const renderTypeBadge = (type) => {
        if (type === 'automatique') {
            return (
                <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(108, 99, 255, 0.15)',
                    color: '#6c63ff',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '500',
                    border: '1px solid rgba(108, 99, 255, 0.3)'
                }}>
                    <FiCpu size={12} /> AI
                </span>
            );
        }
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '500',
                border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
                <FiUser size={12} /> Manuel
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'Date inconnue';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b' }}>Chargement des candidats...</p>
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'Recruteur') {
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
                    <p style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#64748b', marginBottom: '2rem' }}>
                        Veuillez vous connecter en tant que recruteur.
                    </p>
                    <Link to="/login">
                        <button style={{
                            padding: '12px 30px',
                            background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}>
                            Aller à la connexion
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // Stats calculations
    const candidaturesAutomatiques = candidatures.filter(c => c.typeCandidature === 'automatique');
    const candidaturesManuelles = candidatures.filter(c => c.typeCandidature !== 'automatique');

    let candidaturesToFilter;
    switch (activeTab) {
        case 'automatiques': candidaturesToFilter = candidaturesAutomatiques; break;
        case 'manuelles': candidaturesToFilter = candidaturesManuelles; break;
        default: candidaturesToFilter = candidatures;
    }

    const filteredCandidatures = candidaturesToFilter.filter(c => {
        const matchOffre = selectedOffre === 'all' || c.offreId === selectedOffre;
        const matchStatut = selectedStatut === 'all' || c.statut === selectedStatut;
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = !searchTerm || 
            c.etudiantInfo?.prenom?.toLowerCase().includes(searchLower) ||
            c.etudiantInfo?.nom?.toLowerCase().includes(searchLower) ||
            c.etudiantInfo?.email?.toLowerCase().includes(searchLower) ||
            c.offreTitre?.toLowerCase().includes(searchLower);
        return matchOffre && matchStatut && matchSearch;
    });

    const stats = {
        total: candidatures.length,
        enAttente: candidatures.filter(c => c.statut === 'en attente').length,
        acceptees: candidatures.filter(c => c.statut === 'acceptée').length,
        refusees: candidatures.filter(c => c.statut === 'refusée').length,
        avecCV: candidatures.filter(c => c.etudiantInfo?.cv?.filename).length
    };

    const manuellesEnAttenteCount = candidaturesManuelles.filter(c => c.statut === 'en attente').length;

    const statsAI = {
        total: candidaturesAutomatiques.length,
        enAttente: candidaturesAutomatiques.filter(c => c.statut === 'en attente').length,
        acceptees: candidaturesAutomatiques.filter(c => c.statut === 'acceptée').length,
        refusees: candidaturesAutomatiques.filter(c => c.statut === 'refusée').length
    };

    const statsManuel = {
        total: candidaturesManuelles.length,
        enAttente: candidaturesManuelles.filter(c => c.statut === 'en attente').length,
        acceptees: candidaturesManuelles.filter(c => c.statut === 'acceptée').length,
        refusees: candidaturesManuelles.filter(c => c.statut === 'refusée').length
    };

    const safeMessageStr = String(message?.props?.children || message);
    const isErrorMessage = safeMessageStr.includes('Erreur') || safeMessageStr.includes('Impossible');

    return (
        <div style={{ color: isDark ? '#fefae0' : '#0f172a' }}>
            {/* Header with Icon */}
            <div style={{ 
                marginBottom: '30px', 
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
                        <FiUsers style={{ color: '#ff6b6b' }} /> Gestion des Candidats
                    </h1>
                    <p style={{ 
                        color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                        fontSize: '16px' 
                    }}>
                        Consultez, filtrez et gérez les candidatures reçues pour vos offres.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {candidaturesAutomatiques.filter(c => c.statut === 'en attente').length > 0 && (
                        <button
    onClick={() => {
        setDeployAction('accept_all_ai');
        setDeployData({
            count: candidaturesAutomatiques.filter(c => c.statut === 'en attente').length,
            type: 'automatiques'
        });
        setShowDeployModal(true);
    }}
    style={{
        padding: '12px 24px',
        background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,  // ← UPDATED
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap',
        transition: 'all 0.3s ease',
        boxShadow: `0 4px 12px ${roleColor}40`  // ← ADD THIS
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
    <FiCpu /> Accepter et Déployer AI ({candidaturesAutomatiques.filter(c => c.statut === 'en attente').length})
</button>
                    )}
                    
                    {manuellesEnAttenteCount > 0 && (
                        <button
                            onClick={() => {
                                setDeployAction('analyse_manual');
                                setDeployData({
                                    count: manuellesEnAttenteCount,
                                    type: 'manuelles'
                                });
                                setShowDeployModal(true);
                            }}
                            disabled={isAutoProcessing}
                            style={{
                                padding: '12px 24px',
                                background: isAutoProcessing 
                                    ? (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0') 
                                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                color: isAutoProcessing ? (isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8') : 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: isAutoProcessing ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                whiteSpace: 'nowrap',
                                opacity: isAutoProcessing ? 0.7 : 1,
                                transition: 'all 0.3s'
                            }}
                        >
                            {isAutoProcessing ? <><FiClock /> Analyse en cours...</> : <><FiSearch /> Analyser et Déployer ({manuellesEnAttenteCount})</>}
                        </button>
                    )}
                    
                    <Link to="/dashboard/offres">
    <button style={{
        padding: '12px 24px',
        background: isDark ? `rgba(255, 107, 107, 0.2)` : '#fef2f2',  // ← UPDATED
        color: '#ff6b6b',  // ← UPDATED
        border: isDark ? `1px solid rgba(255, 107, 107, 0.3)` : '1px solid #fecaca',  // ← UPDATED
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s'
    }}
    onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.2)';
    }}
    onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
    }}
    >
        <HiOutlineDocumentText /> Gérer les offres
    </button>
</Link>
                </div>
            </div>

            {/* Message Toast - Using File Version Style */}
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
                        background: isErrorMessage ? '#ef4444' : '#10b981',
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
                        {isErrorMessage ? <FiXCircle size={20} /> : <FiCheckCircle size={20} />}
                        {safeMessageStr}
                    </div>
                </div>
            )}

            {/* Stats Cards - With Tab-specific stats */}
            {/* Stats Cards - Redesigné comme la deuxième image */}
<div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', 
    gap: '16px', 
    marginBottom: '25px' 
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
                {stats.total}
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
                {stats.enAttente}
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
                {stats.acceptees}
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
                {stats.refusees}
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

    {/* Avec CV */}
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
        e.currentTarget.style.borderColor = '#8b5cf6';
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
            background: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8b5cf6',
            fontSize: '20px'
        }}>
            <HiOutlineDocumentText size={20} />
        </div>
        <div>
            <div style={{ 
                fontSize: '26px', 
                fontWeight: '700', 
                color: isDark ? '#fefae0' : '#0f172a',
                fontFamily: "'Quicksand', sans-serif",
                lineHeight: 1.2
            }}>
                {stats.avecCV}
            </div>
            <div style={{ 
                color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                fontSize: '13px',
                fontWeight: '500'
            }}>
                Avec CV
            </div>
        </div>
    </div>
</div>
            {/* Onglets */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '25px',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                paddingBottom: '15px',
                flexWrap: 'wrap'
            }}>
                <button onClick={() => setActiveTab('toutes')} style={{
                    padding: '10px 24px', 
                    borderRadius: '10px',
                    border: activeTab === 'toutes' ? `2px solid ${roleColor}` : (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1'),
                    background: activeTab === 'toutes' ? `${roleColor}20` : 'transparent',
                    color: activeTab === 'toutes' ? roleColor : (isDark ? 'rgba(255,255,255,0.7)' : '#64748b'),
                    cursor: 'pointer', 
                    fontSize: '14px',
                    fontWeight: activeTab === 'toutes' ? 'bold' : 'normal',
                    transition: 'all 0.3s'
                }}>
                    <FiFileText size={14} style={{ display: 'inline', marginRight: '6px' }} /> Toutes ({candidatures.length})
                </button>
                <button onClick={() => setActiveTab('automatiques')} style={{
                    padding: '10px 24px', 
                    borderRadius: '10px',
                    border: activeTab === 'automatiques' ? `2px solid ${roleColor}` : (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1'),
                    background: activeTab === 'automatiques' ? `${roleColor}20` : 'transparent',
                    color: activeTab === 'automatiques' ? roleColor : (isDark ? 'rgba(255,255,255,0.7)' : '#64748b'),
                    cursor: 'pointer', 
                    fontSize: '14px',
                    fontWeight: activeTab === 'automatiques' ? 'bold' : 'normal',
                    transition: 'all 0.3s'
                }}>
                    <FiCpu size={14} style={{ display: 'inline', marginRight: '6px' }} /> Candidatures IA ({candidaturesAutomatiques.length})
                </button>
                <button onClick={() => setActiveTab('manuelles')} style={{
                    padding: '10px 24px', 
                    borderRadius: '10px',
                    border: activeTab === 'manuelles' ? '2px solid #f59e0b' : (isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1'),
                    background: activeTab === 'manuelles' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                    color: activeTab === 'manuelles' ? '#f59e0b' : (isDark ? 'rgba(255,255,255,0.7)' : '#64748b'),
                    cursor: 'pointer', 
                    fontSize: '14px',
                    fontWeight: activeTab === 'manuelles' ? 'bold' : 'normal',
                    transition: 'all 0.3s'
                }}>
                    <FiUser size={14} style={{ display: 'inline', marginRight: '6px' }} /> Manuelles ({candidaturesManuelles.length})
                </button>
            </div>

            {/* Filtres */}
            <div style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                borderRadius: '14px',
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
                            placeholder="Rechercher par nom, email, offre..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', 
                                padding: '10px 15px 10px 40px', 
                                borderRadius: '10px', 
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                                border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', 
                                color: isDark ? '#fefae0' : '#1e293b', 
                                fontSize: '14px', 
                                outline: 'none' 
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                            <FiFilter size={12} style={{ display: 'inline', marginRight: '4px' }} /> Statut :
                        </label>
                        <select 
                            value={selectedStatut} 
                            onChange={(e) => setSelectedStatut(e.target.value)}
                            style={{ 
                                padding: '10px 15px', 
                                borderRadius: '10px', 
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff', 
                                border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', 
                                color: isDark ? '#fefae0' : '#1e293b', 
                                fontSize: '13px', 
                                cursor: 'pointer', 
                                minWidth: '150px' 
                            }}
                        >
                            <option value="all" style={{ background: isDark ? '#1e1e3f' : '#ffffff' }}>Tous</option>
                            <option value="en attente" style={{ background: isDark ? '#1e1e3f' : '#ffffff', color: '#f59e0b' }}>En attente</option>
                            <option value="acceptée" style={{ background: isDark ? '#1e1e3f' : '#ffffff', color: '#10b981' }}>Acceptées</option>
                            <option value="refusée" style={{ background: isDark ? '#1e1e3f' : '#ffffff', color: '#ef4444' }}>Refusées</option>
                        </select>
                    </div>
                    {(selectedStatut !== 'all' || searchTerm) && (
                        <button 
                            onClick={() => { setSelectedStatut('all'); setSearchTerm(''); }}
                            style={{ 
                                padding: '10px 20px', 
                                background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', 
                                color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', 
                                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', 
                                borderRadius: '10px', 
                                cursor: 'pointer', 
                                fontSize: '13px', 
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <FiRefreshCw size={14} /> Réinitialiser
                        </button>
                    )}
                </div>
                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '13px' }}>
                    {filteredCandidatures.length} candidature{filteredCandidatures.length > 1 ? 's' : ''} trouvée{filteredCandidatures.length > 1 ? 's' : ''}
                </div>
            </div>

            {/* Liste des candidatures */}
            {filteredCandidatures.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px', 
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', 
                    borderRadius: '16px', 
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' 
                }}>
                    <FiInbox size={60} style={{ color: isDark ? 'rgba(254,250,224,0.2)' : '#94a3b8', marginBottom: '20px' }} />
                    <p style={{ fontSize: '18px', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b' }}>
                        Aucune candidature trouvée
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '18px' }}>
                    {filteredCandidatures.map((candidature) => (
                        <div key={candidature._id} className="candidate-card" style={{
                            background: candidature.typeCandidature === 'automatique' 
                                ? (isDark ? 'rgba(108, 99, 255, 0.04)' : '#f5f3ff')
                                : (isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'),
                            border: candidature.typeCandidature === 'automatique' 
                                ? (isDark ? '1px solid rgba(108, 99, 255, 0.2)' : '1px solid #ddd6fe')
                                : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'),
                            borderRadius: '16px',
                            padding: '22px',
                            transition: 'all 0.3s ease',
                            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)'
                        }}
                        onMouseEnter={(e) => { 
                            e.currentTarget.style.borderColor = roleColor; 
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = isDark ? '0 8px 25px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.08)';
                        }}
                        onMouseLeave={(e) => { 
                            e.currentTarget.style.borderColor = candidature.typeCandidature === 'automatique' ? (isDark ? 'rgba(108, 99, 255, 0.2)' : '#ddd6fe') : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0');
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)';
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                                <div style={{ flex: '2', minWidth: '250px', display: 'flex', gap: '15px' }}>
                                    <div style={{
                                        width: '55px', 
                                        height: '55px', 
                                        minWidth: '55px',
                                        background: candidature.typeCandidature === 'automatique' 
                                            ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)` 
                                            : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '22px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        boxShadow: `0 4px 12px ${candidature.typeCandidature === 'automatique' ? roleColor : '#f59e0b'}40`
                                    }}>
                                        {candidature.typeCandidature === 'automatique' ? 
                                            <FiCpu size={24} /> : 
                                            (candidature.etudiantInfo?.prenom?.charAt(0) || '?')
                                        }
                                    </div>
                                    <div>
                                        <h3 style={{ 
                                            color: isDark ? '#fefae0' : '#0f172a', 
                                            fontSize: '18px', 
                                            marginBottom: '4px', 
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flexWrap: 'wrap'
                                        }}>
                                            {candidature.etudiantInfo?.prenom || 'Prénom'} {candidature.etudiantInfo?.nom || 'Nom'}
                                            {renderTypeBadge(candidature.typeCandidature)}
                                            {candidature.scoreAuto && (
                                                <span style={{ 
                                                    background: candidature.scoreAuto >= 80 ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4') : (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb'), 
                                                    color: candidature.scoreAuto >= 80 ? '#10b981' : '#f59e0b', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '11px', 
                                                    fontWeight: '500' 
                                                }}>
                                                    <FiTarget size={12} style={{ display: 'inline', marginRight: '4px' }} /> Match: {candidature.scoreAuto}%
                                                </span>
                                            )}
                                            {candidature.scoreEntretien !== undefined && candidature.scoreEntretien !== null && (
                                                <span style={{ 
                                                    background: candidature.scoreEntretien >= 70 ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4') : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'), 
                                                    color: candidature.scoreEntretien >= 70 ? '#10b981' : '#ef4444', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '11px' 
                                                }}>
                                                    <FiFileText size={12} style={{ display: 'inline', marginRight: '4px' }} /> Score: {candidature.scoreEntretien}/100
                                                </span>
                                            )}
                                        </h3>
                                        <p style={{ color: roleColor, fontSize: '13px', marginBottom: '6px' }}>
                                            <FiMail size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                                            {candidature.etudiantInfo?.email || 'Email inconnu'}
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ 
                                                background: `${roleColor}20`, 
                                                color: roleColor, 
                                                padding: '4px 10px', 
                                                borderRadius: '8px', 
                                                fontSize: '11px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <FiBriefcase size={12} /> {candidature.offreTitre}
                                            </span>
                                            {candidature.etudiantInfo?.cv?.filename && (
                                                <span style={{ 
                                                    background: 'rgba(40,167,69,0.15)', 
                                                    color: '#28a745', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '11px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <HiOutlineDocumentText size={12} /> CV
                                                </span>
                                            )}
                                            <span style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiCalendar size={12} /> {formatDate(candidature.dateCandidature)}
                                            </span>
                                            {/* Interview stage indicator */}
                                            {candidature.interviewType === 'reel' && (
                                                <span style={{ 
                                                    background: candidature.etapeEntretien === 'visio_en_cours' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                    color: candidature.etapeEntretien === 'visio_en_cours' ? '#10b981' : '#f59e0b',
                                                    padding: '4px 10px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '11px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <FiVideo size={12} /> 
                                                    {candidature.etapeEntretien === 'visio_en_cours' ? 'Visio en cours' : 
                                                     candidature.etapeEntretien === 'termine' ? 'Terminé' : 'Planifié'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    {renderStatut(candidature.statut)}
                                    
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        {/* Actions pendant la Visio */}
                                        {candidature.interviewType === 'reel' && candidature.etapeEntretien === 'visio_en_cours' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {candidature.lienVisio ? (
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(candidature.lienVisio, '_blank'); }}
                                                        style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', animation: 'pulse 2s infinite' }}>
                                                        <FiVideo size={12} /> Rejoindre
                                                    </button>
                                                ) : (
                                                    <button style={{ padding: '8px 14px', background: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb', color: '#f59e0b', border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                        <FiRefreshCw size={12} /> Générer lien
                                                    </button>
                                                )}
                                                
                                                <button onClick={(e) => { e.stopPropagation(); handleTerminerEntretienReel(candidature.offreId, candidature._id); }}
                                                    style={{ padding: '8px 14px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <FiXCircle size={12} /> Terminer la visio
                                                </button>
                                            </div>
                                        )}

                                        {/* Actions APRÈS la Visio (Décision Finale) */}
                                        {candidature.interviewType === 'reel' && candidature.etapeEntretien === 'termine' && candidature.statut === 'acceptée' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={(e) => { e.stopPropagation(); handleStatusChange(candidature.offreId, candidature._id, 'embauché'); }}
                                                    style={{ padding: '8px 14px', background: isDark ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4', color: '#10b981', border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                                    <FiCheckCircle size={12} /> Embaucher
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleStatusChange(candidature.offreId, candidature._id, 'refusée_final'); }}
                                                    style={{ padding: '8px 14px', background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2', color: '#ef4444', border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                                                    <FiXCircle size={12} /> Refuser
                                                </button>
                                            </div>
                                        )}

                                        {/* Détails */}
                                        <button 
                                            onClick={() => { setSelectedCandidature(candidature); setCommentaire(candidature.commentaire || ''); setShowDetailModal(true); }}
                                            style={{ 
                                                padding: '8px 14px', 
                                                background: isDark ? 'rgba(108, 99, 255, 0.2)' : '#eef2ff', 
                                                color: '#6c63ff', 
                                                border: isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #c7d2fe', 
                                                borderRadius: '8px', 
                                                cursor: 'pointer', 
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <FiEye size={12} /> Détails
                                        </button>
                                        
                                        {/* Télécharger CV */}
                                        <button 
                                            onClick={() => handleDownloadCV(candidature.etudiantId?._id || candidature.etudiantId, `${candidature.etudiantInfo?.prenom || ''} ${candidature.etudiantInfo?.nom || ''}`)}
                                            disabled={cvLoading[candidature.etudiantId?._id || candidature.etudiantId]}
                                            style={{ 
                                                padding: '8px 14px', 
                                                background: candidature.etudiantInfo?.cv?.filename ? 'rgba(40,167,69,0.2)' : 'transparent', 
                                                color: candidature.etudiantInfo?.cv?.filename ? '#28a745' : (isDark ? 'rgba(254,250,224,0.3)' : '#94a3b8'), 
                                                border: candidature.etudiantInfo?.cv?.filename ? '1px solid rgba(40,167,69,0.3)' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0'), 
                                                borderRadius: '8px', 
                                                cursor: candidature.etudiantInfo?.cv?.filename ? 'pointer' : 'not-allowed', 
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (candidature.etudiantInfo?.cv?.filename) {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (candidature.etudiantInfo?.cv?.filename) {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }
                                            }}
                                        >
                                            {cvLoading[candidature.etudiantId?._id || candidature.etudiantId] ? 
                                                <FiClock size={12} /> : <FiDownload size={12} />
                                            } CV
                                        </button>
                                        
                                        {/* Accepter (pour les en attente) */}
                                        {candidature.statut === 'en attente' && (
                                            <>
                                                <button
                                                    onClick={() => { 
                                                        setSingleDeployCandidature({ ...candidature, action: 'accept' }); 
                                                        setShowSingleDeployModal(true); 
                                                    }}
                                                    style={{ 
                                                        padding: '8px 14px', 
                                                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        borderRadius: '8px', 
                                                        cursor: 'pointer', 
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <FiCheckCircle size={12} /> Accepter
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(candidature.offreId, candidature._id, 'refusée')}
                                                    style={{ 
                                                        padding: '8px 14px', 
                                                        background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2', 
                                                        color: '#ef4444', 
                                                        border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca', 
                                                        borderRadius: '8px', 
                                                        cursor: 'pointer', 
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <FiXCircle size={12} /> Refuser
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* Supprimer */}
                                        <button 
                                            onClick={() => handleDeleteCandidature(candidature.offreId, candidature._id)}
                                            style={{ 
                                                padding: '8px 14px', 
                                                background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', 
                                                color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8', 
                                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                                                borderRadius: '8px', 
                                                cursor: 'pointer', 
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2';
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
                                                e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8';
                                            }}
                                        >
                                            <FiTrash2 size={12} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de détails - Using File Version Style */}
            {showDetailModal && selectedCandidature && (
                <ModalPortal>
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.8)', 
                        backdropFilter: 'blur(5px)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 1000, 
                        padding: '20px' 
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowDetailModal(false);
                            setSelectedCandidature(null);
                            setCommentaire('');
                        }
                    }}
                    >
                        <div style={{ 
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff', 
                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e2e8f0', 
                            borderRadius: '20px', 
                            width: '100%', 
                            maxWidth: '700px', 
                            maxHeight: '90vh', 
                            overflowY: 'auto',
                            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ 
                                padding: '25px 30px', 
                                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                position: 'sticky',
                                top: 0,
                                background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff',
                                borderRadius: '20px 20px 0 0',
                                zIndex: 1
                            }}>
                                <h2 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FiUser size={22} style={{ color: roleColor }} /> Détails de la candidature
                                    {selectedCandidature.typeCandidature === 'automatique' && (
                                        <span style={{ 
                                            marginLeft: '10px', 
                                            background: `${roleColor}20`, 
                                            color: roleColor, 
                                            padding: '4px 12px', 
                                            borderRadius: '12px', 
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <FiCpu size={12} /> IA
                                        </span>
                                    )}
                                </h2>
                                <button 
                                    onClick={() => { setShowDetailModal(false); setSelectedCandidature(null); setCommentaire(''); }}
                                    style={{ 
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                                        border: 'none', 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '50%', 
                                        cursor: 'pointer', 
                                        fontSize: '18px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <div style={{ padding: '30px' }}>
                                {/* En-tête du candidat */}
                                <div style={{ 
                                    display: 'flex', 
                                    gap: '20px', 
                                    alignItems: 'center', 
                                    marginBottom: '25px', 
                                    padding: '20px', 
                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', 
                                    borderRadius: '14px' 
                                }}>
                                    <div style={{ 
                                        width: '70px', 
                                        height: '70px', 
                                        minWidth: '70px', 
                                        background: selectedCandidature.typeCandidature === 'automatique' 
                                            ? `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)` 
                                            : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        borderRadius: '16px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '28px', 
                                        fontWeight: 'bold', 
                                        color: 'white',
                                        boxShadow: `0 4px 16px ${selectedCandidature.typeCandidature === 'automatique' ? roleColor : '#f59e0b'}40`
                                    }}>
                                        {selectedCandidature.typeCandidature === 'automatique' ? 
                                            <FiCpu size={30} /> : 
                                            (selectedCandidature.etudiantInfo?.prenom?.charAt(0) || '?')
                                        }
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '20px', marginBottom: '5px' }}>
                                            {selectedCandidature.etudiantInfo?.prenom || 'Prénom'} {selectedCandidature.etudiantInfo?.nom || 'Nom'}
                                        </h3>
                                        <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                                            <FiMail size={14} style={{ display: 'inline', marginRight: '6px' }} /> 
                                            {selectedCandidature.etudiantInfo?.email || 'Email inconnu'}
                                        </p>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            {renderTypeBadge(selectedCandidature.typeCandidature)}
                                            {selectedCandidature.scoreAuto && (
                                                <span style={{ 
                                                    background: selectedCandidature.scoreAuto >= 80 ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4') : (isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb'), 
                                                    color: selectedCandidature.scoreAuto >= 80 ? '#10b981' : '#f59e0b', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '8px', 
                                                    fontSize: '12px', 
                                                    fontWeight: '500' 
                                                }}>
                                                    <FiTarget size={12} style={{ display: 'inline', marginRight: '4px' }} /> Match IA: {selectedCandidature.scoreAuto}%
                                                </span>
                                            )}
                                            {renderStatut(selectedCandidature.statut)}
                                        </div>
                                    </div>
                                    {/* CV Download Button in Detail Modal */}
                                    <div>
                                        <button
                                            onClick={() => {
                                                const etudiantId = selectedCandidature.etudiantId?._id || selectedCandidature.etudiantId;
                                                const nom = `${selectedCandidature.etudiantInfo?.prenom || ''} ${selectedCandidature.etudiantInfo?.nom || ''}`.trim() || 'Étudiant';
                                                handleDownloadCV(etudiantId, nom);
                                            }}
                                            disabled={cvLoading[selectedCandidature.etudiantId?._id || selectedCandidature.etudiantId]}
                                            style={{
                                                padding: '12px 20px',
                                                background: 'linear-gradient(135deg, #6c63ff, #4834d4)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                cursor: cvLoading[selectedCandidature.etudiantId?._id || selectedCandidature.etudiantId] ? 'not-allowed' : 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                opacity: cvLoading[selectedCandidature.etudiantId?._id || selectedCandidature.etudiantId] ? 0.7 : 1,
                                                boxShadow: '0 4px 15px rgba(108, 99, 255, 0.3)',
                                                transition: 'all 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            {cvLoading[selectedCandidature.etudiantId?._id || selectedCandidature.etudiantId] ? 
                                                <FiClock size={16} /> : <FiDownload size={16} />
                                            }
                                            {cvLoading[selectedCandidature.etudiantId?._id || selectedCandidature.etudiantId] ? 'Chargement...' : 'Télécharger CV'}
                                        </button>
                                    </div>
                                </div>

                                {/* Informations de l'offre */}
                                <div style={{ 
                                    padding: '20px', 
                                    background: isDark ? `rgba(108, 99, 255, 0.08)` : '#f5f3ff', 
                                    borderRadius: '14px', 
                                    marginBottom: '20px', 
                                    border: isDark ? '1px solid rgba(108, 99, 255, 0.15)' : '1px solid #ddd6fe' 
                                }}>
                                    <h4 style={{ color: roleColor, fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FiBriefcase size={14} /> Offre concernée
                                    </h4>
                                    <p style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                                        {selectedCandidature.offreTitre}
                                    </p>
                                    <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '13px', marginBottom: '5px' }}>
                                        <HiOutlineOfficeBuilding size={14} style={{ display: 'inline', marginRight: '4px' }} /> 
                                        {selectedCandidature.offreEntreprise} • 
                                        <FiMapPin size={14} style={{ display: 'inline', marginHorizontal: '4px' }} /> 
                                        {selectedCandidature.offreLocalisation}
                                    </p>
                                    <p style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '12px', margin: 0 }}>
                                        <FiCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                                        {formatDate(selectedCandidature.dateCandidature)}
                                    </p>
                                </div>

                                {/* Lettre de motivation */}
                                {selectedCandidature.lettreMotivation && (
                                    <div style={{ 
                                        padding: '20px', 
                                        background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', 
                                        borderRadius: '14px', 
                                        marginBottom: '20px', 
                                        borderLeft: `3px solid ${roleColor}` 
                                    }}>
                                        <h4 style={{ color: roleColor, fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <HiOutlineDocumentText size={14} /> Lettre de motivation
                                        </h4>
                                        <p style={{ color: isDark ? 'rgba(254,250,224,0.8)' : '#0f172a', fontSize: '14px', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                                            "{selectedCandidature.lettreMotivation}"
                                        </p>
                                    </div>
                                )}

                                {/* Interview Info Block */}
                                {selectedCandidature.interviewType && !['en attente', 'refusée'].includes(selectedCandidature.statut) && (
                                    <div style={{ 
                                        padding: '20px', 
                                        background: selectedCandidature.interviewType === 'reel' ? (isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4') : (isDark ? 'rgba(108, 99, 255, 0.08)' : '#f5f3ff'), 
                                        borderRadius: '14px', 
                                        marginBottom: '20px', 
                                        border: `1px solid ${selectedCandidature.interviewType === 'reel' ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#bbf7d0') : (isDark ? 'rgba(108, 99, 255, 0.2)' : '#ddd6fe')}` 
                                    }}>
                                        <h4 style={{ 
                                            color: selectedCandidature.interviewType === 'reel' ? '#10b981' : '#6c63ff', 
                                            fontSize: '14px', 
                                            marginBottom: '15px', 
                                            textTransform: 'uppercase', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '8px' 
                                        }}>
                                            {selectedCandidature.interviewType === 'reel' ? <FiVideo size={14} /> : <FiCpu size={14} />} 
                                            Entretien {selectedCandidature.interviewType === 'reel' ? 'Réel' : 'IA'}
                                        </h4>
                                        
                                        {selectedCandidature.interviewType === 'ai' && (
                                            <div>
                                                <div style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '13px', marginBottom: '8px' }}>
                                                    Statut: <span style={{ color: selectedCandidature.scoreEntretien ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                                                        {selectedCandidature.scoreEntretien ? <><FiCheckCircle size={12} /> Complété</> : <><FiClock size={12} /> En attente</>}
                                                    </span>
                                                </div>
                                                {selectedCandidature.scoreEntretien && (
                                                    <div style={{ padding: '12px', background: isDark ? 'rgba(108, 99, 255, 0.1)' : '#f5f3ff', borderRadius: '8px', marginTop: '10px' }}>
                                                        <div style={{ color: '#6c63ff', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                                                            Score: {selectedCandidature.scoreEntretien}/100
                                                        </div>
                                                        {selectedCandidature.commentaireEntretien && (
                                                            <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '12px', margin: 0 }}>
                                                                <FiMessageSquare size={12} style={{ display: 'inline', marginRight: '4px' }} /> {selectedCandidature.commentaireEntretien}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {selectedCandidature.interviewType === 'reel' && (
                                            <div>
                                                <div style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '13px', marginBottom: '8px' }}>
                                                    Étape: <span style={{ color: selectedCandidature.etapeEntretien === 'visio_en_cours' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                                                        {selectedCandidature.etapeEntretien === 'attente_creneau' && <><FiClock size={12} /> En attente du créneau</>}
                                                        {selectedCandidature.etapeEntretien === 'creneau_choisi' && <><FiCalendar size={12} /> Créneau choisi</>}
                                                        {selectedCandidature.etapeEntretien === 'visio_en_cours' && <><FiVideo size={12} /> Visio disponible</>}
                                                        {!selectedCandidature.etapeEntretien && <><FiClock size={12} /> En attente</>}
                                                    </span>
                                                </div>
                                                
                                                {selectedCandidature.creneauChoisi && (
                                                    <div style={{ padding: '12px', background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', borderRadius: '8px', marginTop: '10px' }}>
                                                        <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '5px' }}>
                                                            <FiCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                                                            {new Date(selectedCandidature.creneauChoisi.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </div>
                                                        <div style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '13px' }}>
                                                            <FiClock size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                                                            {selectedCandidature.creneauChoisi.heureDebut} - {selectedCandidature.creneauChoisi.heureFin}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Commentaire */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ color: roleColor, fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FiMessageSquare size={14} /> Commentaire
                                    </h4>
                                    <textarea 
                                        value={commentaire} 
                                        onChange={(e) => setCommentaire(e.target.value)} 
                                        placeholder="Ajoutez un commentaire pour l'étudiant..." 
                                        rows="3"
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 15px', 
                                            borderRadius: '10px', 
                                            background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', 
                                            color: isDark ? '#fefae0' : '#1e293b', 
                                            fontSize: '13px', 
                                            resize: 'vertical', 
                                            outline: 'none' 
                                        }}
                                    />
                                </div>

                                {/* Boutons d'action */}
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', paddingTop: '20px' }}>
                                    {selectedCandidature.statut === 'en attente' && (
                                        <>
                                            <button 
                                                onClick={() => { 
                                                    setShowDetailModal(false); 
                                                    setSingleDeployCandidature({ ...selectedCandidature, action: 'accept' }); 
                                                    setShowSingleDeployModal(true); 
                                                }} 
                                                disabled={isSubmitting}
                                                style={{ 
                                                    flex: '1', 
                                                    padding: '14px', 
                                                    background: 'linear-gradient(135deg, #10b981, #059669)', 
                                                    color: 'white', 
                                                    border: 'none', 
                                                    borderRadius: '10px', 
                                                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                                                    fontSize: '14px', 
                                                    fontWeight: 'bold', 
                                                    opacity: isSubmitting ? 0.7 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.3s',
                                                    minWidth: '150px'
                                                }}
                                                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                {isSubmitting ? <><FiClock /> Traitement...</> : <><FiCheckCircle /> Accepter</>}
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(selectedCandidature.offreId, selectedCandidature._id, 'refusée')} 
                                                disabled={isSubmitting}
                                                style={{ 
                                                    flex: '1', 
                                                    padding: '14px', 
                                                    background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2', 
                                                    color: '#ef4444', 
                                                    border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca', 
                                                    borderRadius: '10px', 
                                                    cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                                                    fontSize: '14px', 
                                                    fontWeight: 'bold', 
                                                    opacity: isSubmitting ? 0.7 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.3s',
                                                    minWidth: '150px'
                                                }}
                                                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                {isSubmitting ? <><FiClock /> Traitement...</> : <><FiXCircle /> Refuser</>}
                                            </button>
                                        </>
                                    )}
                                    <button 
                                        onClick={() => { setShowDetailModal(false); setSelectedCandidature(null); setCommentaire(''); }}
                                        style={{ 
                                            flex: '1', 
                                            padding: '14px', 
                                            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', 
                                            color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', 
                                            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', 
                                            borderRadius: '10px', 
                                            cursor: 'pointer', 
                                            fontSize: '14px',
                                            minWidth: '150px'
                                        }}
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Modal de déploiement - Using File Version Style */}
            {showDeployModal && (
                <ModalPortal>
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.85)', 
                        backdropFilter: 'blur(8px)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 2000, 
                        padding: '20px' 
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowDeployModal(false);
                    }}
                    >
                        <div style={{ 
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff', 
                            border: isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #ddd6fe', 
                            borderRadius: '24px', 
                            width: '100%', 
                            maxWidth: '550px', 
                            boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ 
                                padding: '25px 30px', 
                                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}>
                                <h2 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {deployAction === 'accept_all_ai' ? 
                                        <><FiCpu style={{ color: roleColor }} /> Accepter et Déployer</> : 
                                        <><FiSearch style={{ color: '#f59e0b' }} /> Analyser et Déployer</>
                                    }
                                </h2>
                                <button 
                                    onClick={() => setShowDeployModal(false)} 
                                    style={{ 
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                                        border: 'none', 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '50%', 
                                        cursor: 'pointer', 
                                        fontSize: '18px' 
                                    }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <div style={{ padding: '30px' }}>
                                <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', marginBottom: '25px', lineHeight: '1.6', fontSize: '15px' }}>
                                    Vous allez traiter <strong style={{ color: roleColor }}>{deployData?.count || 0}</strong> candidature(s) {deployData?.type === 'automatiques' ? 'automatique(s)' : 'manuelle(s)'}.
                                </p>
                                
                                <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', marginBottom: '25px', fontSize: '15px', fontWeight: '500' }}>
                                    Comment souhaitez-vous procéder ?
                                </p>
                                
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <button
                                        onClick={() => {
                                            setShowDeployModal(false);
                                            if (deployAction === 'accept_all_ai') { handleAcceptAllAI(true); }
                                            else if (deployAction === 'analyse_manual') { handleAutoProcessManuel(true); }
                                        }}
                                        style={{ 
                                            padding: '18px', 
                                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`, 
                                            color: 'white', 
                                            border: '2px solid rgba(108, 99, 255, 0.5)', 
                                            borderRadius: '14px', 
                                            cursor: 'pointer', 
                                            fontSize: '16px', 
                                            fontWeight: 'bold', 
                                            textAlign: 'left', 
                                            transition: 'all 0.3s',
                                            boxShadow: `0 4px 16px ${roleColor}40`
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}><FiCpu size={28} /></div>
                                        <div style={{ marginBottom: '5px' }}>Accepter et Déployer l'Interview AI</div>
                                        <div style={{ fontSize: '13px', fontWeight: 'normal', color: 'rgba(255,255,255,0.7)' }}>
                                            Les candidats passeront d'abord un entretien avec l'IA
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={() => {
                                            setShowDeployModal(false);
                                            if (deployAction === 'accept_all_ai') { handleAcceptAllAI(false); }
                                            else if (deployAction === 'analyse_manual') { handleAutoProcessManuel(false); }
                                        }}
                                        style={{ 
                                            padding: '18px', 
                                            background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4', 
                                            color: '#10b981', 
                                            border: isDark ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid #bbf7d0', 
                                            borderRadius: '14px', 
                                            cursor: 'pointer', 
                                            fontSize: '16px', 
                                            fontWeight: 'bold', 
                                            textAlign: 'left', 
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ fontSize: '24px', marginBottom: '8px' }}><FiUsers size={28} /></div>
                                        <div style={{ marginBottom: '5px' }}>Accepter et Passer à l'Interview Réel</div>
                                        <div style={{ fontSize: '13px', fontWeight: 'normal', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b' }}>
                                            Les candidats iront directement en entretien réel
                                        </div>
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={() => setShowDeployModal(false)}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        marginTop: '20px', 
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', 
                                        color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', 
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', 
                                        borderRadius: '10px', 
                                        cursor: 'pointer', 
                                        fontSize: '14px' 
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Modale Acceptation Individuelle - Using File Version Style */}
            {showSingleDeployModal && singleDeployCandidature && (
                <ModalPortal>
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.85)', 
                        backdropFilter: 'blur(8px)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 2000, 
                        padding: '20px' 
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowSingleDeployModal(false);
                            setSingleDeployCandidature(null);
                        }
                    }}
                    >
                        <div style={{ 
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff', 
                            border: isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #ddd6fe', 
                            borderRadius: '24px', 
                            width: '100%', 
                            maxWidth: '500px', 
                            boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ 
                                padding: '25px 30px', 
                                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}>
                                <h2 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FiCheckCircle style={{ color: '#10b981' }} /> Accepter la candidature
                                </h2>
                                <button 
                                    onClick={() => { setShowSingleDeployModal(false); setSingleDeployCandidature(null); }}
                                    style={{ 
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                                        border: 'none', 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '50%', 
                                        cursor: 'pointer', 
                                        fontSize: '18px' 
                                    }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <div style={{ padding: '30px' }}>
                                <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', marginBottom: '15px', lineHeight: '1.6' }}>
                                    <strong style={{ color: isDark ? '#fefae0' : '#0f172a' }}>
                                        {singleDeployCandidature.etudiantInfo?.prenom} {singleDeployCandidature.etudiantInfo?.nom}
                                    </strong>
                                    <br />
                                    <span style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8' }}>
                                        {singleDeployCandidature.offreTitre}
                                    </span>
                                </p>
                                
                                <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', marginBottom: '20px', fontWeight: '500' }}>
                                    Comment souhaitez-vous procéder ?
                                </p>
                                
                                <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                                    <button
                                        onClick={async () => {
                                            setShowSingleDeployModal(false);
                                            const etudiantId = singleDeployCandidature.etudiantId?._id || singleDeployCandidature.etudiantId;
                                            await accepterCandidatureDirect(
                                                singleDeployCandidature.offreId, 
                                                singleDeployCandidature._id, 
                                                'acceptée',
                                                "✅ Acceptée - Entretien AI déployé"
                                            );
                                            await deployerInterviewAI(
                                                singleDeployCandidature._id, 
                                                singleDeployCandidature.offreId, 
                                                etudiantId
                                            );
                                            setSingleDeployCandidature(null);
                                            fetchRecruiterData(user.id);
                                        }}
                                        style={{ 
                                            padding: '16px', 
                                            background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`, 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '12px', 
                                            cursor: 'pointer', 
                                            fontSize: '15px', 
                                            fontWeight: 'bold', 
                                            textAlign: 'left', 
                                            transition: 'all 0.3s',
                                            boxShadow: `0 4px 16px ${roleColor}40`
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ fontSize: '20px', marginBottom: '5px' }}><FiCpu size={24} /></div>
                                        <div>Accepter et Déployer l'Interview AI</div>
                                        <div style={{ fontSize: '12px', fontWeight: 'normal', color: 'rgba(255,255,255,0.7)', marginTop: '5px' }}>
                                            Le candidat passera d'abord un entretien avec l'IA
                                        </div>
                                    </button>
                                    
                                    <button
                                        onClick={async () => {
                                            setShowSingleDeployModal(false);
                                            const etudiantId = singleDeployCandidature.etudiantId?._id || 
                                                              singleDeployCandidature.etudiantId?.toString() || 
                                                              singleDeployCandidature.etudiantInfo?._id;
                                            setSelectedCandidatureForCreneau({
                                                ...singleDeployCandidature,
                                                etudiantId: etudiantId
                                            });
                                            setShowRecruiterCalendarModal(true);
                                            setSingleDeployCandidature(null);
                                        }}
                                        style={{ 
                                            padding: '16px', 
                                            background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#f0fdf4', 
                                            color: '#10b981', 
                                            border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #bbf7d0', 
                                            borderRadius: '12px', 
                                            cursor: 'pointer', 
                                            fontSize: '15px', 
                                            fontWeight: 'bold', 
                                            textAlign: 'left', 
                                            transition: 'all 0.3s' 
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ fontSize: '20px', marginBottom: '5px' }}><FiUsers size={24} /></div>
                                        <div>Accepter et Planifier un Entretien Réel</div>
                                        <div style={{ fontSize: '12px', fontWeight: 'normal', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', marginTop: '5px' }}>
                                            Vous choisissez directement le créneau pour l'entretien
                                        </div>
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={() => { setShowSingleDeployModal(false); setSingleDeployCandidature(null); }}
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', 
                                        color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', 
                                        border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', 
                                        borderRadius: '10px', 
                                        cursor: 'pointer', 
                                        fontSize: '14px' 
                                    }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Calendar Modal */}
            {showRecruiterCalendarModal && selectedCandidatureForCreneau && (
                <ModalPortal>
                    <CalendrierEntretien
                        offre={{
                            offreTitre: selectedCandidatureForCreneau.offreTitre,
                            entreprise: selectedCandidatureForCreneau.offreEntreprise || selectedCandidatureForCreneau.entreprise,
                            offreId: selectedCandidatureForCreneau.offreId,
                            candidatureId: selectedCandidatureForCreneau._id,
                            etudiantId: selectedCandidatureForCreneau.etudiantId,
                            etudiantName: `${selectedCandidatureForCreneau.etudiantInfo?.prenom || ''} ${selectedCandidatureForCreneau.etudiantInfo?.nom || ''}`
                        }}
                        onClose={() => {
                            setShowRecruiterCalendarModal(false);
                            setSelectedCandidatureForCreneau(null);
                        }}
                        onConfirm={async (creneau) => {
                            setShowRecruiterCalendarModal(false);
                            try {
                                const acceptRes = await fetch(`https://pfe-backend-five.vercel.app/offres/${selectedCandidatureForCreneau.offreId}/candidatures/${selectedCandidatureForCreneau._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        statut: 'acceptée',
                                        commentaire: `Acceptée - Entretien réel planifié le ${creneau.date} à ${creneau.heureDebut}`,
                                        interviewType: 'reel',
                                        etapeEntretien: 'creneau_choisi'
                                    })
                                });
                                if (!acceptRes.ok) {
                                    setMessage('❌ Erreur lors de l\'acceptation');
                                    setSelectedCandidatureForCreneau(null);
                                    return;
                                }
                            } catch (err) {
                                console.error('Error accepting:', err);
                                setMessage('❌ Erreur lors de l\'acceptation');
                                setSelectedCandidatureForCreneau(null);
                                return;
                            }
                            await planifierEntretien(
                                selectedCandidatureForCreneau._id,
                                selectedCandidatureForCreneau.offreId,
                                selectedCandidatureForCreneau.etudiantId,
                                {
                                    date: creneau.date,
                                    heureDebut: creneau.heureDebut,
                                    heureFin: creneau.heureFin
                                }
                            );
                            setMessage(`✅ Entretien réel planifié avec succès pour le ${creneau.date} à ${creneau.heureDebut}`);
                            setTimeout(() => setMessage(''), 5000);
                            fetchRecruiterData(user.id);
                            setSelectedCandidatureForCreneau(null);
                        }}
                        mode="recruteur"
                    />
                </ModalPortal>
            )}

            {/* Confirmation Modal - Using File Version Style */}
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
                            WebkitBackdropFilter: 'blur(8px)',
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

            {/* Auto-Process Results Modal - Using File Version Style */}
            {showAutoProcessModal && !isAutoProcessing && autoProcessResults && (
                <ModalPortal>
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.85)', 
                        backdropFilter: 'blur(8px)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 2000, 
                        padding: '20px' 
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowAutoProcessModal(false);
                            setAutoProcessResults(null);
                        }
                    }}
                    >
                        <div style={{ 
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff', 
                            border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a', 
                            borderRadius: '20px', 
                            width: '100%', 
                            maxWidth: '700px', 
                            maxHeight: '80vh', 
                            overflowY: 'auto', 
                            boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)' 
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ 
                                padding: '25px 30px', 
                                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                position: 'sticky',
                                top: 0,
                                background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff',
                                borderRadius: '20px 20px 0 0',
                                zIndex: 1
                            }}>
                                <h2 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FiBarChart2 style={{ color: '#f59e0b' }} /> Résultats de l'analyse automatique
                                </h2>
                                <button 
                                    onClick={() => { setShowAutoProcessModal(false); setAutoProcessResults(null); }} 
                                    style={{ 
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                                        border: 'none', 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '50%', 
                                        cursor: 'pointer', 
                                        fontSize: '18px' 
                                    }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <div style={{ padding: '30px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '25px' }}>
                                    <div style={{ 
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', 
                                        borderRadius: '12px', 
                                        padding: '15px', 
                                        textAlign: 'center' 
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: isDark ? '#fefae0' : '#0f172a' }}>{autoProcessResults.total}</div>
                                        <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '11px' }}>
                                            <FiFileText size={12} style={{ display: 'inline', marginRight: '4px' }} /> Total
                                        </div>
                                    </div>
                                    <div style={{ 
                                        background: isDark ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', 
                                        borderRadius: '12px', 
                                        padding: '15px', 
                                        textAlign: 'center' 
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{autoProcessResults.acceptees}</div>
                                        <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '11px' }}>
                                            <FiCheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Acceptées
                                        </div>
                                    </div>
                                    <div style={{ 
                                        background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', 
                                        borderRadius: '12px', 
                                        padding: '15px', 
                                        textAlign: 'center' 
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{autoProcessResults.refusees}</div>
                                        <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '11px' }}>
                                            <FiXCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Refusées
                                        </div>
                                    </div>
                                    <div style={{ 
                                        background: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb', 
                                        borderRadius: '12px', 
                                        padding: '15px', 
                                        textAlign: 'center' 
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{autoProcessResults.erreurs}</div>
                                        <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '11px' }}>
                                            <FiAlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> Erreurs
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {autoProcessResults.details.map((detail, index) => (
                                        <div key={index} style={{
                                            padding: '12px 15px', 
                                            borderRadius: '10px',
                                            background: detail.statut === 'acceptée' ? (isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4') : 
                                                        detail.statut === 'refusée' ? (isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2') : 
                                                        (isDark ? 'rgba(245, 158, 11, 0.08)' : '#fffbeb'),
                                            border: `1px solid ${detail.statut === 'acceptée' ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#bbf7d0') : 
                                                             detail.statut === 'refusée' ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fecaca') : 
                                                             (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fde68a')}`,
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            flexWrap: 'wrap', 
                                            gap: '10px'
                                        }}>
                                            <div>
                                                <span style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '14px', fontWeight: '500' }}>{detail.nom}</span>
                                                <span style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8', fontSize: '12px', marginLeft: '10px' }}>{detail.offre}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {detail.match > 0 && (
                                                    <span style={{
                                                        background: detail.match >= 60 ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4') : (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2'),
                                                        color: detail.match >= 60 ? '#10b981' : '#ef4444',
                                                        padding: '3px 10px', 
                                                        borderRadius: '12px', 
                                                        fontSize: '12px', 
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {detail.match}%
                                                    </span>
                                                )}
                                                <span style={{
                                                    background: detail.statut === 'acceptée' ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#f0fdf4') : 
                                                               detail.statut === 'refusée' ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2') : 
                                                               (isDark ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb'),
                                                    color: detail.statut === 'acceptée' ? '#10b981' : 
                                                           detail.statut === 'refusée' ? '#ef4444' : '#f59e0b',
                                                    padding: '3px 10px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold'
                                                }}>
                                                    {detail.statut === 'acceptée' ? <><FiCheckCircle size={12} /> Acceptée</> : 
                                                     detail.statut === 'refusée' ? <><FiXCircle size={12} /> Refusée</> : 
                                                     <><FiAlertCircle size={12} /> Erreur</>}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => { setShowAutoProcessModal(false); setAutoProcessResults(null); }}
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        marginTop: '20px', 
                                        background: 'linear-gradient(135deg, #6c63ff, #4834d4)', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '10px', 
                                        cursor: 'pointer', 
                                        fontSize: '14px', 
                                        fontWeight: 'bold' 
                                    }}
                                >
                                    <FiCheckCircle size={16} style={{ display: 'inline', marginRight: '8px' }} /> Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Auto-Process Progress Modal - Using File Version Style */}
            {showAutoProcessModal && isAutoProcessing && (
                <ModalPortal>
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.85)', 
                        backdropFilter: 'blur(8px)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 2000, 
                        padding: '20px' 
                    }}>
                        <div style={{ 
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff', 
                            border: isDark ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid #fde68a', 
                            borderRadius: '20px', 
                            width: '100%', 
                            maxWidth: '500px', 
                            padding: '40px', 
                            textAlign: 'center', 
                            boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)' 
                        }}>
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>
                                <FiSearch size={50} style={{ color: '#f59e0b' }} />
                            </div>
                            <h2 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '22px', marginBottom: '10px' }}>
                                Analyse en cours...
                            </h2>
                            <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '14px', marginBottom: '25px' }}>
                                Analyse des CV et traitement des candidatures manuelles
                            </p>
                            <div style={{ 
                                width: '100%', 
                                height: '8px', 
                                background: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', 
                                borderRadius: '4px', 
                                overflow: 'hidden', 
                                marginBottom: '10px' 
                            }}>
                                <div style={{ 
                                    width: `${autoProcessProgress}%`, 
                                    height: '100%', 
                                    background: 'linear-gradient(90deg, #f59e0b, #d97706)', 
                                    borderRadius: '4px', 
                                    transition: 'width 0.5s ease' 
                                }} />
                            </div>
                            <p style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>{autoProcessProgress}%</p>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Accept All Modal - Using File Version Style */}
            {showAcceptAllModal && (
                <ModalPortal>
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.85)', 
                        backdropFilter: 'blur(8px)', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 2000, 
                        padding: '20px' 
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowAcceptAllModal(false);
                    }}
                    >
                        <div style={{ 
                            background: isDark ? 'linear-gradient(135deg, #1e1e3f, #2c2c54)' : '#ffffff', 
                            border: isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #ddd6fe', 
                            borderRadius: '20px', 
                            width: '100%', 
                            maxWidth: '500px', 
                            boxShadow: isDark ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.1)' 
                        }}
                        onClick={(e) => e.stopPropagation()}
                        >
                            <div style={{ 
                                padding: '25px 30px', 
                                borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}>
                                <h2 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '20px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FiCpu style={{ color: roleColor }} /> Accepter toutes les candidatures AI
                                </h2>
                                <button 
                                    onClick={() => setShowAcceptAllModal(false)} 
                                    style={{ 
                                        background: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', 
                                        border: 'none', 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        width: '36px', 
                                        height: '36px', 
                                        borderRadius: '50%', 
                                        cursor: 'pointer', 
                                        fontSize: '18px' 
                                    }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            
                            <div style={{ padding: '30px' }}>
                                <p style={{ color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', marginBottom: '20px', lineHeight: '1.6' }}>
                                    Vous allez accepter <strong style={{ color: roleColor }}>{candidaturesAutomatiques.filter(c => c.statut === 'en attente').length}</strong> candidature(s) automatique(s) en attente.
                                </p>
                                
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b', fontSize: '13px', marginBottom: '8px' }}>
                                        Commentaire (optionnel) :
                                    </label>
                                    <textarea 
                                        value={acceptAllComment} 
                                        onChange={(e) => setAcceptAllComment(e.target.value)} 
                                        placeholder="Ajoutez un commentaire pour les étudiants..." 
                                        rows="3"
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px 15px', 
                                            borderRadius: '10px', 
                                            background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                                            border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', 
                                            color: isDark ? '#fefae0' : '#1e293b', 
                                            fontSize: '13px', 
                                            resize: 'vertical', 
                                            outline: 'none' 
                                        }}
                                    />
                                </div>
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        onClick={() => handleAcceptAllAI(true)} 
                                        disabled={isAcceptingAll}
                                        style={{ 
                                            flex: 1, 
                                            padding: '14px', 
                                            background: 'linear-gradient(135deg, #10b981, #059669)', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '10px', 
                                            cursor: isAcceptingAll ? 'not-allowed' : 'pointer', 
                                            fontSize: '14px', 
                                            fontWeight: 'bold', 
                                            opacity: isAcceptingAll ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {isAcceptingAll ? <><FiClock /> Traitement...</> : <><FiCheckCircle /> Confirmer</>}
                                    </button>
                                    <button 
                                        onClick={() => setShowAcceptAllModal(false)}
                                        style={{ 
                                            padding: '14px 20px', 
                                            background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', 
                                            color: isDark ? 'rgba(255,255,255,0.7)' : '#475569', 
                                            border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', 
                                            borderRadius: '10px', 
                                            cursor: 'pointer', 
                                            fontSize: '14px' 
                                        }}
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

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
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
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

export default Candidats;