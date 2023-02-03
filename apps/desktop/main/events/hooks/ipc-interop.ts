import { dialog, ipcMain as ipc } from 'electron';
import { container } from 'tsyringe';
import { mainWindow } from '../../background';
import { Configuration } from '../../config/Config';
import { Library } from '../../radio/Library';
import { Radio } from '../../radio/Radio';
import { EventBus } from '../bus/EventBus';
container.resolve(EventBus).on('radio:play', (song) => {
	mainWindow.webContents.send('radio:play', song);
});

function sendStateTick() {
	mainWindow.webContents.send('radio:tick', container.resolve(Radio).getState());
}

container.resolve(EventBus).on('radio:tick', (state) => {
	mainWindow.webContents.send('radio:tick', state);
});

container.resolve(EventBus).on('radio:stop', () => {
	mainWindow.webContents.send('radio:stop');
});

container.resolve(EventBus).on('library:update', (songs) => {
	mainWindow.webContents.send(
		'library:update',
		songs.map((song) => song.toClient()),
	);
});

ipc.on('radio:seek', (event, seconds: number) => {
	container.resolve(Radio).seek(seconds);
	sendStateTick();
});

ipc.on('radio:playPause', () => {
	container.resolve(Radio).togglePlayPause();
	sendStateTick();
});

ipc.on('radio:next', () => {
	container.resolve(Radio).next();
	sendStateTick();
});

ipc.on('radio:play', (event, songId) => {
	container.resolve(Radio).play(songId);
	sendStateTick();
});

ipc.on('config:fetch', async (event) => {
	const settings = await container.resolve(Configuration).getSettings();
	event.returnValue = settings;
});

ipc.on('config:save', (event, settings) => {
	container.resolve(Configuration).saveSettings(settings);
});

ipc.on('library:fetch', async (event) => {
	const songs = Array.from(container.resolve(Library).songs.values());
	event.returnValue = songs.map((song) => song.toClient());
});

ipc.on('folder:select', async (event) => {
	const result = await dialog.showOpenDialog({
		properties: ['openDirectory'],
	});
	event.returnValue = result.filePaths[0] || '';
});
