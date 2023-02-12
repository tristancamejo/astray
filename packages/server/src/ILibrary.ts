import type { Song } from '@astray/swrapper';

export interface ILibrary {
	/**
	 * Returns an array of all songs in the library
	 */
	getSongs(): Song[];

	/**
	 * Returns a song by its id
	 */
	getSong(id: string): Song | null;
}
