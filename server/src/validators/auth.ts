import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z.string().min(3, 'Username requis (min 3 caractères)'),
  password: z.string().min(6, 'Mot de passe requis (min 6 caractères)'),
});

export const roleSchema = z.enum(['USER', 'MODERATOR', 'ADMIN']);

export const cameraStatusSchema = z.enum(['ACTIVE', 'OFFLINE', 'PENDING', 'REPORTED']);

export const reportStatusSchema = z.enum(['PENDING', 'RESOLVED', 'DISMISSED']);

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const cameraSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  imageUrl: z.string().url().optional(),
  streamUrl: z.string().url('URL du flux requis'),
  source: z.string().min(1, 'Source requise'),
  categoryId: z.string().min(1, 'Catégorie requise'),
});

export const reportSchema = z.object({
  reason: z.string().min(1, 'Raison requise'),
  cameraId: z.string().min(1, 'ID caméra requis'),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Commentaire requis'),
  cameraId: z.string().min(1, 'ID caméra requis'),
});