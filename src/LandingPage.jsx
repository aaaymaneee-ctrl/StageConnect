// LandingPage.jsx - Professional Design with Typing Animation
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMenu, FiSun, FiMoon, FiArrowRight, FiTrendingUp, FiBriefcase, 
  FiUsers, FiFileText, FiMessageCircle, FiCpu, FiLock, 
  FiStar, FiCheckCircle, FiZap, FiTarget, FiBarChart2, FiClock,
  FiX, FiAward, FiUserPlus, FiMail, FiMapPin,
  FiTwitter, FiGithub, FiLinkedin, FiLogIn, FiGlobe,
  FiCode, FiBookOpen, FiRocket, FiShield, FiLayers,
  FiHexagon, FiThumbsUp, FiHeart, FiCompass, FiDroplet
} from 'react-icons/fi';
import { HiOutlineOfficeBuilding, HiOutlineAcademicCap } from 'react-icons/hi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

// Professional Color Palette
const COLORS = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  success: '#10b981',
  successLight: '#34d399',
  info: '#06b6d4',
  infoLight: '#22d3ee',
  danger: '#ef4444',
  warning: '#f97316',
  pink: '#ec4899',
  indigo: '#4f46e5',
  teal: '#14b8a6',
  rose: '#f43f5e',
  purple: '#a855f7',
  blue: '#3b82f6',
};

// Lamp Logo Component
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

// Typing Animation Component with Loop
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
        timeout = setTimeout(() => {
          // Restart after a short pause
        }, 300);
      }
      return () => clearTimeout(timeout);
    }

    if (currentIndex < text.length) {
      timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
    } else {
      // Pause at the end before deleting
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

function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ students: 0, companies: 0, offers: 0, placements: 0 });
  
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsMobileMenuOpen(false);
  };

  const isDarkMode = theme === 'dark';

  const colors = {
    background: isDarkMode ? '#0f172a' : '#f8fafc',
    textPrimary: isDarkMode ? '#fefae0' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    cardBg: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
  };

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
    timers.push(animateValue(0, 5000, 2000, (val) => setCounts(prev => ({ ...prev, students: val }))));
    timers.push(animateValue(0, 300, 2000, (val) => setCounts(prev => ({ ...prev, companies: val }))));
    timers.push(animateValue(0, 1200, 2000, (val) => setCounts(prev => ({ ...prev, offers: val }))));
    timers.push(animateValue(0, 94, 2000, (val) => setCounts(prev => ({ ...prev, placements: val }))));

    return () => timers.forEach(timer => clearInterval(timer));
  }, []);

  const heroText = "Trouvez le stage de vos rêves avec l'IA";

  // Feature cards data with diverse colors
  const features = [
    { 
      icon: <FiCpu size={28} />, 
      title: 'Matching IA', 
      desc: 'Des algorithmes intelligents vous mettent en relation avec les meilleures opportunités selon vos compétences.', 
      color: COLORS.primary,
      gradient: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
    },
    { 
      icon: <FiFileText size={28} />, 
      title: 'Analyse CV', 
      desc: 'Obtenez des insights et améliorez votre CV avec notre analyse NLP alimentée par l\'IA.', 
      color: COLORS.success,
      gradient: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.teal})`
    },
    { 
      icon: <FiMessageCircle size={28} />, 
      title: 'Entretiens simulés', 
      desc: 'Entraînez-vous avec des simulations d\'entretien IA et recevez des retours instantanés.', 
      color: COLORS.accent,
      gradient: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.warning})`
    },
    { 
      icon: <FiTarget size={28} />, 
      title: 'Matching précis', 
      desc: 'Notre IA analyse votre profil pour trouver les offres qui correspondent parfaitement à vos compétences.', 
      color: COLORS.pink,
      gradient: `linear-gradient(135deg, ${COLORS.pink}, ${COLORS.rose})`
    },
    { 
      icon: <FiBarChart2 size={28} />, 
      title: 'Suivi en temps réel', 
      desc: 'Suivez l\'avancement de vos candidatures et recevez des notifications instantanées.', 
      color: COLORS.info,
      gradient: `linear-gradient(135deg, ${COLORS.info}, ${COLORS.blue})`
    },
    { 
      icon: <FiAward size={28} />, 
      title: 'Accompagnement personnalisé', 
      desc: 'Bénéficiez de conseils personnalisés pour maximiser vos chances de réussite.', 
      color: COLORS.purple,
      gradient: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.indigo})`
    }
  ];

  const steps = [
    { number: 1, title: 'Créer un compte', desc: 'Inscrivez-vous en tant qu\'étudiant ou recruteur', color: COLORS.primary },
    { number: 2, title: 'Compléter le profil', desc: 'Téléchargez votre CV et vos compétences', color: COLORS.success },
    { number: 3, title: 'Être mis en relation', desc: 'L\'IA trouve les meilleures opportunités', color: COLORS.accent },
    { number: 4, title: 'Commencer carrière', desc: 'Connectez-vous avec les recruteurs', color: COLORS.pink }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="landing-page" 
      style={{ 
        background: colors.background, 
        color: colors.textPrimary,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorations with Multiple Colors */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 20, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{
          position: 'absolute',
          width: '700px',
          height: '700px',
          background: `radial-gradient(circle, ${COLORS.primary}08, ${COLORS.secondary}06, transparent)`,
          borderRadius: '50%',
          top: '-300px',
          right: '-250px',
          zIndex: 0,
          pointerEvents: 'none'
        }} 
      />
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: `radial-gradient(circle, ${COLORS.accent}06, ${COLORS.pink}04, transparent)`,
          borderRadius: '50%',
          bottom: '-150px',
          left: '-150px',
          zIndex: 0,
          pointerEvents: 'none'
        }} 
      />
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          y: [0, -30, 0]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${COLORS.success}06, ${COLORS.teal}04, transparent)`,
          borderRadius: '50%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} 
      />

      {/* Navigation */}
      <motion.nav 
        variants={itemVariants}
        style={{
          position: 'relative',
          zIndex: 100,
          padding: '16px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(20px)',
          background: isDarkMode 
            ? 'rgba(15, 23, 42, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          borderBottom: `1px solid ${colors.border}`,
          flexWrap: 'wrap'
        }}
      >
        {/* Logo */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer'
          }}
        >
          <LampLogo size={35} color1={COLORS.primary} color2={COLORS.secondary} />
         <span style={{
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: "'Quicksand', sans-serif",
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
}}>
    StageConnect
