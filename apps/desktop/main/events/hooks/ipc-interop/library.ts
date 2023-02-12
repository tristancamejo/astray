import { ipcMain as ipc } from 'electron';
import { container } from 'tsyringe';
import { mainWindow } from '../../../background';
import { Library } from '../../../radio/Library';
import { EventBus } from '../../bus/EventBus';

container.resolve(EventBus).on('library:update', (songs) => {
	mainWindow.webContents.send(
		'library:update',
		songs.map((song) => song.serialize()),
	);
});

ipc.on('library:fetch', async (event) => {
	const songs = Array.from(container.resolve(Library).songs.values());
	event.returnValue = songs.map((song) => song.serialize());
});
