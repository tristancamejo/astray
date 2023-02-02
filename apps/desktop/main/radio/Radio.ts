import { play, stop } from 'fentio';
import { EventBus } from '../events/bus/EventBus';
import { Library } from './Library';
import { Song } from './Song';

export interface RadioState {
	song?: Song;
	nextSongs: Song[];
	isPlaying: boolean;
	progress: number; // in seconds
	duration: number; // in seconds
}

export class Radio {
	public constructor(private bus: EventBus, private library: Library) {}

	private playingSong?: Song;
	private nextSongs: Song[] = [];
	private progress = 0;
	private sinkId?: string;
	private ticker?: NodeJS.Timeout;

	public getState(): RadioState {
		return {
			song: this.playingSong,
			nextSongs: this.nextSongs,
			isPlaying: !!this.sinkId,
			progress: this.progress,
			duration: this.playingSong?.duration || 0,
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

	private fixTicker() {
		if (this.ticker) {
			clearInterval(this.ticker);
		}

		this.ticker = setInterval(() => {
			if (!this.sinkId) {
				clearInterval(this.ticker);
				return;
			}

			if (this.progress >= this.playingSong?.duration || !this.playingSong) {
				this.next();
				return;
			}

			this.progress++;
			this.bus.emit('radio:tick', this.getState());
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
		this.play(song.id);
	}

	private populateNextSongs() {
		const songs: Song[] = Array.from(this.library.songs.values());
		const randomSong = songs[Math.floor(Math.random() * songs.length)];
		this.nextSongs.push(randomSong);
	}
}
