
import { Lesson } from '../types';

export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getWeekDays = (startOfWeek: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const getLessonPosition = (lesson: Lesson) => {
    const startTime = new Date(lesson.startTime);
    const dayIndex = startTime.getDay() === 0 ? 6 : startTime.getDay() - 1; // Monday is 0
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    
    const top = startHour * 60 + startMinute;
    const height = lesson.durationMinutes;

    return {
        gridColumnStart: dayIndex + 2, // +1 for time column, +1 for 1-based index
        gridRowStart: 2, // Lessons are positioned absolutely within the day column
        top: `${(top / 60) * 4}rem`, // 4rem per hour
        height: `${(height / 60) * 4}rem`,
    };
};
