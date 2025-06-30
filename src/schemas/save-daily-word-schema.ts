import { z } from "zod";

export const SaveDailyWordSchema = z.object({
  date: z.string().datetime(),
  mode: z.string().min(1),
  words: z.array(z.string().min(1)).min(1)
});

export type DailyWordInput = z.infer<typeof SaveDailyWordSchema>;