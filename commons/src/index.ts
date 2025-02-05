import z from "zod";

export const signupInput = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional()
})

export type SignupInput = z.infer<typeof signupInput>

export const signinInput = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    
})

export type SigninInput = z.infer<typeof signinInput>

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
})
export type CreateBlogInput = z.infer<typeof createBlogInput>

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.string()

})

export type UpdateBlogInput = z.infer<typeof updateBlogInput>