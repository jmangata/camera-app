import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<["USER", "MODERATOR", "ADMIN"]>>;
}, "strip", z.ZodTypeAny, {
    email?: string;
    username?: string;
    password?: string;
    role?: "USER" | "MODERATOR" | "ADMIN";
}, {
    email?: string;
    username?: string;
    password?: string;
    role?: "USER" | "MODERATOR" | "ADMIN";
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
}, {
    email?: string;
    password?: string;
}>;
export declare const cameraSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
    imageUrl: z.ZodOptional<z.ZodString>;
    streamUrl: z.ZodString;
    source: z.ZodString;
    categoryId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
    streamUrl?: string;
    source?: string;
    categoryId?: string;
}, {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
    streamUrl?: string;
    source?: string;
    categoryId?: string;
}>;
export declare const reportSchema: z.ZodObject<{
    reason: z.ZodString;
    cameraId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason?: string;
    cameraId?: string;
}, {
    reason?: string;
    cameraId?: string;
}>;
export declare const commentSchema: z.ZodObject<{
    content: z.ZodString;
    cameraId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cameraId?: string;
    content?: string;
}, {
    cameraId?: string;
    content?: string;
}>;
//# sourceMappingURL=auth.d.ts.map