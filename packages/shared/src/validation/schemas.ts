import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  settings: z.record(z.any()).optional(),
});

export const testCaseSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['WEB', 'MOBILE', 'API', 'DESKTOP']),
  steps: z.array(z.any()),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});
