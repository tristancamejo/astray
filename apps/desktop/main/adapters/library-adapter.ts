import { ILibrary } from '@astray/server';
import { Library } from '../radio/Library';

export function createServerLibraryAdapter(library: Library): ILibrary {
	return {
		getSongs: () => Array.from(library.songs.values()),
		getSong(id) {
			return library.songs.get(id) ?? null;
		},
	};
}
