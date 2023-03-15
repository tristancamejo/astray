import { Song } from '@astray/swrapper';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useLibraryStore } from '../stores/LibraryStore';

export default function Page() {
	const [song, setSong] = useState<Song | null>(null);
	const [server, setServer] = useState('ws://localhost:9999');
	const library = useLibraryStore();

	const doStuff = async () => {
		console.log('connecting to wss');

		const ws = new WebSocket(server);

		ws.onopen = () => {
			console.log('connected - sending getSongs');
			ws.send('getSongs');
		};

		ws.addEventListener('message', async (event) => {
			const data = event.data;

			if (data instanceof ArrayBuffer) {
				console.log('got song');

				await library.parseSongPackage(data);

				return;
			}

			const s = data.toString();

			if (s === 'welcome to the work in progress astray wss!') {
				return;
			}

			const json = JSON.parse(s);

			if ('songs' in json) {
				console.log(`got ${json.songs.length} songs`);

				const song = json.songs[Math.floor(Math.random() * json.songs.length)];

				console.log(`downloading ${song.metadata.title}`);
				ws.send(`getSong ${song.uniqueHash}`);
			}
		});
	};

	useEffect(() => {
		(async () => {
			await TrackPlayer.removeUpcomingTracks();
			await TrackPlayer.add(
				Object.values(library.songs).map((song) => {
					return {
						id: song.uniqueHash,
						url: song.path,
						title: song.metadata.title,
						artist: song.metadata.artist,
						album: song.metadata.album,
					};
				}),
			);
		})();
	}, [library.songs]);

	return (
		<View style={styles.container}>
			<View style={styles.main}>
				<TextInput value={server} onChangeText={setServer} />
				{Object.keys(library.songs).length > 0 && (
					<>
						{Object.keys(library.songs).map((key) => (
							<Text key={key}>{library.songs[key].metadata.title}</Text>
						))}
					</>
				)}
				<Button title="get rand song" onPress={doStuff} />
				<Button title="play" onPress={() => TrackPlayer.play()} />
				<Button title="pause" onPress={() => TrackPlayer.pause()} />
				<Button title="clear" onPress={() => TrackPlayer.reset()} />
				<Button title="skip" onPress={() => TrackPlayer.skipToNext()} />
				<Button title="prev" onPress={() => TrackPlayer.skipToPrevious()} />
				<Button
					title="debug"
					onPress={() => {
						(async () => {
							const lib = await SecureStore.getItemAsync('library-storage');
							console.log(lib);
						})();
					}}
				/>
				{song && <Text>{song.metadata.title}</Text>}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		padding: 24,
	},
	main: {
		flex: 1,
		justifyContent: 'center',
		maxWidth: 960,
		marginHorizontal: 'auto',
	},
	title: {
		fontSize: 64,
		fontWeight: 'bold',
	},
	subtitle: {
		fontSize: 36,
		color: '#38434D',
	},
});
