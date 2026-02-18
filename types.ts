
export interface User {
  id: string;
  email: string;
}

export interface Lesson {
  id: string;
  seriesId: string;
  studentName: string;
  parentName: string;
  studentContact: string;
  parentContact: string;
  lessonNumber: number;
  course: string;
  startTime: string; // ISO 8601 format
  durationMinutes: number;
  description?: string; // Teacher's notes for a specific lesson
  frequency: number;
  completed: boolean;
}
