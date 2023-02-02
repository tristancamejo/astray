import { container } from 'tsyringe';
import { mainWindow } from '../../background';
import { Library } from '../../radio/Library';
import { Radio } from '../../radio/Radio';
import { Song } from '../../radio/Song';
import { EventBus } from '../bus/EventBus';

container.resolve(EventBus).on('start', async () => {
	mainWindow.setSize(1312, 806);

	await container.resolve(Library).parseFolder('/Users/tristan/Music/Songs');

	const songs: Song[] = Array.from(container.resolve(Library).songs.values());

	const randomSong = songs[Math.floor(Math.random() * songs.length)];

	container.resolve(Radio).play(randomSong.id);
});
