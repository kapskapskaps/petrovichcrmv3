
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Calendar from '../components/Calendar';
import LessonModal from '../components/LessonModal';
import { Lesson } from '../types';
import { api } from '../services/api';
import { getStartOfWeek, addDays } from '../utils/dateUtils';

const CalendarPage: React.FC = () => {
  const { logout, user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const startOfWeek = getStartOfWeek(currentDate);
  const endOfWeek = addDays(startOfWeek, 6);

  const fetchLessons = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const fetchedLessons = await api.getLessons(user.id, startOfWeek, endOfWeek);
    setLessons(fetchedLessons);
    setLoading(false);
  }, [user, startOfWeek, endOfWeek]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handlePrevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleOpenModal = (lesson?: Lesson, date?: Date) => {
    setSelectedLesson(lesson || null);
    setModalInitialDate(date || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLesson(null);
    setModalInitialDate(null);
    fetchLessons(); // Refresh lessons after modal closes
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tutor CRM</h1>
          <div className="flex items-center space-x-2">
            <button onClick={handlePrevWeek} className="px-3 py-1 bg-white border rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600">&lt;</button>
            <button onClick={handleNextWeek} className="px-3 py-1 bg-white border rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600">&gt;</button>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {startOfWeek.toLocaleDateString()} - {endOfWeek.toLocaleDateString()}
          </h2>
        </div>
        <button onClick={logout} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Logout
        </button>
      </header>
      
      <main className="flex-1 overflow-auto">
        {loading ? (
            <div className="flex items-center justify-center h-full">
                <p>Loading...</p>
            </div>
        ) : (
            <Calendar 
                startOfWeek={startOfWeek} 
                lessons={lessons} 
                onSelectLesson={(lesson) => handleOpenModal(lesson)}
                onSelectSlot={(date) => handleOpenModal(undefined, date)}
            />
        )}
      </main>

      <button
        onClick={() => handleOpenModal()}
        className="fixed z-20 flex items-center justify-center w-16 h-16 text-3xl text-white bg-indigo-600 rounded-full shadow-lg bottom-10 right-10 hover:bg-indigo-700 focus:outline-none"
      >
        +
      </button>

      {isModalOpen && (
        <LessonModal
          lesson={selectedLesson}
          initialDate={modalInitialDate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CalendarPage;
