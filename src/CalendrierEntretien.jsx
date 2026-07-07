// CalendrierEntretien.jsx
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext.jsx';
import ModalPortal from './ModalPortal.jsx';

function CalendrierEntretien({ offre, onClose, onConfirm, mode = 'student' }) {
    const { isDark } = useTheme();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Theme-aware styles
    const bgColor = isDark ? '#1e1e2d' : '#ffffff';
    const textColor = isDark ? 'white' : '#0f172a';
    const textSecondary = isDark ? 'rgba(255,255,255,0.6)' : '#64748b';
    const borderColor = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc';
    const selectedBg = isDark ? 'rgba(108, 99, 255, 0.3)' : '#eef2ff';
    const hoverBg = isDark ? 'rgba(108, 99, 255, 0.15)' : '#f5f3ff';
    const headerBg = isDark ? 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(72, 52, 212, 0.15))' : 'linear-gradient(135deg, #f5f3ff, #eef2ff)';
    const summaryBg = isDark ? 'linear-gradient(135deg, rgba(108, 99, 255, 0.15), rgba(72, 52, 212, 0.15))' : 'linear-gradient(135deg, #f5f3ff, #eef2ff)';
    const summaryBorder = isDark ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid #ddd6fe';
    const cancelBg = isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9';
    const cancelHoverBg = isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0';
    const closeBg = isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9';
    const closeHoverBg = isDark ? 'rgba(255,255,255,0.2)' : '#e2e8f0';
    const disabledBtn = isDark ? 'rgba(108, 99, 255, 0.3)' : '#c7d2fe';
    const modalShadow = isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)';
    const errorBg = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2';
    const errorBorder = isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecaca';
    const emptyStateColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';

    const icons = {
        calendar: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
        ),
        clock: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
        ),
        chevronLeft: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
        ),
        chevronRight: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
            </svg>
        ),
        check: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
        ),
        x: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        ),
        spinner: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
            </svg>
        ),
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 8; hour <= 18; hour++) {
            const formattedHour = String(hour).padStart(2, '0');
            slots.push(`${formattedHour}:00`);
            if (hour < 18) {
                slots.push(`${formattedHour}:30`);
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const isDateAvailable = (date) => {
        if (!date) return false;
        if (date < today) return false;
        const day = date.getDay();
        if (day === 0 || day === 6) return false;
        return true;
    };

    const isDateSelected = (date) => {
        if (!date || !selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const isToday = (date) => {
        if (!date) return false;
        return date.toDateString() === today.toDateString();
    };

    const handleDateClick = (date) => {
        if (!date || !isDateAvailable(date)) return;
        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleTimeClick = (time) => {
        setSelectedTime(time);
    };

    const handleConfirm = () => {
        console.log('🔍 BUTTON CLICKED!');
        console.log('selectedDate:', selectedDate);
        console.log('selectedTime:', selectedTime);
        console.log('onConfirm type:', typeof onConfirm);
        
        if (!selectedDate || !selectedTime) {
            setMessage('Veuillez sélectionner une date et une heure');
            return;
        }
        
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        const [hours, minutes] = selectedTime.split(':');
        let endHour = parseInt(hours) + 1;
        const endTime = `${String(endHour).padStart(2, '0')}:${minutes}`;
        
        const creneauData = {
            date: formattedDate,
            heureDebut: selectedTime,
            heureFin: endTime
        };
        
        console.log('Calling onConfirm with:', creneauData);
        
        if (typeof onConfirm === 'function') {
            onConfirm(creneauData);
        } else {
            console.error('onConfirm is NOT a function!');
        }
    };

    const formatDateFrench = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isTimeInPast = (time) => {
        if (!selectedDate || !isToday(selectedDate)) return false;
        const [hours, minutes] = time.split(':');
        const now = new Date();
        const timeToCheck = new Date();
        timeToCheck.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return timeToCheck < now;
    };

    const safeMessageStr = String(message?.props?.children || message);
    const isErrorMessage = safeMessageStr.includes('Erreur') || safeMessageStr.includes('Impossible');

    return (
        <ModalPortal>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
                padding: '20px',
                margin: 0
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            >
                <div style={{
                    background: bgColor,
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '700px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    boxShadow: modalShadow,
                    border: borderColor,
                    position: 'relative',
                    zIndex: 10000
                }}
                onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '25px 30px',
                        borderBottom: borderColor,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: headerBg
                    }}>
                        <div>
                            <h2 style={{
                                color: textColor,
                                fontSize: '22px',
                                margin: '0 0 5px 0',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {icons.calendar} Choisir un créneau
                            </h2>
                            <p style={{
                                color: textSecondary,
                                margin: 0,
                                fontSize: '14px'
                            }}>
                                {offre?.offreTitre || offre?.titre || 'Entretien'} • {offre?.entreprise || ''}
                                {offre?.etudiantName ? ` • Candidat: ${offre.etudiantName}` : ''}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            style={{
                                background: closeBg,
                                border: 'none',
                                color: textColor,
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s',
                                opacity: isSubmitting ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) e.target.style.background = closeHoverBg;
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting) e.target.style.background = closeBg;
                            }}
                        >
                            {icons.x}
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '30px',
                        overflowY: 'auto',
                        maxHeight: 'calc(90vh - 100px)'
                    }}>
                        {/* Message */}
                        {message && (
                            <div 
                                onClick={() => setMessage(null)}
                                style={{
                                    position: 'fixed',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    backdropFilter: 'blur(8px)',
                                    zIndex: 99999,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <style>
                                {`
                                    .animate-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                                    @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                                    .svg-icon { width: 80px; height: 80px; stroke-width: 3; stroke-miterlimit: 10; margin: 0 auto 20px; display: block; }
                                    .svg-circle { stroke-dasharray: 166; stroke-dashoffset: 166; fill: none; animation: drawStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
                                    .svg-check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards; }
                                    .svg-cross { stroke-dasharray: 48; stroke-dashoffset: 48; animation: drawStroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards; }
                                    @keyframes drawStroke { 100% { stroke-dashoffset: 0; } }
                                `}
                                </style>
                                <div className="animate-pop" style={{ background: '#ffffff', padding: '40px 50px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
                                    {isErrorMessage ? (
                                        <svg className="svg-icon" style={{ stroke: '#ef4444' }} viewBox="0 0 52 52">
                                            <circle className="svg-circle" cx="26" cy="26" r="25" />
                                            <path className="svg-cross" fill="none" strokeLinecap="round" d="M16,16 L36,36 M36,16 L16,36" />
                                        </svg>
                                    ) : (
                                        <svg className="svg-icon" style={{ stroke: '#10b981' }} viewBox="0 0 52 52">
                                            <circle className="svg-circle" cx="26" cy="26" r="25" />
                                            <path className="svg-check" fill="none" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                        </svg>
                                    )}
                                    <h3 style={{ margin: '0 0 10px 0', color: isErrorMessage ? '#ef4444' : '#10b981', fontSize: '24px', fontWeight: 'bold' }}>
                                        {isErrorMessage ? 'Erreur' : 'Succès !'}
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: '16px', margin: '0', lineHeight: '1.5' }}>{safeMessageStr}</p>
                                </div>
                            </div>
                        )}

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '30px'
                        }}>
                            {/* Calendar Section */}
                            <div>
                                <h3 style={{
                                    color: textColor,
                                    fontSize: '16px',
                                    marginBottom: '15px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {icons.calendar} Date
                                </h3>

                                {/* Month Navigation */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <button 
                                        onClick={() => navigateMonth(-1)} 
                                        disabled={isSubmitting}
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            color: '#6c63ff', 
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                                            padding: '8px', 
                                            borderRadius: '8px',
                                            opacity: isSubmitting ? 0.5 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSubmitting) e.target.style.background = hoverBg;
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSubmitting) e.target.style.background = 'transparent';
                                        }}
                                    >
                                        {icons.chevronLeft}
                                    </button>
                                    <span style={{ color: textColor, fontWeight: '600', fontSize: '16px' }}>
                                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                    </span>
                                    <button 
                                        onClick={() => navigateMonth(1)} 
                                        disabled={isSubmitting}
                                        style={{ 
                                            background: 'transparent', 
                                            border: 'none', 
                                            color: '#6c63ff', 
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                                            padding: '8px', 
                                            borderRadius: '8px',
                                            opacity: isSubmitting ? 0.5 : 1
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSubmitting) e.target.style.background = hoverBg;
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSubmitting) e.target.style.background = 'transparent';
                                        }}
                                    >
                                        {icons.chevronRight}
                                    </button>
                                </div>

                                {/* Week Days */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '5px',
                                    marginBottom: '10px'
                                }}>
                                    {weekDays.map(day => (
                                        <div key={day} style={{
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: textSecondary,
                                            padding: '8px 0'
                                        }}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: '5px'
                                }}>
                                    {days.map((date, index) => (
                                        <div key={index} style={{
                                            textAlign: 'center',
                                            padding: '10px 0',
                                            borderRadius: '10px',
                                            cursor: date && isDateAvailable(date) && !isSubmitting ? 'pointer' : 'default',
                                            background: isDateSelected(date) ? selectedBg : 'transparent',
                                            border: isDateSelected(date) ? '2px solid #6c63ff' : '2px solid transparent',
                                            color: date && isDateAvailable(date) ? textColor : textSecondary,
                                            fontWeight: isToday(date) ? 'bold' : 'normal',
                                            opacity: date && isDateAvailable(date) ? (isSubmitting ? 0.5 : 1) : 0.4,
                                            transition: 'all 0.2s',
                                            fontSize: '14px',
                                            position: 'relative'
                                        }}
                                        onClick={() => !isSubmitting && handleDateClick(date)}
                                        onMouseEnter={(e) => {
                                            if (date && isDateAvailable(date) && !isDateSelected(date) && !isSubmitting) {
                                                e.target.style.background = hoverBg;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (date && isDateAvailable(date) && !isDateSelected(date) && !isSubmitting) {
                                                e.target.style.background = 'transparent';
                                            }
                                        }}
                                        >
                                            {date ? date.getDate() : ''}
                                            {isToday(date) && (
                                                <div style={{
                                                    width: '4px',
                                                    height: '4px',
                                                    background: '#6c63ff',
                                                    borderRadius: '50%',
                                                    margin: '2px auto 0'
                                                }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Time Section */}
                            <div>
                                <h3 style={{
                                    color: textColor,
                                    fontSize: '16px',
                                    marginBottom: '15px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    {icons.clock} Heure
                                </h3>

                                {selectedDate ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '8px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        paddingRight: '10px'
                                    }}>
                                        {timeSlots.map((time) => {
                                            const pastTime = isTimeInPast(time);
                                            
                                            return (
                                            <button
                                                key={time}
                                                onClick={() => !isSubmitting && !pastTime && handleTimeClick(time)}
                                                disabled={isSubmitting || pastTime}
                                                style={{
                                                    padding: '12px',
                                                    background: selectedTime === time
                                                        ? 'linear-gradient(135deg, #6c63ff, #4834d4)'
                                                        : cardBg,
                                                    border: selectedTime === time
                                                        ? 'none'
                                                        : borderColor,
                                                    borderRadius: '10px',
                                                    color: selectedTime === time ? 'white' : textColor,
                                                    cursor: (isSubmitting || pastTime) ? 'not-allowed' : 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: selectedTime === time ? 'bold' : 'normal',
                                                    transition: 'all 0.3s',
                                                    opacity: (isSubmitting || pastTime) ? 0.3 : 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    textDecoration: pastTime ? 'line-through' : 'none'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSubmitting && !pastTime && selectedTime !== time) {
                                                        e.target.style.background = hoverBg;
                                                        e.target.style.borderColor = '#6c63ff';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSubmitting && !pastTime && selectedTime !== time) {
                                                        e.target.style.background = cardBg;
                                                        e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                                                    }
                                                }}
                                            >
                                                {icons.clock} {time}
                                            </button>
                                        )})}
                                    </div>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '200px',
                                        color: textSecondary,
                                        fontSize: '14px',
                                        textAlign: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '40px', marginBottom: '10px', opacity: 0.3, color: emptyStateColor }}>
                                                {icons.clock}
                                            </div>
                                            Sélectionnez d'abord une date
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Summary */}
                        {selectedDate && selectedTime && (
                            <div style={{
                                marginTop: '25px',
                                padding: '20px',
                                background: summaryBg,
                                borderRadius: '16px',
                                border: summaryBorder,
                                textAlign: 'center'
                            }}>
                                <p style={{ color: textColor, fontSize: '15px', margin: '0 0 5px 0', fontWeight: '500' }}>
                                    Créneau sélectionné :
                                </p>
                                <p style={{ color: '#6c63ff', fontSize: '18px', margin: 0, fontWeight: 'bold' }}>
                                    {formatDateFrench(selectedDate)} à {selectedTime}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            marginTop: '25px'
                        }}>
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: cancelBg,
                                    border: borderColor,
                                    borderRadius: '12px',
                                    color: textSecondary,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s',
                                    opacity: isSubmitting ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSubmitting) e.target.style.background = cancelHoverBg;
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSubmitting) e.target.style.background = cancelBg;
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedDate || !selectedTime || isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: (!selectedDate || !selectedTime || isSubmitting)
                                        ? disabledBtn
                                        : 'linear-gradient(135deg, #6c63ff, #4834d4)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: (!selectedDate || !selectedTime || isSubmitting) ? 'not-allowed' : 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s',
                                    opacity: (!selectedDate || !selectedTime) ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedDate && selectedTime && !isSubmitting) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(108, 99, 255, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                {isSubmitting ? (
                                    <>{icons.spinner} Planification...</>
                                ) : (
                                    <>{icons.check} {mode === 'recruteur' ? "Planifier l'entretien" : 'Confirmer le créneau'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}

export default CalendrierEntretien;