import { container } from 'tsyringe';
import { mainWindow } from '../../background';
import { Library } from '../../radio/Library';
import { EventBus } from '../bus/EventBus';

container.resolve(EventBus).on('start', async () => {
	mainWindow.setSize(1312, 806);
	await container.resolve(Library).load();
});
