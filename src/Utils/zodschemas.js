import z  from 'zod';

export const checkMobileExistsSchema = z.object({
    mobile: z.string().regex(/^[1-9]\d{9}$/, "Invalid mobile number").min(10, "Mobile number must be at least 10 digits").max(10, "Mobile number must be at most 10 digits"),
});

export const signupSchema = z.object({
    mobile: z.string().regex(/^[1-9]\d{9}$/, "Invalid mobile number").min(10, "Mobile number must be at least 10 digits").max(10, "Mobile number must be at most 10 digits"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    source: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
});