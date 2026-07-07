// Welcome.jsx - StageConnect with Fast Responsive Animations
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext.jsx';
import { 
  FiMenu, FiSun, FiMoon, FiTrendingUp, FiBriefcase, 
  FiUsers, FiFileText, FiMessageCircle, FiCpu, FiLock, 
  FiStar, FiCheckCircle, FiZap, FiTarget, FiBarChart2, FiClock,
  FiX, FiAward, FiMail, FiMapPin,
  FiTwitter, FiGithub, FiLinkedin,
  FiCode, FiBookOpen, FiShield, FiLayers,
  FiThumbsUp, FiHeart, FiCompass, FiGlobe, FiArrowUp
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineAcademicCap } from 'react-icons/hi';

const COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  success: '#10b981',
  successLight: '#34d399',
  info: '#06b6d4',
  pink: '#ec4899',
  purple: '#a855f7',
  blue: '#3b82f6',
};

const LampLogo = ({ size = 40, color1 = '#6366f1', color2 = '#8b5cf6' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="75" width="30" height="8" rx="3" fill={`url(#lampGradient)`} />
      <rect x="40" y="70" width="20" height="6" rx="2" fill={`url(#lampGradient)`} />
      <rect x="47" y="35" width="6" height="36" rx="2" fill={`url(#lampGradient)`} />
      <path d="M30 35 L70 35 L65 20 L35 20 L30 35Z" fill={`url(#lampGradient)`} stroke={`url(#lampGradient)`} strokeWidth="1.5"/>
      <path d="M32 35 Q50 42 68 35" stroke={`url(#lampGradient)`} strokeWidth="2" fill="none"/>
      <ellipse cx="50" cy="38" rx="12" ry="8" fill={`url(#glowGradient)`} opacity="0.8"/>
      <path d="M50 46 L50 55" stroke={`url(#glowGradient)`} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <path d="M44 44 L38 50" stroke={`url(#glowGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M56 44 L62 50" stroke={`url(#glowGradient)`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <circle cx="50" cy="52" r="2" fill="#fbbf24" opacity="0.8">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <text x="50" y="32" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold" fontFamily="Arial">i</text>
      <defs>
        <linearGradient id="lampGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const TypingText = ({ text, className = "", style = {} }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout;
    
    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (isDeleting) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, 30);
      } else {
        setIsDeleting(false);
        setCurrentIndex(0);
        timeout = setTimeout(() => {}, 300);
      }
      return () => clearTimeout(timeout);
    }

    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
    } else {
      setIsPaused(true);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, displayText, isDeleting, isPaused, text]);

  return (
    <span className={className} style={style}>
      {displayText}
      <span className="cursor-blink">|</span>
    </span>
  );
};

