import { ipcMain as ipc } from 'electron';
import { container } from 'tsyringe';
import { mainWindow } from '../../../background';
import { Radio } from '../../../radio/Radio';
import { EventBus } from '../../bus/EventBus';

function forceStateTick() {
	mainWindow.webContents.send('radio:tick', container.resolve(Radio).getState());
}

container.resolve(EventBus).on('radio:play', (song) => {
	mainWindow.webContents.send('radio:play', song);
});

container.resolve(EventBus).on('radio:tick', (state) => {
	mainWindow.webContents.send('radio:tick', state);
});

container.resolve(EventBus).on('radio:stop', () => {
	mainWindow.webContents.send('radio:stop');
});

ipc.on('radio:seek', (event, seconds: number) => {
	container.resolve(Radio).seek(seconds);
	forceStateTick();
});

ipc.on('radio:playPause', () => {
	container.resolve(Radio).togglePlayPause();
	forceStateTick();
});

ipc.on('radio:next', () => {
	container.resolve(Radio).next();
	forceStateTick();
});

ipc.on('radio:play', (event, songId) => {
	container.resolve(Radio).play(songId);
	forceStateTick();
});
