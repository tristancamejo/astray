import { z } from 'zod';

export const ConfigSpec = z.object({
	sources: z.array(z.string()),
});

export type ConfigSpec = z.infer<typeof ConfigSpec>;
