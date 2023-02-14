import { createServer } from '@astray/server';
import { container } from 'tsyringe';
import { createServerLibraryAdapter } from '../../adapters/library-adapter';
import { EventBus } from '../bus/EventBus';

container.resolve(EventBus).on('config:save', (oldSettings, newSettings) => {
	if (oldSettings.runServer === newSettings.runServer) return;

	if (newSettings.runServer) {
		const existing = container.resolve<() => void>('killServerFunc');

		if (existing) return;

		existing();

		const newS = createServer({
			library: createServerLibraryAdapter(),
		});

		container.register('killServerFunc', {
			useValue: newS,
		});
	} else {
		const existing = container.resolve<() => void>('killServerFunc');

		if (!existing) return;

		existing();

		container.register('killServerFunc', {
			useValue: undefined,
		});
	}
});
