import { Song } from '@astray/swrapper';
import { play, stop } from 'fentio';
import { MediaControl } from 'ktm';
import { EventBus } from '../events/bus/EventBus';
import { Library } from './Library';
export interface RadioState {
	song?: Song;
	nextSongs: Song[];
	isPlaying: boolean;
	progress: number; // in seconds
	duration: number; // in seconds
}

export class Radio {
	private playingSong?: Song;
	private nextSongs: Song[] = [];
	private progress = 0;
	private sinkId?: string;
	private ticker?: NodeJS.Timeout;
	private mediaControl = new MediaControl();

	public constructor(private bus: EventBus, private library: Library) {
		this.mediaControl.attach((e) => {
			switch (e) {
				case 'play':
					this.resume();
					break;
				case 'pause':
					this.pause();
					break;
				case 'next':
					this.next();
					break;
				case 'previous':
					this.seek(0);
					break;
				case 'toggle':
					this.togglePlayPause();
					break;
			}

			this.bus.emit('radio:tick', this.getState());
			this.updateNativeMediaControl();
		});
	}

	public getState(): RadioState {
		return {
			song: this.playingSong,
			nextSongs: this.nextSongs,
			isPlaying: !!this.sinkId,
			progress: this.progress,
			duration: this.playingSong?.computed.duration || 0,
		};
	}

	public async play(songId: string) {
		if (this.sinkId) {
			stop(this.sinkId);
			this.progress = 0;
		}

		const song = this.library.songs.get(songId);
		if (!song) throw new Error(`Song ${songId} not found`);
		const sinkId = play(song.path, 0);
		this.sinkId = sinkId;
		this.playingSong = song;
		this.bus.emit('radio:play', song);
		this.fixTicker();
	}

	private updateNativeMediaControl() {
		this.mediaControl.setMetadata({
			album: this.playingSong?.metadata.album,
			artist: this.playingSong?.metadata.artist,
			duration: this.playingSong?.computed.duration,
			title: this.playingSong?.metadata.title,
		});
		this.mediaControl.setState(!!this.sinkId ? 'playing' : 'paused', this.progress);
	}

	private fixTicker() {
		if (this.ticker) {
			clearInterval(this.ticker);
		}

		this.ticker = setInterval(() => {
			if (!this.sinkId) {
				clearInterval(this.ticker);
				return;
			}

			if (this.progress >= this.playingSong?.computed.duration || !this.playingSong) {
				this.next();
				return;
			}

			this.progress++;
			this.bus.emit('radio:tick', this.getState());
			this.updateNativeMediaControl();
		}, 1000);
	}

	public async stop() {
		if (this.sinkId) {
			stop(this.sinkId);
		}

		this.playingSong = undefined;
		this.progress = 0;

		this.bus.emit('radio:stop');
	}

	public async seek(seconds: number) {
		if (!this.sinkId) return;
		stop(this.sinkId);
		this.sinkId = play(this.playingSong?.path || '', seconds);
		this.progress = seconds;
		this.fixTicker();
	}

	public async pause() {
		if (!this.sinkId) return;
		stop(this.sinkId);
		this.sinkId = undefined;
		this.fixTicker();
	}

	public async resume() {
		if (this.sinkId) return;
		this.sinkId = play(this.playingSong?.path || '', this.progress);
		this.fixTicker();
	}

	public async togglePlayPause() {
		if (this.sinkId) {
			this.pause();
		} else {
			this.resume();
		}
	}

	public next() {
		if (this.nextSongs.length === 0) {
			this.populateNextSongs();
		}

		if (this.nextSongs.length === 0) {
			this.stop();
			return;
		}

		const song = this.nextSongs.shift();
		if (!song) return;
		this.play(song.uniqueHash);
	}

	private populateNextSongs() {
		const songs: Song[] = Array.from(this.library.songs.values());
		const randomSong = songs[Math.floor(Math.random() * songs.length)];
		this.nextSongs.push(randomSong);
	}
}
