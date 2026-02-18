
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Lesson } from '../types';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface LessonModalProps {
  lesson: Lesson | null;
  initialDate?: Date | null;
  onClose: () => void;
}

const cleanPhoneNumber = (phone: string) => phone.replace(/\D/g, '');

const TelegramIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#29b6f6" d="M24 4c-11.05 0-20 8.95-20 20s8.95 20 20 20 20-8.95 20-20-8.95-20-20-20z"></path>
        <path fill="#fff" d="M34 17l-13.7 5.8-3.3 10.3c-.4 1.2.5 2.4 1.8 2.4.8 0 1.5-.4 1.9-1.2l3.2-8.3 8.1-6.8c.7-.6.7-1.7 0-2.2-.7-.5-1.7-.5-2.3 0l-10.3 8.6-1.6.8c-.3.2-.6.2-.9 0-.3-.2-.5-.5-.4-.8l2.2-12.7c.2-1 .9-1.7 1.9-1.7h11.2c1.1 0 2 .9 2 2-.1.6-.4 1.1-.9 1.4z"></path>
    </svg>
);


const LessonModal: React.FC<LessonModalProps> = ({ lesson, initialDate, onClose }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(!lesson);
  const [formData, setFormData] = useState<Partial<Lesson>>({
    studentName: '',
    parentName: '',
    studentContact: '',
    parentContact: '',
    lessonNumber: 1,
    course: '',
    startTime: initialDate ? initialDate.toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16),
    durationMinutes: 60,
    frequency: 1,
    description: '',
    completed: false,
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        ...lesson,
        startTime: new Date(lesson.startTime).toISOString().substring(0, 16),
      });
      setIsEditing(false);
    }
  }, [lesson]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number' || e.target.nodeName === 'SELECT';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) : value }));
  };
  
  const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, startTime: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const lessonData: Omit<Lesson, 'id' | 'seriesId'> & { id?: string; seriesId?: string } = {
        ...formData,
        startTime: new Date(formData.startTime!).toISOString(),
        studentName: formData.studentName!,
        parentName: formData.parentName!,
        studentContact: formData.studentContact!,
        parentContact: formData.parentContact!,
        lessonNumber: formData.lessonNumber!,
        course: formData.course!,
        durationMinutes: formData.durationMinutes!,
        frequency: formData.frequency!,
        completed: formData.completed!,
    };
    
    try {
        if (lesson) {
            await api.updateLesson(user.id, { ...lessonData, id: lesson.id, seriesId: lesson.seriesId });
        } else {
            await api.createLesson(user.id, lessonData);
        }
        onClose();
    } catch (error) {
        console.error("Failed to save lesson", error);
    }
  };

  const handleDelete = async (deleteAll: boolean) => {
    if (!lesson || !user) return;
    if (window.confirm(`Are you sure you want to delete ${deleteAll ? 'all lessons in this series' : 'this lesson'}?`)) {
        await api.deleteLesson(user.id, lesson.id, deleteAll);
        onClose();
    }
  };

  const handleMarkAsComplete = async () => {
    if (!lesson || !user) return;
    await api.markLessonAsComplete(user.id, lesson.id);
    onClose();
  };

  const renderField = (label: string, name: keyof Lesson, type: string = "text", required: boolean = true) => (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {type === 'textarea' ? (
        <textarea
            name={name}
            value={(formData[name] as string) || ''}
            onChange={handleChange}
            readOnly={!isEditing}
            className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
            rows={3}
        />
      ) : (
        <input
            type={type}
            name={name}
            value={formData[name] as any}
            onChange={handleChange}
            required={required}
            readOnly={!isEditing}
            className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700"
            disabled={!isEditing}
        />
      )}
    </div>
  );

  const renderContactField = (label: string, name: keyof Lesson) => (
    <div>
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="flex items-center space-x-2">
            <input
                type="text"
                name={name}
                value={(formData[name] as string) || ''}
                onChange={handleChange}
                required
                readOnly={!isEditing}
                className="flex-grow p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
            />
            <a 
                href={`https://t.me/+${cleanPhoneNumber((formData[name] as string) || '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className={(formData[name] ? 'opacity-100' : 'opacity-50 pointer-events-none')}
            >
                <TelegramIcon />
            </a>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b dark:border-gray-600">
          <h2 className="text-2xl font-bold">{lesson ? 'Lesson Details' : 'Create Lesson'}</h2>
          {lesson && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Edit</button>
          )}
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderField('Student Name', 'studentName')}
            {renderField('Parent Name', 'parentName')}
            {renderContactField('Student Contact', 'studentContact')}
            {renderContactField('Parent Contact', 'parentContact')}
            {renderField('Course', 'course')}
            {renderField('Lesson Number', 'lessonNumber', 'number')}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Date and Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleDateTimeChange}
                required
                readOnly={!isEditing}
                className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
              <select
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 disabled:bg-gray-200 dark:disabled:bg-gray-700"
              >
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
            {!lesson && (
              <div>
                <label className="block mb-1 text-sm font-medium">Frequency (per week)</label>
                <input
                  type="number"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500"
                  disabled={!isEditing}
                />
              </div>
            )}
            <div className="md:col-span-2">
                {renderField('Description (Notes)', 'description', 'textarea')}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between pt-4 mt-4 border-t dark:border-gray-600">
            {lesson && (
              <div className="flex space-x-2">
                <button type="button" onClick={handleMarkAsComplete} className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Mark as Complete</button>
                <button type="button" onClick={() => handleDelete(false)} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete Lesson</button>
                {lesson.frequency > 1 && <button type="button" onClick={() => handleDelete(true)} className="px-4 py-2 text-white bg-red-800 rounded-md hover:bg-red-900">Delete Series</button>}
              </div>
            )}
            {isEditing && (
              <div className="flex ml-auto space-x-2">
                <button type="button" onClick={lesson ? () => setIsEditing(false) : onClose} className="px-4 py-2 bg-gray-300 rounded-md dark:bg-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save</button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonModal;
