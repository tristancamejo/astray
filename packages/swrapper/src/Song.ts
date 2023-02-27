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

	public constructor(data: SerializedSong) {
		this.uniqueHash = data.uniqueHash;
		this.metadata = data.metadata;
		this.computed = data.computed;
		this.path = data.path;
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
}

/**
 * Creates a new Song instance from serialized data
 * @param data Serialized song data
 * @returns Song instance
 */
export function deserializeSong(data: SerializedSong) {
	return new Song(data);
}
