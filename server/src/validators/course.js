import { z } from 'zod';
import { optionalUrl, atLeastOneField } from './common.js';

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title is too short').max(150),
  description: z.string().trim().max(5000).default(''),
  category: z.string().trim().toLowerCase().min(1).max(50).default('general'),
  thumbnail: optionalUrl.default(''),
  published: z.boolean().default(false),
});

export const updateCourseSchema = createCourseSchema.partial().refine(...atLeastOneField);

export const listCoursesQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().trim().toLowerCase().max(50).optional(),
  q: z.string().trim().max(100).optional(),
});
