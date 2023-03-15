import { Song } from '@astray/swrapper';
import { unpackage } from '@astray/swrapper-rn';
import * as FileSystem from 'expo-file-system';
import TrackPlayer from 'react-native-track-player';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface LibraryState {
	songs: Record<string, Song>;
	parseSongPackage(spkg: ArrayBuffer): Promise<void>;
	addSong(song: Song): void;
}

export const useLibraryStore = create<LibraryState>()(
	devtools(
		persist(
			(set, get) => ({
				songs: {},
				parseSongPackage: async (spkg: ArrayBuffer) => {
					try {
						const song = await unpackage(spkg);

						console.log(`Unpacked ${song.metadata.title}`, song.metadata);

						const fileUri = `${FileSystem.documentDirectory}${song.uniqueHash}.mp3`;

						await FileSystem.writeAsStringAsync(fileUri, song.buffer.toString('base64'), {
							encoding: FileSystem.EncodingType.Base64,
						});

						// Add a track to the queue
						await TrackPlayer.add({
							id: song.uniqueHash,
							url: fileUri,
							title: song.metadata.title,
							artist: song.metadata.artist,
							album: song.metadata.album,
						});

						// Start playing it
						await TrackPlayer.play();

						song.buffer = undefined;
						song.path = fileUri;

						await get().addSong(song);
					} catch (e) {
						console.error(e);
					}
				},
				addSong: async (song: Song) => {
					set((state) => {
						return {
							songs: {
								...state.songs,
								[song.uniqueHash]: song,
							},
						};
					});
				},
			}),
			{
				name: 'library-storage',
				storage: {
					async getItem(key) {
						const data = await FileSystem.readAsStringAsync(`${FileSystem.documentDirectory}${key}.json`);
						return JSON.parse(data);
					},
					async setItem(key, value) {
						await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory}${key}.json`, JSON.stringify(value));
					},
					async removeItem(key) {
						await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${key}.json`);
					},
				},
			},
		),
	),
);
