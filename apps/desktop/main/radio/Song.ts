import { z } from 'zod';

export const SongSchema = z.object({
	title: z.string(),
	artist: z.string(),
	album: z.string(),
	duration: z.number(),
	path: z.string(),
});

export type SongData = z.infer<typeof SongSchema> & { id: string };

export class Song {
	title: string;
	artist: string;
	album: string;
	duration: number;
	path: string;

	constructor(data: z.infer<typeof SongSchema>, public id: string) {
		this.title = data.title;
		this.artist = data.artist;
		this.album = data.album;
		this.duration = data.duration;
		this.path = data.path;
	}

	toJson(): z.infer<typeof SongSchema> {
		return {
			title: this.title,
			artist: this.artist,
			album: this.album,
			duration: this.duration,
			path: this.path,
		};
	}

	toClient(): SongData {
		return {
			...this.toJson(),
			id: this.id,
		};
	}
}