function Welcome() {
  const { isDark, toggleTheme } = useTheme();
  const [counts, setCounts] = useState({ offers: 0, students: 0, satisfaction: 0 });
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const animateValue = (start, end, duration, setter) => {
      const increment = (end - start) / (duration / 16);
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          clearInterval(timer);
          setter(end);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
      return timer;
    };

    const timers = [];
    timers.push(animateValue(0, 500, 2000, (val) => setCounts(prev => ({ ...prev, offers: val }))));
    timers.push(animateValue(0, 1000, 2000, (val) => setCounts(prev => ({ ...prev, students: val }))));
    timers.push(animateValue(0, 95, 2000, (val) => setCounts(prev => ({ ...prev, satisfaction: val }))));

    return () => timers.forEach(timer => clearInterval(timer));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const features = [
    {
      icon: <FiFileText size={28} />,
      title: 'CV Intelligent',
      description: 'Téléchargez votre CV et obtenez une analyse automatique de vos compétences, formations et langues.',
      color: COLORS.primary
    },
    {
      icon: <FiMessageCircle size={28} />,
      title: 'Entretiens IA',
      description: 'Préparez-vous avec notre assistant d\'entretien virtuel qui simule un vrai recruteur.',
      color: COLORS.success
    },
    {
      icon: <FiTarget size={28} />,
      title: 'Matching Intelligent',
      description: 'Postulez automatiquement aux offres qui correspondent le mieux à votre profil.',
      color: COLORS.accent
    },
    {
      icon: <FiBarChart2 size={28} />,
      title: 'Suivi en Temps Réel',
      description: 'Suivez l\'état de vos candidatures et recevez des retours détaillés des recruteurs.',
      color: COLORS.pink
    },
    {
      icon: <HiOutlineOfficeBuilding size={28} />,
      title: 'Pour les Recruteurs',
      description: 'Publiez vos offres, gérez les candidatures et trouvez les meilleurs talents facilement.',
      color: COLORS.secondary
    },
    {
      icon: <FiLock size={28} />,
      title: 'Sécurisé',
      description: 'Vos données sont protégées avec les meilleurs standards de sécurité.',
      color: COLORS.info
    }
  ];

  const stats = [
    { 
      value: `${counts.offers}+`, 
      label: 'Offres de stage', 
      icon: <FiBriefcase size={20} />, 
      color: COLORS.primary 
    },
    { 
      value: `${counts.students}+`, 
      label: 'Étudiants inscrits', 
      icon: <FiUsers size={20} />, 
      color: COLORS.success 
    },
    { 
      value: `${counts.satisfaction}%`, 
      label: 'Taux de satisfaction', 
      icon: <FiStar size={20} />, 
      color: COLORS.accent 
    },
    { 
      value: '24/7', 
      label: 'Support disponible', 
      icon: <FiClock size={20} />, 
      color: COLORS.pink 
    }
  ];

  const heroText = "Trouvez le stage de vos rêves";

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: isDark 
        ? '#0f172a' 
        : 'linear-gradient(180deg, #fef9f3 0%, #fdf6ec 50%, #f0f4ff 100%)',
      color: isDark ? '#fefae0' : '#0f172a',
      overflow: 'hidden'
    }}>
      {/* Navigation with slide-in animation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 40px',
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(139, 126, 116, 0.08)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <LampLogo size={35} color1={COLORS.primary} color2={COLORS.secondary} />
          <span style={{
            fontSize: '24px',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            StageConnect
          </span>
        </motion.div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <motion.a 
            href="#features"
            whileHover={{ scale: 1.05, color: COLORS.primary }}
            whileTap={{ scale: 0.95 }}
            style={{
              color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              fontFamily: "'Quicksand', sans-serif",
              transition: 'color 0.15s ease',
              cursor: 'pointer'
            }}
          >
            Fonctionnalités
          </motion.a>

          <motion.a 
            href="#how-it-works"
            whileHover={{ scale: 1.05, color: COLORS.secondary }}
            whileTap={{ scale: 0.95 }}
            style={{
              color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              fontFamily: "'Quicksand', sans-serif",
              transition: 'color 0.15s ease',
              cursor: 'pointer'
            }}
          >
            Comment ça marche
          </motion.a>

          {/* Theme Toggle with fast rotation */}
          <motion.button
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#fbbf24' : COLORS.primary,
              transition: 'all 0.15s ease'
            }}
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </motion.button>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2, borderColor: COLORS.primary }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                color: isDark ? 'rgba(254,250,224,0.8)' : '#1e293b',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: "'Quicksand', sans-serif",
                transition: 'all 0.15s ease'
              }}
            >
              Se connecter
            </motion.button>
          </Link>
          
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2, boxShadow: `0 8px 32px ${COLORS.primary}50` }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '8px 20px',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: "'Quicksand', sans-serif",
                boxShadow: `0 4px 16px ${COLORS.primary}40`,
                transition: 'all 0.15s ease'
              }}
            >
              Créer un compte
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section style={{
        padding: '120px 40px 60px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: '800',
            marginBottom: '20px',
            lineHeight: '1.2',
            color: isDark ? '#fefae0' : '#0f172a',
            fontFamily: "'Quicksand', sans-serif"
          }}>
            <TypingText text={heroText} />
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: isDark ? 'rgba(254,250,224,0.6)' : '#64748b',
            maxWidth: '700px',
            margin: '0 auto 40px',
            lineHeight: '1.8'
          }}
        >
          La plateforme intelligente qui connecte les étudiants aux meilleures offres de stage.
          Analyse de CV, entretiens virtuels et matching automatique pour booster votre carrière.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: `0 12px 40px ${COLORS.primary}50`
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '16px 40px',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: "'Quicksand', sans-serif",
                boxShadow: `0 8px 32px ${COLORS.primary}40`,
                transition: 'all 0.15s ease'
              }}
            >
              Commencer maintenant
            </motion.button>
          </Link>
          
          <motion.a 
            href="#features"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '16px 40px',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
              color: isDark ? '#fefae0' : '#1e293b',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '500',
              fontFamily: "'Quicksand', sans-serif",
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            En savoir plus
          </motion.a>
        </motion.div>

        {/* Stats - Animated Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '60px',
            maxWidth: '1000px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
{stats.map((stat, index) => (
  <div 
    key={index}
    style={{
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(10px)',
      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(139,126,116,0.08)',
      borderRadius: '16px',
      padding: '24px 20px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = isDark ? '0 8px 30px rgba(0,0,0,0.2)' : '0 8px 30px rgba(0,0,0,0.05)';
      e.currentTarget.style.borderColor = stat.color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(139,126,116,0.08)';
    }}
  >
    <div style={{
      fontSize: '38px',
      fontWeight: '700',
      fontFamily: "'Quicksand', sans-serif",
      color: stat.color,
      marginBottom: '6px'
    }}>
      {stat.value}
    </div>
    <div style={{
      fontSize: '13px',
      color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      letterSpacing: '0.3px'
    }}>
      {stat.icon} {stat.label}
    </div>
  </div>
))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            marginBottom: '15px',
            color: isDark ? '#fefae0' : '#0f172a'
          }}>
            Pourquoi choisir{' '}
            <span style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              StageConnect
            </span>
            ?
          </h2>
          <p style={{
            color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b',
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Tout ce dont vous avez besoin pour réussir votre recherche de stage en un seul endroit.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '25px'
        }}>
          {features.map((feature, index) => (
  <div
    key={index}
    style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(10px)',
      border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(139,126,116,0.08)',
      borderRadius: '16px',
      padding: '30px',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = isDark ? '0 8px 30px rgba(0,0,0,0.2)' : '0 8px 30px rgba(0,0,0,0.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: '60px',
      height: '60px',
      background: `${feature.color}20`,
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      color: feature.color
    }}>
      {feature.icon}
    </div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '600',
      fontFamily: "'Quicksand', sans-serif",
      marginBottom: '10px',
      color: isDark ? '#fefae0' : '#0f172a'
    }}>
      {feature.title}
    </h3>
    <p style={{
      color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b',
      fontSize: '14px',
      lineHeight: '1.7'
    }}>
      {feature.description}
    </p>
  </div>
))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: isDark ? 'rgba(99,102,241,0.03)' : '#f5f3ff',
        borderRadius: '2rem',
        marginTop: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            marginBottom: '15px',
            color: isDark ? '#fefae0' : '#0f172a'
          }}>
            Comment ça marche
          </h2>
          <p style={{
            color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b',
            fontSize: '18px'
          }}>
            De l'inscription à votre premier entretien en 4 étapes simples.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {[
  { number: 1, title: 'Créer un compte', desc: 'Inscrivez-vous en tant qu\'étudiant ou recruteur', color: COLORS.primary },
  { number: 2, title: 'Compléter le profil', desc: 'Téléchargez votre CV et vos compétences', color: COLORS.success },
  { number: 3, title: 'Être mis en relation', desc: 'L\'IA trouve les meilleures opportunités', color: COLORS.accent },
  { number: 4, title: 'Commencer carrière', desc: 'Connectez-vous avec les recruteurs', color: COLORS.pink }
].map((step, index) => (
  <div
    key={index}
    style={{
      textAlign: 'center',
      padding: '30px 20px',
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
      borderRadius: '16px',
      border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(139,126,116,0.05)',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = isDark ? '0 8px 30px rgba(0,0,0,0.2)' : '0 8px 30px rgba(0,0,0,0.05)';
      e.currentTarget.style.borderColor = step.color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(139,126,116,0.05)';
    }}
  >
    <div style={{
      width: '50px',
      height: '50px',
      background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 12px',
      color: 'white',
      fontSize: '20px',
      fontWeight: 'bold'
    }}>
      {step.number}
    </div>
    <h4 style={{
      fontSize: '18px',
      fontWeight: '600',
      fontFamily: "'Quicksand', sans-serif",
      marginBottom: '8px',
      color: isDark ? '#fefae0' : '#0f172a'
    }}>
      {step.title}
    </h4>
    <p style={{
      fontSize: '14px',
      color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b'
    }}>
      {step.desc}
    </p>
  </div>
))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 40px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          padding: '50px',
          background: isDark 
            ? `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.secondary}10)`
            : `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.secondary}05)`,
          borderRadius: '24px',
          border: isDark ? `1px solid ${COLORS.primary}20` : `1px solid ${COLORS.primary}10`
        }}>
          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            marginBottom: '15px',
            color: isDark ? '#fefae0' : '#0f172a'
          }}>
            Prêt à décrocher votre stage ?
          </h3>
          <p style={{
            fontSize: '18px',
            color: isDark ? 'rgba(254,250,224,0.5)' : '#64748b',
            marginBottom: '30px'
          }}>
            Inscrivez-vous gratuitement et laissez notre IA vous aider à trouver le stage parfait.
          </p>

          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                y: -3,
                boxShadow: `0 16px 50px ${COLORS.primary}50`
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '18px 50px',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: "'Quicksand', sans-serif",
                boxShadow: `0 10px 40px ${COLORS.primary}40`,
                margin: '0 auto',
                transition: 'all 0.15s ease'
              }}
            >
              Créer un compte gratuit
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        textAlign: 'center',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(139, 126, 116, 0.08)',
        background: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.3)',
        marginTop: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <LampLogo size={28} color1={COLORS.primary} color2={COLORS.secondary} />
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            StageConnect
          </span>
        </div>
        <p style={{
          color: isDark ? 'rgba(254,250,224,0.4)' : '#94a3b8',
          fontSize: '14px'
        }}>
          © 2026 StageConnect. Tous droits réservés.
        </p>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{
              scale: 1.1,
              boxShadow: `0 8px 30px ${COLORS.primary}60`
            }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${COLORS.primary}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              transition: 'all 0.15s ease'
            }}
          >
            <FiArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        
        .cursor-blink {
          animation: blink 0.7s step-end infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

export default Welcome;