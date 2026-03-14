'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Bell, BellOff, Trash2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
    id: string;
    title: string;
    date: string; // ISO string
    active: boolean;
}

interface CalendarProps {
    userId: string;
}

const Calendar = ({ userId }: CalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const storageKey = `student_calendar_events_${userId}`;

    // Load events from localStorage on mount or when userId changes
    useEffect(() => {
        const savedEvents = localStorage.getItem(storageKey);
        if (savedEvents) {
            try {
                setEvents(JSON.parse(savedEvents));
            } catch (e) {
                console.error('Failed to parse events', e);
            }
        } else {
            setEvents([]); // Reset if no events for this user
        }
        setIsLoaded(true);
    }, [storageKey]);

    // Save events to localStorage whenever they change, but ONLY after initial load
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(storageKey, JSON.stringify(events));
        }
    }, [events, storageKey, isLoaded]);

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                        <CalendarIcon size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                    </h2>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-4 py-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium text-purple-600 dark:text-purple-400"
                    >
                        Aujourd'hui
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map((day, index) => (
                    <div key={index} className="text-center text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const dayEvents = events.filter(e => isSameDay(parseISO(e.date), cloneDay));
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[120px] p-2 border border-purple-50 dark:border-gray-700 transition-all cursor-pointer relative
              ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/20 text-gray-300 dark:text-gray-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
              ${isToday ? 'ring-2 ring-inset ring-purple-500 ring-opacity-50' : ''}
              hover:bg-purple-50/50 dark:hover:bg-purple-900/10
            `}
                        onClick={() => {
                            setSelectedDate(cloneDay);
                            setIsModalOpen(true);
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`text-sm font-medium ${isToday ? 'bg-purple-600 text-white w-7 h-7 flex items-center justify-center rounded-full -mt-1 -ml-1' : ''}`}>
                                {formattedDate}
                            </span>
                            {dayEvents.length > 0 && (
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                        </div>

                        <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                            {dayEvents.slice(0, 3).map(event => (
                                <div
                                    key={event.id}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border truncate
                    ${event.active
                                            ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 line-through'}
                  `}
                                >
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="text-[10px] text-gray-400 text-center font-medium">
                                    +{dayEvents.length - 3} de plus
                                </div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return <div className="rounded-2xl overflow-hidden border border-purple-100 dark:border-gray-700 shadow-sm">{rows}</div>;
    };

    const addEvent = () => {
        if (!newEventTitle.trim()) return;

        const newEvent: Event = {
            id: Math.random().toString(36).substr(2, 9),
            title: newEventTitle,
            date: selectedDate.toISOString(),
            active: true
        };

        setEvents([...events, newEvent]);
        setNewEventTitle('');
        // We stay in modal to see existing events
    };

    const toggleEvent = (id: string) => {
        setEvents(events.map(e => e.id === id ? { ...e, active: !e.active } : e));
    };

    const deleteEvent = (id: string) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const selectedDayEvents = events.filter(e => isSameDay(parseISO(e.date), selectedDate));

    return (
        <div className="w-full">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            {/* Modal for adding/viewing events */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-purple-100 dark:border-gray-700 translate-y-0 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                        {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Gérer vos événements</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Add event form */}
                            <div className="flex gap-2 mb-8">
                                <input
                                    type="text"
                                    placeholder="Nouvel événement..."
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                                    className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 dark:text-white"
                                />
                                <button
                                    onClick={addEvent}
                                    className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-purple-200 dark:shadow-none"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {/* Events list */}
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedDayEvents.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 dark:text-gray-500 text-sm italic">Aucun événement pour ce jour.</p>
                                    </div>
                                ) : (
                                    selectedDayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all
                        ${event.active
                                                    ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/50'
                                                    : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'}
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleEvent(event.id)}
                                                    className={`transition-colors ${event.active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}
                                                    title={event.active ? "Désactiver" : "Activer"}
                                                >
                                                    {event.active ? <Bell size={18} /> : <BellOff size={18} />}
                                                </button>
                                                <span className={`text-sm font-medium ${event.active ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 line-through'}`}>
                                                    {event.title}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => deleteEvent(event.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e9d5ff;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    );
};

export default Calendar;
