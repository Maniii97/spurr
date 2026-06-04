import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const chatMessageSchema = z.object({
  message: z
    .string({ required_error: 'message is required' })
    .min(1, 'message cannot be empty'),
  sessionId: z.string().uuid('sessionId must be a valid UUID').optional(),
});

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      res.status(400).json({
        error: firstError?.message ?? 'Invalid request body',
      });
      return;
    }
    // Attach parsed data to req.body
    req.body = result.data;
    next();
  };
}
