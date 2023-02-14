import { z } from 'zod';

export const ConfigSpec = z.object({
	sources: z.array(z.string()),
	runServer: z.boolean().default(false),
});

export type ConfigSpec = z.infer<typeof ConfigSpec>;
