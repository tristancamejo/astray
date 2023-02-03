import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import type { RadioState } from '../../main/radio/Radio';
import styles from './ActionDock.module.scss';

export const ActionDock: React.FC = () => {
	const [radioState, setRadioState] = useState<RadioState | null>(null);

	useEffect(() => {
		const handler = (_, radioState: RadioState) => {
			console.log(radioState);
			setRadioState(radioState);
		};

		ipcRenderer.on('radio:tick', handler);

		return () => {
			ipcRenderer.removeListener('radio:tick', handler);
		};
	}, []);

	useEffect(() => {
		const keyboardListener = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				ipcRenderer.send('radio:playPause');
			}
		};

		window.addEventListener('keydown', keyboardListener);

		return () => {
			window.removeEventListener('keydown', keyboardListener);
		};
	}, []);

	const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const { clientX, currentTarget } = e;
		const { left, width } = currentTarget.getBoundingClientRect();

		const seek = ((clientX - left) / width) * radioState.duration;

		ipcRenderer.send('radio:seek', seek);
	};

	const handlePlayPause = () => {
		ipcRenderer.send('radio:playPause');
	};

	const handlePrev = () => {
		ipcRenderer.send('radio:prev');
	};

	const handleNext = () => {
		ipcRenderer.send('radio:next');
	};

	if (!radioState) {
		return null;
	}

	return (
		<div className={styles.actionDock}>
			<div className={styles.actionDock__songInfo}>
				<img
					src="https://static.thenounproject.com/png/770826-200.png"
					alt="Song Cover"
					className={styles.actionDock__songInfo__cover}
				/>
				<div className={styles.actionDock__songInfo__text}>
					<p className={styles.actionDock__songInfo__text__title}>{radioState.song.title}</p>
					<p className={styles.actionDock__songInfo__text__artist}>{radioState.song.artist}</p>
				</div>
			</div>
			<div className={styles.actionDock__controls}>
				<div className={styles.actionDock__controls__progress} onClick={handleSeek}>
					<span className={styles.actionDock__controls__progress__time__left}>
						{new Date(radioState.progress * 1000).toISOString().substr(14, 5)}
					</span>

					<div
						className={styles.actionDock__controls__progress__bar}
						style={{
							width: `${(radioState.progress / radioState.duration) * 100}%`,
							transition: 'width 0.05s ease-in-out',
						}}
					></div>
					<div
						className={styles.actionDock__controls__progress__background}
						style={{
							width: `${100 - (radioState.progress / radioState.duration) * 100}%`,
							transition: 'width 0.05s ease-in-out',
						}}
					></div>

					<span className={styles.actionDock__controls__progress__time__right}>
						{new Date(radioState.duration * 1000).toISOString().substr(14, 5)}
					</span>
				</div>
				<div className={styles.actionDock__controls__buttons}>
					<button className={styles.actionDock__controls__buttons__button} onClick={handlePrev}>
						<ArrowLeftIcon className={styles.actionDock__controls__buttons__button__icon} />
					</button>
					<button className={styles.actionDock__controls__buttons__button} onClick={handlePlayPause}>
						{radioState.isPlaying ? (
							<PauseIcon className={styles.actionDock__controls__buttons__button__icon} />
						) : (
							<PlayIcon className={styles.actionDock__controls__buttons__button__icon} />
						)}
					</button>
					<button className={styles.actionDock__controls__buttons__button} onClick={handleNext}>
						<ArrowRightIcon className={styles.actionDock__controls__buttons__button__icon} />
					</button>
				</div>
			</div>
			<div className={styles.actionDock__volume}>{/* todo */}</div>
		</div>
	);
};
