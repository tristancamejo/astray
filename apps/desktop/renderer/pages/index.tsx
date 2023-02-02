import { styled } from '@mui/material';
import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';
import { SongData } from '../../main/radio/Song';
import { SongRow } from '../components/SongRow';

const Root = styled('div')(({ theme }) => {
	return {
		textAlign: 'center',
		paddingTop: theme.spacing(4),
	};
});

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
	return (
		<React.Fragment>
			<Root>
				<div>
					{lib.map((song, index) => {
						return <SongRow song={song} index={index} key={index} />;
					})}
				</div>
			</Root>
		</React.Fragment>
	);
}

export default Home;
