// App.jsx - With Scroll Reveal & Page Transitions
import { Outlet, useLocation } from 'react-router-dom';
import Bar from './Bar';
import { useTheme } from './ThemeContext';
import { useEffect } from 'react';

function Layout() {
    const { isDark } = useTheme();
    const location = useLocation();
    
    // Theme configuration
    useEffect(() => {
        document.body.style.backgroundColor = isDark ? '#0f172a' : '#f1f5f9';
        document.body.style.transition = 'background-color 0.3s ease';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.fontFamily = "'Quicksand', 'Inter', sans-serif";
    }, [isDark]);
    
    // Scroll reveal animation
    useEffect(() => {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        
        const revealOnScroll = () => {
            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight - 100) {
                    element.classList.add('revealed');
                }
            });
        };
        
        // Initial check
        setTimeout(revealOnScroll, 100);
        
        window.addEventListener('scroll', revealOnScroll);
        
        return () => window.removeEventListener('scroll', revealOnScroll);
    }, [location.pathname]); // Re-run on route change
    
    // Page transition on route change
    useEffect(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('page-transition');
            // Force reflow
            void mainContent.offsetWidth;
            mainContent.classList.add('page-transition');
        }
    }, [location.pathname]);
    
    return (
        <div className="dashboard-wrapper" data-theme={isDark ? 'dark' : 'light'}>
            <Bar />
            <main className="main-content">
                <Outlet />
            </main>
            
            {/* CSS for animations */}
            <style>{`
                /* Dashboard Wrapper */
                .dashboard-wrapper {
                    min-height: 100vh;
                    background-color: ${isDark ? '#0f172a' : '#f1f5f9'};
                    transition: background-color 0.3s ease;
                }
                
                .main-content {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    opacity: 1;
                    transition: opacity 0.3s ease;
                }
                
                /* Page Transition Animation */
                .page-transition {
                    animation: fadeSlideIn 0.4s ease forwards;
                }
                
                @keyframes fadeSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Scroll Reveal Animation */
                .reveal-on-scroll {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .reveal-on-scroll.revealed {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                /* Stagger children for smoother reveal */
                .reveal-on-scroll.revealed > * {
                    animation: fadeInUp 0.5s ease forwards;
                }
                
                .reveal-on-scroll.revealed > *:nth-child(1) { animation-delay: 0.05s; }
                .reveal-on-scroll.revealed > *:nth-child(2) { animation-delay: 0.1s; }
                .reveal-on-scroll.revealed > *:nth-child(3) { animation-delay: 0.15s; }
                .reveal-on-scroll.revealed > *:nth-child(4) { animation-delay: 0.2s; }
                .reveal-on-scroll.revealed > *:nth-child(5) { animation-delay: 0.25s; }
                .reveal-on-scroll.revealed > *:nth-child(6) { animation-delay: 0.3s; }
                
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                /* Dark mode styles */
                [data-theme="dark"] .main-content {
                    color: #ffffff;
                }
                
                [data-theme="dark"] .reveal-on-scroll {
                    color: #ffffff;
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .main-content {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default Layout;