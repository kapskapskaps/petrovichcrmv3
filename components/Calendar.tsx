
import React from 'react';
import { Lesson } from '../types';
import { getWeekDays, formatTime, getLessonPosition } from '../utils/dateUtils';
import LessonCard from './LessonCard';

interface CalendarProps {
  startOfWeek: Date;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onSelectSlot: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ startOfWeek, lessons, onSelectLesson, onSelectSlot }) => {
  const weekDays = getWeekDays(startOfWeek);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="relative grid grid-cols-[auto_repeat(7,1fr)] grid-rows-[auto_repeat(24,4rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Time column header */}
      <div className="sticky top-0 z-10 p-2 text-xs text-center text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-r border-b dark:border-gray-600"></div>

      {/* Day headers */}
      {weekDays.map((day, index) => (
        <div key={index} className="sticky top-0 z-10 p-2 text-center bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <div className="text-sm font-medium text-gray-700 capitalize dark:text-gray-300">{day.toLocaleString('ru-RU', { weekday: 'short' })}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{day.getDate()}</div>
        </div>
      ))}
      
      {/* Time column */}
      <div className="col-start-1 col-end-2 row-start-2 row-end-[-1] border-r dark:border-gray-600">
        {hours.map(hour => (
          <div key={hour} className="relative flex justify-center h-16 -mt-px text-xs text-gray-400 dark:text-gray-500">
            <span className="absolute -top-2">{`${hour.toString().padStart(2, '0')}:00`}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid col-start-2 col-end-[-1] grid-cols-7 grid-rows-1 row-start-2 row-end-[-1] bg-gray-200 dark:bg-gray-700/50" style={{ gridTemplateRows: 'repeat(24, 4rem)'}}>
         {hours.map(hour => (
             weekDays.map((day, dayIndex) => {
                 const slotDate = new Date(day);
                 slotDate.setHours(hour, 0, 0, 0);

                 return (
                    <div 
                        key={`${dayIndex}-${hour}`}
                        className="relative border-t border-r border-gray-200 dark:border-gray-600 group"
                        style={{ gridColumn: dayIndex + 1, gridRow: hour + 1}}
                        onDoubleClick={() => onSelectSlot(slotDate)}
                    >
                         <button 
                            onClick={() => onSelectSlot(slotDate)} 
                            className="absolute inset-0 z-10 flex items-center justify-center text-2xl text-indigo-400 transition-opacity opacity-0 group-hover:opacity-100"
                            aria-label={`Добавить урок на ${slotDate.toLocaleString('ru-RU')}`}
                        >
                            +
                        </button>
                    </div>
                 );
             })
         ))}

         {/* Render Lessons */}
         {lessons.map(lesson => (
            <LessonCard 
                key={lesson.id}
                lesson={lesson}
                onClick={() => onSelectLesson(lesson)}
                style={getLessonPosition(lesson)}
            />
         ))}
      </div>
    </div>
  );
};

export default Calendar;