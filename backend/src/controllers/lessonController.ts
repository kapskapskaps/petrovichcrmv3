import * as express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Extend express.Request to include the user property from auth middleware.
// Using a namespace import `import * as express from 'express'` avoids conflicts with the global Request type.
interface AuthRequest extends express.Request {
  user?: { userId: string };
}

export const getLessons = async (req: AuthRequest, res: express.Response) => {
  const userId = req.user?.userId;
  const { start, end } = req.query;

  if (!userId) return res.status(401).json({ message: 'Не авторизован' });
  if (!start || !end) return res.status(400).json({ message: 'Необходимы даты начала и конца' });

  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        userId,
        startTime: {
          gte: new Date(start as string),
          lte: new Date(end as string),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при получении уроков' });
  }
};

export const createLesson = async (req: AuthRequest, res: express.Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Не авторизован' });

    const { frequency, ...lessonData } = req.body;
    const lessonFrequency = Number(frequency) || 1;
    
    try {
        if (lessonFrequency > 1) {
            // Create a series of lessons
            const seriesId = uuidv4();
            const lessonsToCreate: Prisma.LessonCreateManyInput[] = [];
            const initialStartTime = new Date(lessonData.startTime);

            for (let i = 0; i < 52; i++) { // Create for a year
                const lessonDate = new Date(initialStartTime.getTime() + i * (7 / lessonFrequency) * 24 * 60 * 60 * 1000);
                lessonsToCreate.push({
                    ...lessonData,
                    startTime: lessonDate,
                    userId,
                    seriesId,
                    frequency: lessonFrequency,
                    lessonNumber: lessonData.lessonNumber + i,
                });
            }
            await prisma.lesson.createMany({ data: lessonsToCreate });
             // Fetch and return the lessons for the current week to update UI
            const startOfWeek = new Date(initialStartTime);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);

            const createdLessons = await prisma.lesson.findMany({ where: { seriesId }})

            res.status(201).json(createdLessons);

        } else {
            // Create a single lesson
            const newLesson = await prisma.lesson.create({
                data: {
                    ...lessonData,
                    userId,
                    seriesId: uuidv4(),
                    frequency: 1,
                },
            });
            res.status(201).json([newLesson]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при создании урока' });
    }
};

export const updateLesson = async (req: AuthRequest, res: express.Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const lessonData = req.body;

  if (!userId) return res.status(401).json({ message: 'Не авторизован' });

  try {
    // Ensure the lesson belongs to the user
    const lesson = await prisma.lesson.findFirst({ where: { id, userId }});
    if (!lesson) {
        return res.status(404).json({ message: 'Урок не найден или у вас нет прав на его изменение' });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id },
      data: lessonData,
    });
    res.status(200).json(updatedLesson);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при обновлении урока' });
  }
};

export const deleteLesson = async (req: AuthRequest, res: express.Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const { series } = req.query;

  if (!userId) return res.status(401).json({ message: 'Не авторизован' });

  try {
    const lessonToDelete = await prisma.lesson.findFirst({ where: { id, userId } });
    if (!lessonToDelete) {
      return res.status(404).json({ message: 'Урок не найден' });
    }
    
    if (series === 'true' && lessonToDelete.seriesId) {
        // Delete all future lessons in the series
        await prisma.lesson.deleteMany({
            where: {
                userId,
                seriesId: lessonToDelete.seriesId,
                startTime: { gte: lessonToDelete.startTime }
            }
        });
    } else {
        // Delete a single lesson
        await prisma.lesson.delete({ where: { id } });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при удалении урока' });
  }
};

export const markLessonAsComplete = async (req: AuthRequest, res: express.Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Не авторизован' });

    try {
        const completedLesson = await prisma.lesson.updateMany({
            where: { id, userId },
            data: { completed: true },
        });

        if (completedLesson.count === 0) {
             return res.status(404).json({ message: 'Урок не найден или у вас нет прав' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при обновлении урока' });
    }
};
