// ThemeContext.jsx - Complete with isDark, theme values, and CSS classes
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        
        // Apply CSS classes for theme
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            document.documentElement.style.colorScheme = 'light';
            document.documentElement.style.setProperty('--bg-primary', '#f1f5f9');
            document.documentElement.style.setProperty('--bg-card', '#ffffff');
            document.documentElement.style.setProperty('--text-primary', '#0f172a');
            document.documentElement.style.setProperty('--text-secondary', '#64748b');
            document.documentElement.style.setProperty('--border-color', '#e2e8f0');
        } else {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
            document.documentElement.style.colorScheme = 'dark';
            document.documentElement.style.setProperty('--bg-primary', '#0f172a');
            document.documentElement.style.setProperty('--bg-card', 'rgba(255,255,255,0.06)');
            document.documentElement.style.setProperty('--text-primary', '#fefae0');
            document.documentElement.style.setProperty('--text-secondary', 'rgba(254,250,224,0.55)');
            document.documentElement.style.setProperty('--border-color', 'rgba(255,255,255,0.1)');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const isDark = theme === 'dark';

    // Theme values for consistent styling across components
    const themeValues = {
        theme,
        isDark,
        toggleTheme,
        // Backward compatibility for components using 'isDark'
        isDarkMode: isDark,
        // Color palette
        colors: {
            primary: '#6c63ff',
            primaryDark: '#4834d4',
            primaryLight: '#a78bfa',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
        },
        // Text colors
        text: {
            primary: isDark ? '#fefae0' : '#0f172a',
            secondary: isDark ? 'rgba(254,250,224,0.55)' : '#64748b',
            muted: isDark ? 'rgba(254,250,224,0.35)' : '#94a3b8',
        },
        // Background colors
        bg: {
            primary: isDark ? '#0f172a' : '#f1f5f9',
            card: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
            cardHover: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.02)',
            cardSolid: isDark ? 'rgba(30, 30, 60, 0.95)' : '#ffffff',
            input: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
            overlay: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)',
        },
        // Border colors
        border: {
            light: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            medium: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            strong: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        },
        // Shadows
        shadow: {
            sm: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
            md: isDark ? '0 4px 24px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.06)',
            lg: isDark ? '0 8px 48px rgba(0,0,0,0.3)' : '0 8px 48px rgba(0,0,0,0.08)',
        },
        // CSS variable helper
        css: (variable) => {
            const cssVars = {
                '--bg-primary': isDark ? '#0f172a' : '#f1f5f9',
                '--bg-card': isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                '--bg-card-solid': isDark ? 'rgba(30, 30, 60, 0.95)' : '#ffffff',
                '--bg-input': isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                '--text-primary': isDark ? '#fefae0' : '#0f172a',
                '--text-secondary': isDark ? 'rgba(254,250,224,0.55)' : '#64748b',
                '--text-muted': isDark ? 'rgba(254,250,224,0.35)' : '#94a3b8',
                '--border-color': isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                '--gradient-primary': 'linear-gradient(135deg, #6c63ff, #4834d4)',
                '--shadow-lg': isDark ? '0 8px 48px rgba(0,0,0,0.3)' : '0 8px 48px rgba(0,0,0,0.08)',
            };
            return cssVars[variable] || '';
        }
    };

    return (
        <ThemeContext.Provider value={themeValues}>
            {children}
        </ThemeContext.Provider>
    );
};