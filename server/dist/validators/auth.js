"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = exports.reportSchema = exports.cameraSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    username: zod_1.z.string().min(3, 'Username requis (min 3 caractères)'),
    password: zod_1.z.string().min(6, 'Mot de passe requis (min 6 caractères)'),
    role: zod_1.z.enum(['USER', 'MODERATOR', 'ADMIN']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email invalide'),
    password: zod_1.z.string().min(1, 'Mot de passe requis'),
});
exports.cameraSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Nom requis'),
    description: zod_1.z.string().optional(),
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
    imageUrl: zod_1.z.string().url().optional(),
    streamUrl: zod_1.z.string().url('URL du flux requis'),
    source: zod_1.z.string().min(1, 'Source requise'),
    categoryId: zod_1.z.string().min(1, 'Catégorie requise'),
});
exports.reportSchema = zod_1.z.object({
    reason: zod_1.z.string().min(1, 'Raison requise'),
    cameraId: zod_1.z.string().min(1, 'ID caméra requis'),
});
exports.commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Commentaire requis'),
    cameraId: zod_1.z.string().min(1, 'ID caméra requis'),
});
//# sourceMappingURL=auth.js.map