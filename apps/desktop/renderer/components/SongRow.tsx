import { ipcRenderer } from 'electron';
import type { SongData } from '../../main/radio/Song';
import styles from './SongRow.module.scss';

export interface SongRowProps {
	song: SongData;
	index: number;
}

export const SongRow: React.FC<SongRowProps> = ({ song, index }) => {
	const handleClick = () => {
		ipcRenderer.send('radio:play', song.id);
	};

	return (
		<div className={styles.songRow} onClick={handleClick}>
			<div className={styles.songRow__index}>{index}</div>
			<div className={styles.songRow__title}>{song.title}</div>
			<div className={styles.songRow__artist}>{song.artist}</div>
			<div className={styles.songRow__album}>{song.album}</div>
			<div className={styles.songRow__duration}>{song.duration}</div>
		</div>
	);
};
