import { ipcMain as ipc } from 'electron';
import { container } from 'tsyringe';
import { Configuration } from '../../config/Config';
import { Library } from '../../radio/Library';
import { EventBus } from '../bus/EventBus';

container.resolve(EventBus).on('config:save', (oldSettings, newSettings) => {
	const oldSources = oldSettings.sources;
	const newSources = newSettings.sources;

	const addedSources = newSources.filter((source) => !oldSources.includes(source));
	const removedSources = oldSources.filter((source) => !newSources.includes(source));

	for (const source of addedSources) {
		container.resolve(EventBus).emit('config:sources:add', source);
	}

	for (const source of removedSources) {
		container.resolve(EventBus).emit('config:sources:remove', source);
	}
});

container.resolve(EventBus).on('config:sources:add', (source) => {
	container.resolve(Library).parseFolder(source);
});

ipc.on('config:sources:refresh', async () => {
	const settings = await container.resolve(Configuration).getSettings();
	for (const source of settings.sources) {
		container.resolve(Library).parseFolder(source);
	}
});
