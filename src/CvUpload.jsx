// CvUpload.jsx - With Floating Icons & Modern Design
import { useState, useEffect } from "react";
import { useTheme } from './ThemeContext.jsx';
import { 
  FiUpload, FiRefreshCw, FiCheckCircle, FiXCircle, 
  FiAlertCircle, FiFileText, FiCpu, FiTrendingUp,
  FiAward, FiBarChart2, FiMail, FiPhone, FiLinkedin,
  FiGithub, FiBookOpen, FiBriefcase, FiGlobe, FiLock
} from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlineChartBar } from 'react-icons/hi';

function CVUpload() {
    const { isDark, theme } = useTheme();
    const [userId, setUserId] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Get role-based color
    const getRoleColor = () => {
        const role = user?.role;
        if (role === 'Recruteur') return '#ff6b6b';
        if (role === 'Admin' || role === 'admin') return '#10b981';
        return '#6366f1';
    };

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData.id) {
                setUserId(userData.id);
                setUser(userData);
                checkExistingCV(userData.id);
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }, []);

    const checkExistingCV = async (userId) => {
        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users/${userId}`);
            const userData = await res.json();
            if (userData.cv && userData.cv.filename) {
                analyzeCV(userId);
            }
        } catch (err) {
            console.error("Error checking CV:", err);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setMessage("");
        } else if (selectedFile) {
            setFile(null);
            setMessage("❌ Veuillez sélectionner un fichier PDF");
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!file) {
            setMessage("❌ Veuillez sélectionner un fichier");
            return;
        }
        if (!userId) {
            setMessage("❌ Utilisateur non identifié");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("cv", file);

        try {
            const res = await fetch(`https://pfe-backend-five.vercel.app/users/${userId}/cv`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            
            if (res.ok) {
                setMessage("✅ CV téléchargé avec succès!");
                setFile(null);
                setShowAnalysis(true);
                await analyzeCV(userId);
            } else {
                setMessage(<FiAlertCircle /> + (data.error || "Erreur lors du téléchargement"));
            }
        } catch (err) {
            setMessage("❌ Impossible de se connecter au serveur");
        } finally {
            setUploading(false);
        }
    };

    const analyzeCV = async (userId) => {
        setAnalyzing(true);
        try {
            const timestamp = Date.now();
            const res = await fetch(`https://pfe-backend-five.vercel.app/cv/analyze/${userId}?t=${timestamp}`, {
                method: 'POST',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);
                setShowAnalysis(true);
            }
        } catch (err) {
            console.error("Error analyzing CV:", err);
        } finally {
            setAnalyzing(false);
        }
    };

    const forceReanalyze = async () => {
        setAnalyzing(true);
        try {
            const timestamp = Date.now();
            const res = await fetch(`https://pfe-backend-five.vercel.app/cv/analyze/${userId}?refresh=true&t=${timestamp}`, {
                method: 'POST',
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
            });
            
            if (res.ok) {
                const data = await res.json();
                setAnalysis(data);
                setShowAnalysis(true);
                setMessage("✅ Analyse rafraîchie avec succès!");
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            setMessage("❌ Erreur lors du rafraîchissement");
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#f59e0b';
        return '#ff6b6b';
    };

    const getScoreMessage = (score) => {
        if (score >= 80) return 'Excellent CV !';
        if (score >= 70) return 'Très bon CV';
        if (score >= 60) return 'Bon CV, peut être amélioré';
        if (score >= 40) return 'CV moyen, nécessite des améliorations';
        return 'CV a besoin d\'améliorations significatives';
    };
if (!user) {
    return (
        <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',  // Full viewport height
            width: '100%',
            color: isDark ? '#fefae0' : '#2d2424', 
            textAlign: 'center',
            flexDirection: 'column',
            gap: '16px'
        }}>
            <FiLock size={50} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h2 style={{ color: isDark ? '#fefae0' : '#0f172a', fontSize: '24px', fontWeight: '600', margin: 0 }}>
                Please Log In
            </h2>
            <p style={{ color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', margin: 0, fontSize: '15px' }}>
                You need to be logged in to upload your CV
            </p>
        </div>
    );
}


    const roleColor = getRoleColor();
    const isLightMode = theme === 'light';

    return (
    <div style={{ color: isDark ? '#fefae0' : '#0f172a' }}>
        {/* Header with Icon */}
        <div style={{ 
            marginBottom: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            flexWrap: 'wrap'
        }}>
            <div>
                <h1 style={{ 
                    color: isDark ? '#fefae0' : '#0f172a', 
                    fontSize: '28px', 
                    marginBottom: '8px',
                    fontWeight: '700',
                    fontFamily: "'Quicksand', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <HiOutlineDocumentText style={{ color: '#6366f1' }} /> Dépôt / Modification du CV
                </h1>
                <p style={{ 
                    color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                    fontSize: '15px'
                }}>
                    Téléchargez votre CV au format PDF et obtenez une analyse automatique
                </p>
            </div>
        </div>
            {/* Upload Section */}
            <div style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                backdropFilter: isDark ? 'blur(10px)' : 'none',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '30px',
                width: '100%',  // Full width
    marginBottom: '30px',

                boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
            }}>
                <form onSubmit={handleUpload}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '10px',
                            color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            <FiFileText style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            Sélectionnez votre fichier CV :
                        </label>
                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            disabled={uploading}
                            style={{ 
                                width: '100%',
                                padding: '14px',
                                background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                border: isDark ? '2px dashed rgba(255,255,255,0.1)' : '2px dashed #e2e8f0',
                                borderRadius: '12px',
                                color: isDark ? '#fefae0' : '#0f172a',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = roleColor;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                            }}
                        />
                    </div>
                    
                    {file && (
                        <p style={{ 
                            padding: '12px 16px',
                            background: `${roleColor}10`,
                            borderRadius: '12px',
                            marginBottom: '20px',
                            color: isDark ? '#fefae0' : '#0f172a',
                            border: `1px solid ${roleColor}20`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px'
                        }}>
                            <FiFileText style={{ color: roleColor }} />
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </p>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={!file || uploading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: !file 
                                ? (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9') 
                                : `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                            color: !file 
                                ? (isDark ? 'rgba(254,250,224,0.3)' : '#94a3b8') 
                                : 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: !file ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: !file ? 'none' : `0 4px 16px ${roleColor}40`
                        }}
                        onMouseEnter={(e) => {
                            if (file && !uploading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {uploading ? (
                            <><FiRefreshCw /> Téléchargement...</>
                        ) : (
                            <><FiUpload /> Télécharger le CV</>
                        )}
                    </button>
                </form>
            </div>

            {analysis && !analyzing && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <button 
                        onClick={forceReanalyze} 
                        style={{
                            padding: '12px 28px',
                            background: 'transparent',
                            border: `2px solid ${roleColor}`,
                            color: roleColor,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${roleColor}10`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <FiRefreshCw /> Forcer la ré-analyse complète du CV
                    </button>
                </div>
            )}

            {(analyzing || analysis) && (
                <div style={{ marginTop: '30px' }}>
                    <h2 style={{ 
                        color: isDark ? '#fefae0' : '#0f172a', 
                        fontSize: '22px', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '700',
                        fontFamily: "'Quicksand', sans-serif"
                    }}>
                        <FiCpu style={{ fontSize: '1.8rem', color: roleColor }} />
                        Analyse automatique de votre CV
                        {analyzing && <span style={{ fontSize: '16px', color: '#f59e0b' }}></span>}
                    </h2>

                    {analyzing && (
                        <div style={{
                            background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '48px',
                            textAlign: 'center',
                            boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                        }}>
                            <FiCpu size={60} style={{ color: roleColor, marginBottom: '20px', animation: 'spin 2s linear infinite' }} />
                            <p style={{ fontSize: '18px', marginBottom: '10px', color: isDark ? '#fefae0' : '#0f172a' }}>
                                Analyse de votre CV en cours...
                            </p>
                            <p style={{ color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', fontSize: '14px' }}>
                                Extraction des compétences, langues, formations...
                            </p>
                        </div>
                    )}

                    {analysis && !analyzing && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {/* Score Card */}
                            <div style={{
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '32px',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '20px',
                                    color: getScoreColor(analysis.cvScore),
                                    opacity: 0.8
                                }}>
                                    <FiAward size={24} />
                                </div>
                                <h3 style={{ 
                                    color: isDark ? '#fefae0' : '#0f172a', 
                                    marginBottom: '12px',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}>
                                    <FiBarChart2 style={{ color: roleColor }} /> Score Global du CV
                                </h3>
                                <div style={{
                                    fontSize: '64px',
                                    fontWeight: '700',
                                    color: getScoreColor(analysis.cvScore),
                                    marginBottom: '8px',
                                    fontFamily: "'Quicksand', sans-serif",
                                    lineHeight: 1
                                }}>
                                    {analysis.cvScore}/100
                                </div>
                                <p style={{ 
                                    color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                    fontSize: '15px',
                                    marginBottom: '20px'
                                }}>
                                    {getScoreMessage(analysis.cvScore)}
                                </p>
                                <div style={{
                                    width: '100%',
                                    height: '8px',
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${analysis.cvScore}%`,
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${getScoreColor(analysis.cvScore)}, ${getScoreColor(analysis.cvScore)}dd)`,
                                        borderRadius: '10px',
                                        transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} />
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '15px'
                            }}>
                                <div style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '28px', color: roleColor, fontWeight: 'bold' }}>{analysis.summary.wordCount}</div>
                                    <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontSize: '12px', marginTop: '5px' }}>Mots</div>
                                </div>
                                <div style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '28px', color: '#28a745', fontWeight: 'bold' }}>{analysis.skills.length}</div>
                                    <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontSize: '12px', marginTop: '5px' }}>Compétences</div>
                                </div>
                                <div style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '28px', color: '#f59e0b', fontWeight: 'bold' }}>{Object.keys(analysis.languages).length}</div>
                                    <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontSize: '12px', marginTop: '5px' }}>Langues</div>
                                </div>
                                <div style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '28px', color: '#ff6b6b', fontWeight: 'bold' }}>{analysis.education.length}</div>
                                    <div style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontSize: '12px', marginTop: '5px' }}>Formations</div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div style={{
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '28px',
                                boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                            }}>
                                <h3 style={{ 
                                    color: isDark ? '#fefae0' : '#0f172a', 
                                    marginBottom: '16px',
                                    fontSize: '17px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <FiTrendingUp style={{ color: roleColor }} />
                                    Compétences détectées
                                    <span style={{
                                        background: `${roleColor}20`,
                                        color: roleColor,
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {analysis.skills.length}
                                    </span>
                                </h3>
                                {analysis.skills.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {analysis.skills.map((skill, index) => (
                                            <span key={index} style={{
                                                background: `${roleColor}20`,
                                                color: roleColor,
                                                padding: '7px 15px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                border: `1px solid ${roleColor}15`,
                                                transition: 'all 0.2s ease',
                                                cursor: 'default'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.background = `${roleColor}30`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.background = `${roleColor}20`;
                                            }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>
                                        Aucune compétence détectée
                                    </p>
                                )}
                            </div>

                            {/* Contact Info Section */}
                            <div style={{
                                background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '28px',
                                boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                            }}>
                                <h3 style={{ 
                                    color: isDark ? '#fefae0' : '#0f172a', 
                                    marginBottom: '16px',
                                    fontSize: '17px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <FiMail style={{ color: roleColor }} />
                                    Informations de contact
                                </h3>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {analysis.contactInfo.email && (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px',
                                            padding: '10px 14px',
                                            background: isDark ? 'rgba(99,102,241,0.05)' : '#f8fafc',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: isDark ? '#fefae0' : '#0f172a'
                                        }}>
                                            <FiMail style={{ color: roleColor }} />
                                            <span>{analysis.contactInfo.email}</span>
                                        </div>
                                    )}
                                    {analysis.contactInfo.phone && (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px',
                                            padding: '10px 14px',
                                            background: isDark ? 'rgba(99,102,241,0.05)' : '#f8fafc',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: isDark ? '#fefae0' : '#0f172a'
                                        }}>
                                            <FiPhone style={{ color: roleColor }} />
                                            <span>{analysis.contactInfo.phone}</span>
                                        </div>
                                    )}
                                    {analysis.contactInfo.linkedin && (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px',
                                            padding: '10px 14px',
                                            background: isDark ? 'rgba(99,102,241,0.05)' : '#f8fafc',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: isDark ? '#fefae0' : '#0f172a'
                                        }}>
                                            <FiLinkedin style={{ color: roleColor }} />
                                            <span>{analysis.contactInfo.linkedin}</span>
                                        </div>
                                    )}
                                    {analysis.contactInfo.github && (
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px',
                                            padding: '10px 14px',
                                            background: isDark ? 'rgba(99,102,241,0.05)' : '#f8fafc',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: isDark ? '#fefae0' : '#0f172a'
                                        }}>
                                            <FiGithub style={{ color: roleColor }} />
                                            <span>{analysis.contactInfo.github}</span>
                                        </div>
                                    )}
                                    {!analysis.contactInfo.email && !analysis.contactInfo.phone && (
                                        <p style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>
                                            Aucune information de contact détectée
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Languages & Education in 2 columns */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '20px'
                            }}>
                                {/* Languages */}
                                <div style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '28px',
                                    boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                                }}>
                                    <h3 style={{ 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        marginBottom: '16px',
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiGlobe style={{ color: roleColor }} />
                                        Langues
                                    </h3>
                                    {Object.keys(analysis.languages).length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {Object.entries(analysis.languages).map(([lang, level]) => (
                                                <div key={lang} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '10px 14px',
                                                    background: isDark ? 'rgba(40,167,69,0.05)' : '#f8fafc',
                                                    borderRadius: '10px',
                                                    border: isDark ? '1px solid rgba(40,167,69,0.1)' : '1px solid #e2e8f0',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'default'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                                >
                                                    <span style={{ 
                                                        color: isDark ? '#fefae0' : '#0f172a', 
                                                        textTransform: 'capitalize',
                                                        fontSize: '14px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {lang}
                                                    </span>
                                                    <span style={{
                                                        background: 'rgba(40,167,69,0.15)',
                                                        color: '#28a745',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {level}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>
                                            Aucune langue détectée
                                        </p>
                                    )}
                                </div>

                                {/* Education */}
                                <div style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '28px',
                                    boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                                }}>
                                    <h3 style={{ 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        marginBottom: '16px',
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiBookOpen style={{ color: roleColor }} />
                                        Formations
                                    </h3>
                                    {analysis.education.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {analysis.education.map((edu, index) => (
                                                <div key={index} style={{
                                                    padding: '10px 14px',
                                                    background: isDark ? 'rgba(255,193,7,0.05)' : '#f8fafc',
                                                    borderRadius: '10px',
                                                    color: isDark ? '#fefae0' : '#0f172a',
                                                    fontSize: '14px',
                                                    borderLeft: `3px solid #f59e0b`,
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'default'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                                >
                                                    {edu}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: isDark ? 'rgba(254,250,224,0.4)' : '#64748b', fontStyle: 'italic', fontSize: '14px', margin: 0 }}>
                                            Aucune formation détectée
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Experience Section */}
                            {analysis.experienceYears && (
                                <div style={{
                                    background: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '28px',
                                    boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.04)'
                                }}>
                                    <h3 style={{ 
                                        color: isDark ? '#fefae0' : '#0f172a', 
                                        marginBottom: '16px',
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiBriefcase style={{ color: roleColor }} />
                                        Expérience
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px'
                                    }}>
                                        <div style={{
                                            fontSize: '40px',
                                            fontWeight: '700',
                                            color: roleColor,
                                            fontFamily: "'Quicksand', sans-serif"
                                        }}>
                                            {analysis.experienceYears}
                                        </div>
                                        <div style={{ 
                                            color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b', 
                                            fontSize: '15px' 
                                        }}>
                                            années d'expérience détectées
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggestions Section */}
                            {analysis.suggestions && analysis.suggestions.length > 0 && (
                                <div style={{
                                    background: isDark ? 'rgba(255,193,7,0.04)' : 'rgba(255,193,7,0.03)',
                                    border: isDark ? '1px solid rgba(255,193,7,0.12)' : '1px solid rgba(255,193,7,0.1)',
                                    borderRadius: '16px',
                                    padding: '28px'
                                }}>
                                    <h3 style={{ 
                                        color: '#f59e0b', 
                                        marginBottom: '16px',
                                        fontSize: '17px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiAlertCircle style={{ color: '#f59e0b' }} />
                                        Suggestions d'amélioration
                                        <span style={{
                                            background: isDark ? 'rgba(255,193,7,0.12)' : 'rgba(255,193,7,0.08)',
                                            color: '#f59e0b',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {analysis.suggestions.length}
                                        </span>
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {analysis.suggestions.map((suggestion, index) => (
                                            <div key={index} style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '10px',
                                                padding: '12px 16px',
                                                background: isDark ? 'rgba(255,193,7,0.03)' : 'rgba(255,193,7,0.02)',
                                                borderRadius: '10px',
                                                color: isDark ? 'rgba(254,250,224,0.8)' : '#0f172a',
                                                fontSize: '14px',
                                                borderLeft: `3px solid #f59e0b`,
                                                transition: 'all 0.2s ease',
                                                cursor: 'default'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                            >
                                                <FiAlertCircle style={{ color: '#f59e0b', marginTop: '1px', flexShrink: 0 }} />
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
                        background: message.includes('✅') ? '#10b981' : '#ef4444',
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
                        {message.includes('✅') ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                        {message}
                    </div>
                </div>
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
                .page-header-icon {
                    animation: floatIcon 3s ease-in-out infinite;
                }
                @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
            `}</style>
        </div>
    );
}

export default CVUpload;