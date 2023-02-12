import type { SerializedSong } from '@astray/swrapper';
import * as Mui from '@mui/material';
import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';

function Home() {
	const [lib, setLib] = React.useState<SerializedSong[]>([]);
	const [search, setSearch] = React.useState<string>('');
	const [searchResults, setSearchResults] = React.useState<SerializedSong[]>([]);

	useEffect(() => {
		const handler = (_, songs: SerializedSong[]) => {
			setLib(songs);
		};

		ipcRenderer.on('library:update', handler);

		return () => {
			ipcRenderer.removeListener('library:update', handler);
		};
	}, []);

	useEffect(() => {
		const songs = ipcRenderer.sendSync('library:fetch');
		setLib(songs);
	}, []);

	useEffect(() => {
		const results = lib.filter((song) => {
			return song.metadata.title.toLowerCase().includes(search.toLowerCase());
		});

		setSearchResults(results);
	}, [search, lib]);

	const handleClick = (song: SerializedSong) => {
		ipcRenderer.send('radio:play', song.uniqueHash);
	};

	return (
		<Mui.Container>
			<Mui.TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
			<Mui.Divider sx={{ my: 2 }} />
			<Mui.Box sx={{ maxHeight: 400, overflow: 'auto' }}>
				<Mui.List>
					{searchResults.map((song) => (
						<Mui.ListItemButton key={song.metadata.title} onClick={() => handleClick(song)}>
							<Mui.ListItemText primary={song.metadata.title} secondary={song.metadata.artist} />
						</Mui.ListItemButton>
					))}
				</Mui.List>
			</Mui.Box>
		</Mui.Container>
	);
}

export default Home;
