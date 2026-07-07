// LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'fr'; // Default to French
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    // Translation function
    const t = (key) => {
        const translations = {
            // Common
            loading: { en: "Loading...", fr: "Chargement...", ar: "جاري التحميل..." },
            login: { en: "Login", fr: "Se connecter", ar: "تسجيل الدخول" },
            logout: { en: "Logout", fr: "Déconnexion", ar: "تسجيل الخروج" },
            dashboard: { en: "Dashboard", fr: "Tableau de bord", ar: "لوحة التحكم" },
            profile: { en: "Profile", fr: "Profil", ar: "الملف الشخصي" },
            welcomeBack: { en: "Welcome back", fr: "Bon retour", ar: "مرحباً بعودتك" },
            activeApplications: { en: "Active Applications", fr: "Candidatures actives", ar: "الطلبات النشطة" },
            upcomingInterviews: { en: "Upcoming Interviews", fr: "Entretiens à venir", ar: "المقابلات القادمة" },
            availableOffers: { en: "Available Offers", fr: "Offres disponibles", ar: "الفرص المتاحة" },
            completedInterviews: { en: "Completed Interviews", fr: "Entretiens complétés", ar: "المقابلات المكتملة" },
            offer: { en: "Offer", fr: "Offre", ar: "فرصة" },
            company: { en: "Company", fr: "Entreprise", ar: "شركة" },
            location: { en: "Location", fr: "Localisation", ar: "الموقع" },
            contractType: { en: "Contract type", fr: "Type de contrat", ar: "نوع العقد" },
            salary: { en: "Salary", fr: "Salaire", ar: "الراتب" },
            skills: { en: "Skills", fr: "Compétences", ar: "المهارات" },
            deadline: { en: "Deadline", fr: "Date limite", ar: "تاريخ الانتهاء" },
            addOffer: { en: "Add an offer", fr: "Ajouter une offre", ar: "إضافة فرصة" },
            editOffer: { en: "Edit offer", fr: "Modifier l'offre", ar: "تعديل الفرصة" },
            delete: { en: "Delete", fr: "Supprimer", ar: "حذف" },
            cancel: { en: "Cancel", fr: "Annuler", ar: "إلغاء" },
            save: { en: "Save", fr: "Enregistrer", ar: "حفظ" },
            apply: { en: "Apply", fr: "Postuler", ar: "تقديم" },
            myApplications: { en: "My Applications", fr: "Mes candidatures", ar: "طلباتي" },
            // Add more as needed
        };

        return translations[key]?.[language] || translations[key]?.['fr'] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};