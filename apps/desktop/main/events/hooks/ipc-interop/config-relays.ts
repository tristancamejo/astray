import { ipcMain as ipc } from 'electron';
import { container } from 'tsyringe';
import { Configuration } from '../../../config/Config';
import { Library } from '../../../radio/Library';

ipc.on('config:sources:refresh', async () => {
	const settings = await container.resolve(Configuration).getSettings();
	for (const source of settings.sources) {
		container.resolve(Library).parseFolder(source);
	}
});

ipc.on('config:fetch', async (event) => {
	const settings = await container.resolve(Configuration).getSettings();
	event.returnValue = settings;
});

ipc.on('config:save', (event, settings) => {
	container.resolve(Configuration).saveSettings(settings);
});
