import { FolderOpenIcon, TrashIcon } from '@heroicons/react/24/solid';
import * as Mui from '@mui/material';
import { ipcRenderer } from 'electron';
import React, { useEffect } from 'react';
import type { ConfigSpec } from '../../main/config/_spec';

function Home() {
	const [settings, setSettings] = React.useState<ConfigSpec | null>(null);
	const [addingSource, setAddingSource] = React.useState(false);
	const [newSourcePath, setNewSourcePath] = React.useState('');

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

	const handleOpenFolderSelector = () => {
		const path = ipcRenderer.sendSync('folder:select');
		setNewSourcePath(path);
	};

	while (settings === null) {
		return <div>Loading...</div>;
	}

	return (
		<Mui.Container>
			<Mui.Typography variant="h3">Settings</Mui.Typography>
			<Mui.Typography variant="h4">Sources</Mui.Typography>
			<Mui.List>
				{settings.sources.map((source, index) => {
					return (
						<Mui.ListItem key={index}>
							<Mui.ListItemText primary={source} />
							<Mui.ListItemSecondaryAction>
								<Mui.IconButton
									edge="end"
									aria-label="delete"
									onClick={() => {
										const newSources = settings.sources.filter((_, i) => i !== index);
										setSettings({
											...settings,
											sources: newSources,
										});
									}}
								>
									<Mui.Icon>
										<TrashIcon />
									</Mui.Icon>
								</Mui.IconButton>
							</Mui.ListItemSecondaryAction>
						</Mui.ListItem>
					);
				})}
			</Mui.List>
			<Mui.Button
				variant="contained"
				onClick={() => {
					setAddingSource(true);
				}}
			>
				Add Source
			</Mui.Button>
			<Mui.Dialog open={addingSource}>
				<Mui.DialogTitle>Add Source</Mui.DialogTitle>
				<Mui.DialogContent>
					<Mui.DialogContentText>Enter the path of the source you want to add.</Mui.DialogContentText>
					<Mui.TextField
						autoFocus
						margin="dense"
						id="name"
						label="URL"
						type="text"
						value={newSourcePath}
						onChange={(e) => {
							setNewSourcePath(e.target.value);
						}}
						fullWidth
						InputProps={{
							endAdornment: (
								<Mui.InputAdornment position="end">
									<Mui.IconButton onClick={handleOpenFolderSelector}>
										<Mui.Icon>
											<FolderOpenIcon />
										</Mui.Icon>
									</Mui.IconButton>
								</Mui.InputAdornment>
							),
						}}
					/>
				</Mui.DialogContent>
				<Mui.DialogActions>
					<Mui.Button
						onClick={() => {
							setAddingSource(false);
							setNewSourcePath('');
						}}
					>
						Cancel
					</Mui.Button>
					<Mui.Button
						onClick={() => {
							setAddingSource(false);
							setSettings({
								...settings,
								sources: [...settings.sources, newSourcePath],
							});
							setNewSourcePath('');
						}}
					>
						Add
					</Mui.Button>
				</Mui.DialogActions>
			</Mui.Dialog>
		</Mui.Container>
	);
}

export default Home;
