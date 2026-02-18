
// This is a mock API using localStorage to simulate a real backend with a PostgreSQL database.
// In a real application, these functions would make HTTP requests to a server.

import { User, Lesson } from '../types';

const USERS_KEY = 'tutor_crm_users';
const LESSONS_KEY_PREFIX = 'tutor_crm_lessons_';
const LOGGED_IN_USER_KEY = 'tutor_crm_logged_in_user';

// Helper to get lessons key for a user
const getLessonsKey = (userId: string) => `${LESSONS_KEY_PREFIX}${userId}`;

// Helper to read from localStorage
const read = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Helper to write to localStorage
const write = (key: string, value: any) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
};

const simulateDelay = (ms: number = 500) => new Promise(res => setTimeout(res, ms));

export const api = {
  // --- AUTH ---
  async register(email: string, pass: string): Promise<User> {
    await simulateDelay();
    const users = read<User[]>(USERS_KEY, []);
    if (users.some(u => u.email === email)) {
      throw new Error('Пользователь с такой почтой уже существует.');
    }
    const newUser: User = { id: Date.now().toString(), email };
    // In a real app, the password would be hashed. We'll just store the user without it.
    users.push(newUser);
    write(USERS_KEY, users);
    write(LOGGED_IN_USER_KEY, newUser);
    return newUser;
  },

  async login(email: string, pass: string): Promise<User> {
    await simulateDelay();
    const users = read<User[]>(USERS_KEY, []);
    const user = users.find(u => u.email === email);
    // Password check would happen on the server. Here we just check if user exists.
    if (!user) {
      throw new Error('Неверная почта или пароль.');
    }
    write(LOGGED_IN_USER_KEY, user);
    return user;
  },

  logout() {
    window.localStorage.removeItem(LOGGED_IN_USER_KEY);
  },

  getCurrentUser(): User | null {
    return read<User | null>(LOGGED_IN_USER_KEY, null);
  },

  // --- LESSONS ---
  async createLesson(userId: string, lessonData: Omit<Lesson, 'id' | 'seriesId'>): Promise<Lesson[]> {
    await simulateDelay();
    const lessons = read<Lesson[]>(getLessonsKey(userId), []);
    const createdLessons: Lesson[] = [];
    const seriesId = Date.now().toString();

    for (let i = 0; i < (lessonData.frequency || 1); i++) {
        const lessonDate = new Date(lessonData.startTime);
        lessonDate.setDate(lessonDate.getDate() + (i * 7 / (lessonData.frequency || 1)));

        const newLesson: Lesson = {
            ...lessonData,
            id: `${seriesId}-${i}`,
            seriesId,
            startTime: lessonDate.toISOString(),
        };
        lessons.push(newLesson);
        createdLessons.push(newLesson);
    }
    
    write(getLessonsKey(userId), lessons);
    return createdLessons;
  },

  async getLessons(userId: string, start: Date, end: Date): Promise<Lesson[]> {
    await simulateDelay();
    const allLessons = read<Lesson[]>(getLessonsKey(userId), []);
    const endDateWithTime = new Date(end);
    endDateWithTime.setHours(23, 59, 59, 999); // Set to end of the day

    return allLessons.filter(lesson => {
      const lessonDate = new Date(lesson.startTime);
      return lessonDate >= start && lessonDate <= endDateWithTime;
    });
  },

  async updateLesson(userId: string, updatedLesson: Lesson): Promise<Lesson> {
    await simulateDelay();
    const lessons = read<Lesson[]>(getLessonsKey(userId), []);
    const index = lessons.findIndex(l => l.id === updatedLesson.id);
    if (index === -1) {
      throw new Error('Урок не найден.');
    }
    lessons[index] = updatedLesson;
    write(getLessonsKey(userId), lessons);
    return updatedLesson;
  },

  async deleteLesson(userId: string, lessonId: string, deleteAllInSeries: boolean): Promise<void> {
    await simulateDelay();
    let lessons = read<Lesson[]>(getLessonsKey(userId), []);
    const lessonToDelete = lessons.find(l => l.id === lessonId);
    if (!lessonToDelete) return;

    if (deleteAllInSeries) {
      lessons = lessons.filter(l => l.seriesId !== lessonToDelete.seriesId);
    } else {
      lessons = lessons.filter(l => l.id !== lessonId);
    }
    write(getLessonsKey(userId), lessons);
  },

  async markLessonAsComplete(userId: string, lessonId: string): Promise<void> {
    await simulateDelay();
    let lessons = read<Lesson[]>(getLessonsKey(userId), []);
    const completedLesson = lessons.find(l => l.id === lessonId);
    if (!completedLesson) return;

    // Mark current lesson as complete
    completedLesson.completed = true;

    // Increment lesson number for all future lessons in the series
    lessons = lessons.map(l => {
        if (l.seriesId === completedLesson.seriesId && new Date(l.startTime) > new Date(completedLesson.startTime)) {
            return { ...l, lessonNumber: l.lessonNumber + 1 };
        }
        if (l.id === lessonId) {
            return completedLesson;
        }
        return l;
    });

    write(getLessonsKey(userId), lessons);
  }
};