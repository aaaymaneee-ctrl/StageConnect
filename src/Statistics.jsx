import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext.jsx';

function Statistics() {
    const { isDark } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Variables de thème
    const textPrimary = isDark ? 'white' : '#0f172a';
    const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff';
    const cardBorder = isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0';

    const icons = {
        users: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
        student: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>),
        recruiter: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>),
        briefcase: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>),
        fileText: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>),
        activity: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>),
        shieldAlert: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
        shield: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>)
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // On suppose que la route admin stats est configurée sur ce endpoint dans server.js
                const response = await fetch('https://pfe-backend-five.vercel.app/admin/stats');
                if (!response.ok) throw new Error('Erreur lors de la récupération des données');
                
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error(err);
                setError('Impossible de charger les statistiques.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
                Chargement des statistiques...
            </p>
        </div>
    );
}
    if (error) {
        return <div style={{ color: '#ef4444', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px' }}>{error}</div>;
    }

// Calculs des nombres absolus et des pourcentages
    const studentCount = stats.users.students || 0;
    const recruiterCount = stats.users.recruiters || 0;
    
    // Déduction du nombre d'admins (Total - Etudiants - Recruteurs)
    const adminCount = stats.users.admins !== undefined 
        ? stats.users.admins 
        : Math.max(0, stats.users.total - studentCount - recruiterCount);

    const studentPercentage = stats.users.total > 0 ? Math.round((studentCount / stats.users.total) * 100) : 0;
    const recruiterPercentage = stats.users.total > 0 ? Math.round((recruiterCount / stats.users.total) * 100) : 0;
    
    // On s'assure que le total fait parfaitement 100% 
    const adminPercentage = stats.users.total > 0 ? 100 - studentPercentage - recruiterPercentage : 0;

    // ---> LA LIGNE QUI MANQUAIT <---
    const activeOffersPercentage = stats.offers.total > 0 ? Math.round((stats.offers.active / stats.offers.total) * 100) : 0;

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ color: textPrimary, fontSize: '32px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#22c55e' }}>{icons.activity}</span> Statistiques Globales
                </h1>
            </div>


            {/* Ligne 2 : Détails et Répartition */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* Répartition des utilisateurs */}
                {/* Répartition des utilisateurs */}
                <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ color: textPrimary, margin: '0 0 20px 0', fontSize: '18px' }}>Répartition des Utilisateurs</h3>
                    
                    {/* Légendes avec les 3 rôles */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>
                            {icons.student} Étudiants ({studentCount})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 'bold', fontSize: '14px' }}>
                            {icons.recruiter} Recruteurs ({recruiterCount})
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6c63ff', fontWeight: 'bold', fontSize: '14px' }}>
                            {icons.shield} Admins ({adminCount})
                        </div>
                    </div>

                    {/* Barre de progression combinée (3 parties) */}
                    <div style={{ width: '100%', height: '24px', background: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', borderRadius: '12px', display: 'flex', overflow: 'hidden' }}>
                        {studentPercentage > 0 && (
                            <div style={{ width: `${studentPercentage}%`, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', transition: 'width 1s ease-in-out' }}>
                                {studentPercentage > 8 ? `${studentPercentage}%` : ''}
                            </div>
                        )}
                        {recruiterPercentage > 0 && (
                            <div style={{ width: `${recruiterPercentage}%`, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', transition: 'width 1s ease-in-out' }}>
                                {recruiterPercentage > 8 ? `${recruiterPercentage}%` : ''}
                            </div>
                        )}
                        {adminPercentage > 0 && (
                            <div style={{ width: `${adminPercentage}%`, background: '#6c63ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 'bold', transition: 'width 1s ease-in-out' }}>
                                {adminPercentage > 8 ? `${adminPercentage}%` : ''}
                            </div>
                        )}
                    </div>
                </div>

                {/* Taux d'activité des offres */}
                <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ color: textPrimary, margin: '0 0 20px 0', fontSize: '18px' }}>Activité des Offres</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: textSecondary }}>Offres Actives ({stats.offers.active})</span>
                        <span style={{ color: textPrimary, fontWeight: 'bold' }}>{activeOffersPercentage}%</span>
                    </div>
                    
                    <div style={{ width: '100%', height: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
                        <div style={{ width: `${activeOffersPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #c084fc)', borderRadius: '6px', transition: 'width 1s ease-in-out' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: textSecondary }}>Offres Fermées ({stats.offers.total - stats.offers.active})</span>
                        <span style={{ color: textPrimary, fontWeight: 'bold' }}>{100 - activeOffersPercentage}%</span>
                    </div>

                    <div style={{ width: '100%', height: '12px', background: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${100 - activeOffersPercentage}%`, height: '100%', background: isDark ? 'rgba(255,255,255,0.2)' : '#94a3b8', borderRadius: '6px', transition: 'width 1s ease-in-out' }}></div>
                    </div>
                </div>
            </div>

            {/* Ligne 3 : Dernières inscriptions (si disponibles depuis le backend) */}
            {stats.recentUsers && stats.recentUsers.length > 0 && (
                <div style={{ background: cardBg, border: cardBorder, borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ color: textPrimary, margin: '0 0 20px 0', fontSize: '18px' }}>Nouvelles Inscriptions</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: cardBorder, color: textSecondary, fontSize: '14px', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '12px 0' }}>Utilisateur</th>
                                    <th style={{ padding: '12px 0' }}>Email</th>
                                    <th style={{ padding: '12px 0' }}>Rôle</th>
                                    <th style={{ padding: '12px 0' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentUsers.map((u, idx) => (
                                    <tr key={idx} style={{ borderBottom: idx !== stats.recentUsers.length - 1 ? cardBorder : 'none' }}>
                                        <td style={{ padding: '12px 0', color: textPrimary, fontWeight: '500' }}>{u.prenom} {u.nom}</td>
                                        <td style={{ padding: '12px 0', color: textSecondary }}>{u.email}</td>
                                        <td style={{ padding: '12px 0' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                                                background: u.role === 'Etudiant' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: u.role === 'Etudiant' ? '#10b981' : '#f59e0b'
                                            }}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 0', color: textSecondary, fontSize: '14px' }}>
                                            {new Date(u.dateCreation).toLocaleDateString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

export default Statistics;