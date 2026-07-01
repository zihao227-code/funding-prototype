import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, '课程名称不能为空').max(100),
  description: z.string().max(5000).optional(),
  type: z.enum(['online', 'offline', 'hybrid']).default('offline'),
  basePrice: z.number().int().min(0, '价格不能为负').default(0),
  category: z.string().max(50).optional(),
  coverImageUrl: z.string().url().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createScheduleSchema = z.object({
  title: z.string().min(1, '班次名称不能为空').max(100),
  startTime: z.string().min(1, '开始时间不能为空'),
  endTime: z.string().min(1, '结束时间不能为空'),
  capacity: z.number().int().min(1).max(999).default(20),
  registrationDeadline: z.string().datetime().optional(),
  price: z.number().int().min(0).optional().nullable(),
  meetingLink: z.string().url().optional().nullable(),
  classroomId: z.string().optional().nullable(),
  trainerId: z.string().optional().nullable(),
});

export const updateScheduleSchema = z.object({
  title: z.string().min(1, '班次名称不能为空').max(100).optional(),
  startTime: z.string().min(1, '开始时间不能为空').optional(),
  endTime: z.string().min(1, '结束时间不能为空').optional(),
  capacity: z.number().int().min(1).max(999).optional(),
  registrationDeadline: z.string().datetime().optional(),
  price: z.number().int().min(0).optional().nullable(),
  meetingLink: z.string().url().optional().nullable(),
  classroomId: z.string().optional().nullable(),
  trainerId: z.string().optional().nullable(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
