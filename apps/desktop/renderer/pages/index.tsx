import * as Mui from '@mui/material';
import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';
import { SongData } from '../../main/radio/Song';

function Home() {
	const [lib, setLib] = React.useState<SongData[]>([]);
	const [search, setSearch] = React.useState<string>('');
	const [searchResults, setSearchResults] = React.useState<SongData[]>([]);

	useEffect(() => {
		const handler = (_, songs: SongData[]) => {
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
			return song.title.toLowerCase().includes(search.toLowerCase());
		});

		setSearchResults(results);
	}, [search, lib]);

	const handleClick = (song: SongData) => {
		ipcRenderer.send('radio:play', song.id);
	};

	// using material ui create a beautiful ui inspired by spotify
	// and make it look like a music player
	// we need to make a box to contain the list of songs so they don't overflow, add a scrollbar
	return (
		<Mui.Container>
			<Mui.TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
			<Mui.Divider sx={{ my: 2 }} />
			<Mui.Box sx={{ maxHeight: 400, overflow: 'auto' }}>
				<Mui.List>
					{searchResults.map((song) => (
						<Mui.ListItemButton key={song.id} onClick={() => handleClick(song)}>
							<Mui.ListItemText primary={song.title} secondary={song.artist} />
						</Mui.ListItemButton>
					))}
				</Mui.List>
			</Mui.Box>
		</Mui.Container>
	);
}

export default Home;
