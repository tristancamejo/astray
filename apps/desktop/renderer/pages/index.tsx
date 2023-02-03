import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';
import { SongData } from '../../main/radio/Song';
import { SongRow } from '../components/SongRow';

function Home() {
	const [lib, setLib] = React.useState<SongData[]>([]);

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

	return (
		<React.Fragment>
			<div>
				{lib.map((song, index) => {
					return <SongRow song={song} index={index} key={index} />;
				})}
			</div>
		</React.Fragment>
	);
}

export default Home;
