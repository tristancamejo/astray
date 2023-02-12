import { SerializedSong, Song } from '@astray/swrapper';
import * as fs from 'node:fs/promises';
import { z } from 'zod';
import { ASTRAY_FOLDER } from '../Constants';
import { EventBus } from '../events/bus/EventBus';
import { walkDir } from '../utils/walk';

const disclaimer = 'This file is automatically generated by Astray. Do not edit it.' as const;

export const LibrarySchema = z.object({
	disclaimer: z.literal(disclaimer),
	songs: z.array(SerializedSong),
});

export class Library {
	public songs = new Map<string, Song>();
	private CONFIG_PATH = `${ASTRAY_FOLDER}/indexed-library.json`;
	private SUPPORTED_FORMATS = ['mp3'];

	public constructor(private bus: EventBus) {}

	public async save() {
		console.log(`[Library] Saving library: ${this.CONFIG_PATH}`);

		const data = await LibrarySchema.parseAsync({
			disclaimer,
			songs: Array.from(this.songs.values()).map((s) => s.serialize()),
		});

		await fs.writeFile(this.CONFIG_PATH, JSON.stringify(data, null, 2));
	}

	public async load() {
		const data = await fs.readFile(this.CONFIG_PATH, 'utf-8');
		const parsed = await LibrarySchema.parseAsync(JSON.parse(data));

		this.songs = new Map(parsed.songs.map((s) => [s.uniqueHash, Song.fromSerialized(s)]));

		this.bus.emit('library:update', Array.from(this.songs.values()));
	}

	private async addSong(song: Song) {
		this.songs.set(song.uniqueHash, song);
		this.bus.emit('library:update', Array.from(this.songs.values()));
		await this.save();
	}

	public async parseFolder(path: string) {
		for await (const p of walkDir(path)) {
			if (this.SUPPORTED_FORMATS.includes(p.split('.').pop()!)) {
				console.log(`[Library] Parsing song ${p}`);
				try {
					const song = await Song.fromPath(p);
					await this.addSong(song);
				} catch (e) {
					console.error(`[Library] Failed to parse song ${p}`);
					console.error(e);
				}
			}
		}
	}
}
