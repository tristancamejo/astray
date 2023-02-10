import { ipcMain as ipc } from 'electron';
import { mainWindow } from '../../../background';

ipc.on('minimize-window', () => {
	mainWindow.minimize();
});
