import { z } from 'zod';
import { ConfigSpec } from './_spec';

export const DefaultConfig: z.infer<typeof ConfigSpec> = {
	sources: [],
	runServer: false,
};
