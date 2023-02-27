import { deserializeSong, PackagedSong, SerializedSong, Song } from '@astray/swrapper';
import getAudioDurationInSeconds from 'get-audio-duration';
import { read } from 'node-id3';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as zlib from 'node:zlib';

async function gzip(data: string) {
	return new Promise<string>((resolve, reject) => {
		zlib.deflate(data, (err, buf) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(buf.toString('base64'));
		});
	});
}

async function gunzip(data: string) {
	return new Promise<string>((resolve, reject) => {
		zlib.inflate(Buffer.from(data, 'base64'), (err, buf) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(buf.toString());
		});
	});
}

/**
 * Creates a new Song instance from a path
 * @param path Path to the song file
 * @returns Song instance
 */
export async function fromPath(path: string) {
	let tags = read(path);
	tags = {
		title: tags.title || path.split('/').pop() || 'Unknown',
		artist: tags.artist || 'Unknown',
		album: tags.album || 'Unknown',
	};

	const duration = await getAudioDurationInSeconds(path);
	const hash = crypto.createHash('sha256');
	hash.update(`${tags.title}${tags.artist}${tags.album}${duration}${path}`);

	const song = new Song(
		SerializedSong.parse({
			uniqueHash: hash.digest('hex'),
			metadata: {
				title: tags.title,
				artist: tags.artist,
				album: tags.album,
			},
			computed: {
				duration,
			},
			path,
		}),
	);

	return song;
}

/**
 * Packages the song instance
 * @returns Packaged song data (serialized + base64 encoded audio data) [gzip compressed]
 */
export async function packageSong(song: Song) {
	const buf = await fs.readFile(song.path);
	const data = buf.toString('base64');

	const packaged = PackagedSong.parse({
		song: song.serialize(),
		data,
	});

	const compressed = await gzip(JSON.stringify(packaged));

	return compressed;
}

/**
 * Unpackages a packaged song
 * @param data Packaged song data
 * @returns Song instance
 */
export async function unpackageSong(data: string) {
	const decompressed = await gunzip(data);

	const packaged = PackagedSong.parse(JSON.parse(decompressed));

	const song = deserializeSong(packaged.song);
	song.buffer = Buffer.from(packaged.data, 'base64');

	return song;
}
