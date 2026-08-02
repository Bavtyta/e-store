import { z } from 'zod';

export const paginationSchema = z.strictObject({
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const apiErrorEnvelopeSchema = z.strictObject({
  error: z.strictObject({
    code: z.string(),
    details: z.unknown().nullable(),
    message: z.string(),
    requestId: z.string().nullable(),
  }),
});

export type ApiErrorEnvelope = z.infer<typeof apiErrorEnvelopeSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