</span>
        </motion.div>

        {/* Desktop Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '25px'
        }}>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            href="#features" 
            onClick={(e) => { e.preventDefault(); scrollToSection(featuresRef); }}
            style={{
              color: colors.textSecondary,
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontFamily: "'Quicksand', sans-serif",
              cursor: 'pointer',
              padding: '6px 0',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.target.style.color = COLORS.primary}
            onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
          >
            Fonctionnalités
          </motion.a>
          
          <motion.a 
            whileHover={{ scale: 1.05 }}
            href="#how-it-works" 
            onClick={(e) => { e.preventDefault(); scrollToSection(howItWorksRef); }}
            style={{
              color: colors.textSecondary,
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'color 0.3s',
              fontFamily: "'Quicksand', sans-serif",
              cursor: 'pointer',
              padding: '6px 0',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.target.style.color = COLORS.accent}
            onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
          >
            Comment ça marche
          </motion.a>

          {/* Theme Toggle */}
          <motion.button 
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              border: `1px solid ${colors.border}`,
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDarkMode ? <FiSun style={{ color: COLORS.accent }} size={18} /> : <FiMoon style={{ color: COLORS.primary }} size={18} />}
          </motion.button>

          {/* Login Button */}
          <motion.button 
            whileHover={{ scale: 1.05, borderColor: COLORS.primary }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 20px',
              background: 'transparent',
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: "'Quicksand', sans-serif",
              transition: 'all 0.3s'
            }}
          >
            <FiLogIn style={{ display: 'inline', marginRight: '6px' }} />
            Se connecter
          </motion.button>
          
          {/* Sign Up Button */}
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
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
              transition: 'all 0.3s'
            }}
          >
            <FiUserPlus style={{ display: 'inline', marginRight: '6px' }} />
            S'inscrire
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: colors.textPrimary,
            fontSize: '28px',
            cursor: 'pointer'
          }}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            style={{
              position: 'fixed',
              top: '80px',
              left: 0,
              right: 0,
              bottom: 0,
              background: isDarkMode ? 'rgba(15,23,42,0.98)' : 'rgba(255,255,255,0.98)',
              zIndex: 99,
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <a 
              href="#features" 
              onClick={(e) => { e.preventDefault(); scrollToSection(featuresRef); }}
              style={{
                color: colors.textPrimary,
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: '500'
              }}
            >
              Fonctionnalités
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => { e.preventDefault(); scrollToSection(howItWorksRef); }}
              style={{
                color: colors.textPrimary,
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: '500'
              }}
            >
              Comment ça marche
            </a>
            
            <button 
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                width: '100%'
              }}
            >
              <FiLogIn style={{ display: 'inline', marginRight: '8px' }} />
              Se connecter
            </button>
            
            <button 
              onClick={() => navigate('/register')}
              style={{
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                width: '100%'
              }}
            >
              <FiUserPlus style={{ display: 'inline', marginRight: '8px' }} />
              S'inscrire
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section 
        variants={itemVariants}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '80px 40px 60px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}
      >
        <motion.div
          variants={itemVariants}
        >
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            fontWeight: '800',
            marginBottom: '1rem',
            color: colors.textPrimary,
            fontFamily: "'Quicksand', sans-serif",
            lineHeight: '1.2'
          }}>
            <TypingText text={heroText} />
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '1.2rem',
              color: colors.textSecondary,
              maxWidth: '700px',
              margin: '0 auto 2rem',
              lineHeight: '1.8'
            }}
          >
            Matching intelligent, analyse de CV, entretiens simulés — tout ce dont
            vous avez besoin pour décrocher votre stage idéal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 40px',
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.pink})`,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: "'Quicksand', sans-serif",
                boxShadow: `0 8px 32px ${COLORS.primary}40`,
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              Commencer <FiArrowRight />
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection(howItWorksRef)}
              style={{
                padding: '16px 40px',
                background: 'transparent',
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: "'Quicksand', sans-serif",
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              En savoir plus
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginTop: '60px',
            padding: '30px',
            background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(139,126,116,0.05)'
          }}
        >
          {[
            { value: `${counts.students}+`, label: 'ÉTUDIANTS', icon: <FiUsers size={24} />, color: COLORS.primary },
            { value: `${counts.companies}+`, label: 'ENTREPRISES', icon: <HiOutlineOfficeBuilding size={24} />, color: COLORS.success },
            { value: `${counts.offers}+`, label: 'OFFRES', icon: <FiBriefcase size={24} />, color: COLORS.accent },
            { value: `~${counts.placements}%`, label: 'PLACEMENT RATE', icon: <FiTrendingUp size={24} />, color: COLORS.pink }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              style={{
                textAlign: 'center',
                padding: '10px'
              }}
            >
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                fontFamily: "'Quicksand', sans-serif",
                color: stat.color
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: colors.textSecondary,
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px'
              }}>
                {stat.icon} {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Why Choose Section */}
      <motion.section 
        ref={featuresRef} 
        id="features"
        variants={itemVariants}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '80px 40px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            marginBottom: '15px'
          }}>
            Pourquoi choisir{' '}
            <span style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.pink})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              StageConnect
            </span>
            ?
          </h2>
          <p style={{
            fontSize: '18px',
            color: colors.textSecondary,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Tout ce dont vous avez besoin pour lancer votre carrière, sur une seule plateforme.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '25px'
        }}>
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
                borderRadius: '20px',
                padding: '30px',
                textAlign: 'center',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(139,126,116,0.08)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                style={{
                  width: '60px',
                  height: '60px',
                  background: `${feature.color}20`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: feature.color,
                  transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                {feature.icon}
              </motion.div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: "'Quicksand', sans-serif",
                marginBottom: '10px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '15px',
                color: colors.textSecondary,
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: feature.gradient,
                  transform: 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scaleX(1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scaleX(0)'}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        ref={howItWorksRef} 
        id="how-it-works"
        variants={itemVariants}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '80px 40px',
          maxWidth: '1200px',
          margin: '0 auto',
          background: isDarkMode ? `rgba(99,102,241,0.03)` : '#f5f3ff',
          borderRadius: '2rem',
          marginTop: '20px'
        }}
      >
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            marginBottom: '15px'
          }}>
            Comment ça marche
          </h2>
          <p style={{
            fontSize: '18px',
            color: colors.textSecondary
          }}>
            De l'inscription à votre premier entretien en 4 étapes simples.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                scale: 1.03,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              style={{
                textAlign: 'center',
                padding: '30px 20px',
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
                borderRadius: '16px',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(139,126,116,0.05)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: 'pointer'
              }}
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
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
                  fontWeight: 'bold',
                  transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                {step.number}
              </motion.div>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                fontFamily: "'Quicksand', sans-serif",
                marginBottom: '8px'
              }}>
                {step.title}
              </h4>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary
              }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: '60px',
            padding: '50px',
            background: isDarkMode 
              ? `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.secondary}10)`
              : `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.secondary}05)`,
            borderRadius: '24px',
            textAlign: 'center',
            border: isDarkMode ? `1px solid ${COLORS.primary}20` : `1px solid ${COLORS.primary}10`
          }}
        >
          <h3 style={{
            fontSize: '28px',
            fontWeight: '700',
            fontFamily: "'Quicksand', sans-serif",
            marginBottom: '15px'
          }}>
            Prêt à commencer votre voyage ?
          </h3>
          <p style={{
            fontSize: '18px',
            color: colors.textSecondary,
            marginBottom: '30px'
          }}>
            Rejoignez des milliers d'étudiants qui ont trouvé leur stage de rêve avec StageConnect.
          </p>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              flexWrap: 'wrap',
              marginBottom: '30px'
            }}
          >
            {[
              { icon: <FiCheckCircle size={18} />, label: 'Gratuit à vie', color: COLORS.success },
              { icon: <FiLock size={18} />, label: 'Sans carte bancaire', color: COLORS.accent },
              { icon: <FiCpu size={18} />, label: 'AI-powered matching', color: COLORS.primary }
            ].map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', color: item.color }}
              >
                {item.icon} {item.label}
              </motion.div>
            ))}
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 48px',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.pink})`,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: "'Quicksand', sans-serif",
              boxShadow: `0 8px 32px ${COLORS.primary}40`,
              transition: 'all 0.3s'
            }}
          >
            Créer un compte gratuit
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        variants={itemVariants}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '40px',
          marginTop: '40px',
          borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(139,126,116,0.08)',
          background: isDarkMode ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.3)'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <LampLogo size={30} color1={COLORS.primary} color2={COLORS.secondary} />
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
              fontSize: '14px',
              color: colors.textSecondary,
              lineHeight: '1.6'
            }}>
              Votre carrière, accélérée par l'IA.
            </p>
          </div>

          <div>
            <h5 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              fontFamily: "'Quicksand', sans-serif"
            }}>Planification</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Entreprise', 'Ressources', 'Connecter'].map((item) => (
                <motion.a 
                  key={item}
                  whileHover={{ x: 5, color: COLORS.primary }}
                  href="#" 
                  style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h5 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              fontFamily: "'Quicksand', sans-serif"
            }}>Entreprise</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['À propos', 'Carte d\'aide', 'Blog'].map((item) => (
                <motion.a 
                  key={item}
                  whileHover={{ x: 5, color: COLORS.secondary }}
                  href="#" 
                  style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h5 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              fontFamily: "'Quicksand', sans-serif"
            }}>Légal</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Politique de confidentialité', 'Conditions d\'utilisation'].map((item) => (
                <motion.a 
                  key={item}
                  whileHover={{ x: 5, color: COLORS.accent }}
                  href="#" 
                  style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '30px auto 0',
          paddingTop: '20px',
          borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(139,126,116,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <span style={{
            fontSize: '14px',
            color: isDarkMode ? 'rgba(254,250,224,0.4)' : '#94a3b8'
          }}>
            © 2026 StageConnect. Tous droits réservés.
          </span>
          
          <div style={{
            display: 'flex',
            gap: '15px'
          }}>
            {[
              { icon: <FiTwitter size={20} />, color: '#1DA1F2' },
              { icon: <FiGithub size={20} />, color: '#6e5494' },
              { icon: <FiLinkedin size={20} />, color: '#0A66C2' }
            ].map((social, index) => (
              <motion.a 
                key={index}
                whileHover={{ scale: 1.2, y: -3, color: social.color }}
                href="#" 
                style={{
                  color: isDarkMode ? 'rgba(254,250,224,0.4)' : '#94a3b8',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

        .cursor-blink {
          animation: blink 0.7s step-end infinite;
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </motion.div>
  );
}

export default LandingPage;