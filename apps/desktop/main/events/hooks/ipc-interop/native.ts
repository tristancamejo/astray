import { dialog, ipcMain as ipc, shell } from 'electron';

ipc.on('folder:select', async (event) => {
	const result = await dialog.showOpenDialog({
		properties: ['openDirectory'],
	});

	event.returnValue = result.filePaths[0] || '';
});

ipc.on('folder:open', async (event, path) => {
	shell.openPath(path);
});
