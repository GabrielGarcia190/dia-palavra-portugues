import { z } from "zod";

export const WordOfTheDayResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        id: z.number(),
        date: z.string().datetime(),
        mode: z.string(),
        word: z.string(),
        words: z.string()
    }),
    message: z.string()
});

export type WordOfTheDay = z.infer<typeof WordOfTheDayResponseSchema>;