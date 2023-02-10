import { dialog, ipcMain as ipc } from 'electron';

ipc.on('folder:select', async (event) => {
	const result = await dialog.showOpenDialog({
		properties: ['openDirectory'],
	});

	event.returnValue = result.filePaths[0] || '';
});
