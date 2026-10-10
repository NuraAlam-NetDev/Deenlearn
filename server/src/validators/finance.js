import { z } from 'zod';
import { objectId, paginationFields } from './common.js';

export const transactionsQuery = z.object({
  ...paginationFields(20, 100),
  status: z.enum(['pending', 'awaiting_approval', 'approved', 'rejected', 'failed', 'cancelled']).optional(),
  provider: z.enum(['sslcommerz', 'stripe']).optional(),
  currency: z.enum(['BDT', 'USD']).optional(),
  q: z.string().trim().max(100).optional(),
});

export const auditQuery = z.object({
  ...paginationFields(20, 100),
  actor: objectId.optional(),
  action: z.string().trim().max(100).optional(),
  from: z.string().trim().max(40).optional(),
  to: z.string().trim().max(40).optional(),
});
