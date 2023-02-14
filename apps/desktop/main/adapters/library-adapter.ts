import { ILibrary } from '@astray/server';
import { container } from 'tsyringe';
import { Library } from '../radio/Library';

export function createServerLibraryAdapter(): ILibrary {
	const library = container.resolve(Library);

	return {
		getSongs: () => Array.from(library.songs.values()),
		getSong(id) {
			return library.songs.get(id) ?? null;
		},
	};
}
