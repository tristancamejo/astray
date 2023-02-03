import { styled } from '@mui/material';
import { ipcRenderer } from 'electron';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { SongData } from '../../main/radio/Song';

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

	useEffect(() => {
		const songs = ipcRenderer.sendSync('library:fetch');
		setLib(songs);
	}, []);

	return (
		<React.Fragment>
			<Root>
				<Link href="/settings">Settings</Link>
				{/* <div>
					{lib.map((song, index) => {
						return <SongRow song={song} index={index} key={index} />;
					})}
				</div> */}
			</Root>
		</React.Fragment>
	);
}

export default Home;
