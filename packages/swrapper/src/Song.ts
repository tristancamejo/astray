import getAudioDurationInSeconds from 'get-audio-duration';
import { read } from 'node-id3';
import crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import zlib from 'node:zlib';
import { z } from 'zod';

export const SerializedSong = z.object({
	uniqueHash: z.string(),
	metadata: z.object({
		title: z.string(),
		artist: z.string(),
		album: z.string(),
	}),
	computed: z.object({
		duration: z.number(),
	}),
	path: z.string(),
});

export type SerializedSong = z.infer<typeof SerializedSong>;

export const PackagedSong = z.object({
	song: SerializedSong,
	data: z.string(), // b64
});

export type PackagedSong = z.infer<typeof PackagedSong>;

export class Song {
	public uniqueHash: string;

	public metadata: {
		title: string;
		artist: string;
		album: string;
	};

	public computed: {
		duration: number;
	};

	public path: string;
	public buffer?: Buffer;

	private constructor(data: SerializedSong) {
		this.uniqueHash = data.uniqueHash;
		this.metadata = data.metadata;
		this.computed = data.computed;
		this.path = data.path;
	}

	/**
	 * Creates a new Song instance from serialized data
	 * @param data Serialized song data
	 * @returns Song instance
	 */
	public static fromSerialized(data: SerializedSong) {
		return new Song(data);
	}

	/**
	 * Creates a new Song instance from a path
	 * @param path Path to the song file
	 * @returns Song instance
	 */
	public static async fromPath(path: string) {
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
	 * Serializes the song instance
	 * @returns Serialized song data
	 */
	public serialize() {
		return SerializedSong.parse({
			uniqueHash: this.uniqueHash,
			metadata: this.metadata,
			computed: this.computed,
			path: this.path,
		});
	}

	/**
	 * Packages the song instance
	 * @returns Packaged song data (serialized + base64 encoded audio data) [gzip compressed]
	 */
	public async package() {
		const buf = await fs.readFile(this.path);
		const data = buf.toString('base64');

		const packaged = PackagedSong.parse({
			song: this.serialize(),
			data,
		});

		const compressed = await new Promise<string>((resolve, reject) => {
			zlib.gzip(JSON.stringify(packaged), (err, buf) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(buf.toString('base64'));
			});
		});

		return compressed;
	}

	/**
	 * Unpackages a packaged song
	 * @param data Packaged song data
	 * @returns Song instance
	 */
	public static async unpackage(data: string) {
		const decompressed = await new Promise<string>((resolve, reject) => {
			zlib.gunzip(Buffer.from(data, 'base64'), (err, buf) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(buf.toString());
			});
		});

		const packaged = PackagedSong.parse(JSON.parse(decompressed));

		const song = Song.fromSerialized(packaged.song);
		song.buffer = Buffer.from(packaged.data, 'base64');

		return song;
	}
}
