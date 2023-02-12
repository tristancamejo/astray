import 'reflect-metadata';
import { container } from 'tsyringe';

import { createServer } from '@astray/server';
import { app, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createServerLibraryAdapter } from './adapters/library-adapter';
import { Configuration } from './config/Config';
import { EventBus } from './events/bus/EventBus';
import { createWindow } from './helpers';
import { Library } from './radio/Library';
import { Radio } from './radio/Radio';
export let mainWindow: BrowserWindow;
const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
	serve({ directory: 'app' });
} else {
	app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
	await app.whenReady();

	container.register<EventBus>(EventBus, { useValue: new EventBus() });
	container.register<Configuration>(Configuration, { useValue: new Configuration(container.resolve(EventBus)) });
	await import('./events/hooks/_load');
	container.register<Library>(Library, { useValue: new Library(container.resolve(EventBus)) });
	container.register<Radio>(Radio, { useValue: new Radio(container.resolve(EventBus), container.resolve(Library)) });

	mainWindow = createWindow('main', {
		width: 1312,
		height: 806,
		resizable: false,
		frame: false,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: true,
		},
	});

	createServer({
		library: createServerLibraryAdapter(container.resolve(Library)),
	});

	if (isProd) {
		await mainWindow.loadURL('app://./index.html');
	} else {
		const port = process.argv[2];
		await mainWindow.loadURL(`http://localhost:${port}/`);
	}

	container.resolve(EventBus).emit('start');
})();
