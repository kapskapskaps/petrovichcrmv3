
import React from 'react';
import { Lesson } from '../types';
import { getWeekDays, getLessonPosition } from '../utils/dateUtils';
import LessonCard from './LessonCard';

interface CalendarProps {
  startOfWeek: Date;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onSelectSlot: (date: Date) => void;
}

const START_HOUR = 8;
const END_HOUR = 22; // Отображать слоты до 22:00 (т.е. последний слот 21:00-22:00)

const Calendar: React.FC<CalendarProps> = ({ startOfWeek, lessons, onSelectLesson, onSelectSlot }) => {
  const weekDays = getWeekDays(startOfWeek);
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
  const totalHours = hours.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);


  // Фильтруем уроки, чтобы показывать только те, что в рабочем диапазоне
  const visibleLessons = lessons.filter(lesson => {
    const lessonHour = new Date(lesson.startTime).getHours();
    return lessonHour >= START_HOUR && lessonHour < END_HOUR;
  });

  return (
    <div className={`relative grid bg-white dark:bg-gray-800 rounded-lg shadow-md grid-cols-[auto,repeat(7,1fr)] grid-rows-[auto,repeat(${totalHours},4rem)]`}>
      {/* Заголовок колонки времени */}
      <div className="sticky top-0 z-10 p-2 text-xs text-center text-gray-500 bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-r border-b dark:border-gray-600"></div>

      {/* Заголовки дней */}
      {weekDays.map((day, index) => {
        const isToday = day.toDateString() === new Date().toDateString();
        return (
            <div key={index} className="sticky top-0 z-10 p-2 text-center bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <div className="text-sm font-medium text-gray-700 capitalize dark:text-gray-300">{day.toLocaleString('ru-RU', { weekday: 'short' })}</div>
              <div className={`mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold ${isToday ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-white'}`}>
                {day.getDate()}
              </div>
            </div>
        )
      })}
      
      {/* Колонка времени */}
      <div className="col-start-1 col-end-2 row-start-2 row-end-[-1] border-r dark:border-gray-600">
        {hours.map(hour => (
          <div key={hour} className="relative flex items-start justify-center h-16 text-xs text-gray-400 dark:text-gray-500">
            <span className="-translate-y-1/2">{`${hour.toString().padStart(2, '0')}:00`}</span>
          </div>
        ))}
      </div>

      {/* Сетка календаря */}
      <div className="grid col-start-2 col-end-[-1] grid-cols-7 grid-rows-1 row-start-2 row-end-[-1] bg-gray-200 dark:bg-gray-700/50" style={{ gridTemplateRows: `repeat(${totalHours}, 4rem)`}}>
         {hours.map((hour, hourIndex) => (
             weekDays.map((day, dayIndex) => {
                 const slotDate = new Date(day);
                 slotDate.setHours(hour, 0, 0, 0);

                 return (
                    <div 
                        key={`${dayIndex}-${hour}`}
                        className="relative border-t border-r border-gray-200 dark:border-gray-600 group"
                        style={{ gridColumn: dayIndex + 1, gridRow: hourIndex + 1}}
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

         {/* Отображение уроков */}
         {visibleLessons.map(lesson => (
            <LessonCard 
                key={lesson.id}
                lesson={lesson}
                onClick={() => onSelectLesson(lesson)}
                style={getLessonPosition(lesson, START_HOUR)}
            />
         ))}
      </div>
    </div>
  );
};

export default Calendar;
