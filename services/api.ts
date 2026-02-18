
// This file is now configured to work with a real backend API.
// The localStorage logic has been replaced with fetch requests.

import { User, Lesson } from '../types';

const API_BASE_URL = '/api'; // Using a relative URL, assumes proxy setup in dev or same host in prod

// A helper for making authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  });

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // Try to parse the error message from the backend
    const errorData = await response.json().catch(() => ({ message: 'Произошла непредвиденная ошибка.' }));
    throw new Error(errorData.message || `Ошибка: ${response.status} ${response.statusText}`);
  }
  
  if (response.status === 204) { // No Content
    return;
  }

  return response.json();
};


export const api = {
  // --- AUTH ---
  async register(email: string, pass: string): Promise<User> {
    const { user, token } = await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    if (!user || !token) throw new Error('Некорректный ответ от сервера при регистрации.');
    localStorage.setItem('authToken', token);
    localStorage.setItem('tutor_crm_logged_in_user', JSON.stringify(user));
    return user;
  },

  async login(email: string, pass: string): Promise<User> {
    const { user, token } = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
    });
    if (!user || !token) throw new Error('Некорректный ответ от сервера при входе.');
    localStorage.setItem('authToken', token);
    localStorage.setItem('tutor_crm_logged_in_user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tutor_crm_logged_in_user');
    // Optional: Inform the backend about logout
    // fetchWithAuth(`${API_BASE_URL}/auth/logout`, { method: 'POST' }).catch(console.error);
  },

  getCurrentUser(): User | null {
    try {
        const userJson = localStorage.getItem('tutor_crm_logged_in_user');
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        console.warn("Could not parse user from localStorage", e);
        return null;
    }
  },

  // --- LESSONS ---
  // Note: userId parameters are kept for compatibility with existing components, 
  // but the backend should identify the user via the auth token.
  async createLesson(userId: string, lessonData: Omit<Lesson, 'id' | 'seriesId'>): Promise<Lesson[]> {
    return fetchWithAuth(`${API_BASE_URL}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonData)
    });
  },

  async getLessons(userId: string, start: Date, end: Date): Promise<Lesson[]> {
    const params = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
    });
    return fetchWithAuth(`${API_BASE_URL}/lessons?${params.toString()}`);
  },

  async updateLesson(userId: string, updatedLesson: Lesson): Promise<Lesson> {
    return fetchWithAuth(`${API_BASE_URL}/lessons/${updatedLesson.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedLesson)
    });
  },

  async deleteLesson(userId: string, lessonId: string, deleteAllInSeries: boolean): Promise<void> {
     const params = new URLSearchParams({
        series: String(deleteAllInSeries),
    });
    await fetchWithAuth(`${API_BASE_URL}/lessons/${lessonId}?${params.toString()}`, {
        method: 'DELETE'
    });
  },

  async markLessonAsComplete(userId: string, lessonId: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/lessons/${lessonId}/complete`, {
        method: 'POST'
    });
  }
};
