import { styled } from '@mui/material';
import { ipcRenderer } from 'electron';
import Link from 'next/link';
import React, { useEffect } from 'react';
import type { ConfigSpec } from '../../main/config/_spec';

const Root = styled('div')(({ theme }) => {
	return {
		textAlign: 'center',
		paddingTop: theme.spacing(4),
	};
});

function Home() {
	const [settings, setSettings] = React.useState<ConfigSpec | null>(null);

	useEffect(() => {
		const settings = ipcRenderer.sendSync('config:fetch');
		console.log('settings loaded', settings);
		setSettings(settings);
	}, []);

	useEffect(() => {
		if (!settings) {
			return;
		}

		console.log('settings changed', settings);
		ipcRenderer.send('config:save', settings);
	}, [settings]);

	while (settings === null) {
		return <div>Loading...</div>;
	}

	return (
		<React.Fragment>
			<Root>
				<Link href="/">home</Link>

				{/* using mui add a way to add and remove sources */}
				<h2 style={{ marginTop: 20 }}>Sources</h2>
				<div>
					{settings.sources.map((source, index) => {
						return (
							<div key={index}>
								<input
									type="text"
									value={source}
									className="text-black w-1/2"
									onChange={(e) => {
										const newSources = [...settings.sources];
										newSources[index] = e.target.value;
										setSettings({
											...settings,
											sources: newSources,
										});
									}}
								/>
								<button
									onClick={() => {
										const newSources = [...settings.sources];
										newSources.splice(index, 1);
										setSettings({
											...settings,
											sources: newSources,
										});
									}}
								>
									Remove
								</button>
							</div>
						);
					})}
					<button
						onClick={() => {
							setSettings({
								...settings,
								sources: [...settings.sources, ''],
							});
						}}
					>
						Add
					</button>
				</div>
			</Root>
		</React.Fragment>
	);
}

export default Home;
