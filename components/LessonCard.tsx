
import React from 'react';
import { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  onClick: () => void;
  style: React.CSSProperties;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick, style }) => {
  const cardStyle = {
    ...style,
  };

  return (
    <div
      onClick={onClick}
      style={cardStyle}
      className="absolute z-10 p-2 m-1 overflow-hidden text-white bg-indigo-500 border border-indigo-700 rounded-lg shadow-lg cursor-pointer hover:bg-indigo-600"
    >
      <p className="text-sm font-bold truncate">{lesson.studentName}</p>
      <p className="text-xs truncate">{lesson.course}</p>
      <p className="text-xs truncate">Lesson #{lesson.lessonNumber}</p>
    </div>
  );
};

export default LessonCard;
