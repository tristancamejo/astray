// @ts-check

import { Song } from '@astray/swrapper';
import * as fs from 'node:fs';
import { WebSocket } from 'ws';

const ws = new WebSocket('ws://localhost:9999');
const printStage = (stage) => console.log(`--- ${stage} ---`);

ws.on('open', () => {
	printStage('get library');
	console.log('connected - sending getSongs');
	ws.send('getSongs');
});

ws.on('message', async (data, isBin) => {
	if (isBin) {
		printStage('unpack song');

		const song = await Song.unpackage(data.toString());

		console.log(`got song ${song.metadata.title}`);
		fs.writeFileSync(`./${song.metadata.title}.mp3`, song.buffer);

		console.log('done');

		process.exit(0);
	}

	const s = data.toString();

	if (s === 'welcome to the work in progress astray wss!') {
		return;
	}

	const json = JSON.parse(s);

	if ('songs' in json) {
		console.log(`got ${json.songs.length} songs`);

		printStage('get random song');

		const song = json.songs[Math.floor(Math.random() * json.songs.length)];
		console.log(`downloading ${song.metadata.title}`);
		ws.send(`getSong ${song.uniqueHash}`);
	}
});
