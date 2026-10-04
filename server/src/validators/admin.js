import { z } from 'zod';
import { objectId, paginationFields } from './common.js';

export const listUsersQuery = z.object({
  ...paginationFields(20, 100),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
  status: z.enum(['active', 'banned']).optional(),
  approval: z.enum(['pending', 'approved', 'rejected']).optional(),
  q: z.string().trim().max(100).optional(),
});

export const banUserSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const rejectTeacherSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const adminListCoursesQuery = z.object({
  ...paginationFields(20, 100),
  published: z.enum(['true', 'false']).optional(),
  teacher: objectId.optional(),
  q: z.string().trim().max(100).optional(),
});
