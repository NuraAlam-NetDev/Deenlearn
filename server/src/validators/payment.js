import { z } from 'zod';
import { objectId } from './common.js';

export const checkoutSchema = z.object({
  courseId: objectId,
  provider: z.enum(['sslcommerz', 'stripe']),
  // Needed for bKash / Nagad (SSLCommerz). Bangladeshi mobile number, e.g. 01712345678
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi mobile number')
    .optional(),
});
