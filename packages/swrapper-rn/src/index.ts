import { deserializeSong, PackagedSong, SerializedSong, Song } from '@astray/swrapper';
import { Buffer } from 'buffer';
import * as pako from 'pako';

async function gunzip(data: ArrayBuffer) {
	const b64 = Buffer.alloc(data.byteLength);
	const view = new Uint8Array(data);
	for (let i = 0; i < b64.length; ++i) {
		b64[i] = view[i]!;
	}

	const buf = Buffer.from(b64.toString(), 'base64');

	const decomp = pako.inflate(buf, { to: 'string' });

	return decomp;
}

/**
 * Creates a new Song instance from serialized data
 * @param data Serialized song data
 * @returns Song instance
 */
export async function fromSerialized(data: SerializedSong) {
	return new Song(data);
}

/**
 * Unpackages a packaged song
 * @param data Packaged song data
 * @returns Song instance
 */
export async function unpackage(data: ArrayBuffer) {
	const decompressed = await gunzip(data);

	const packaged = PackagedSong.parse(JSON.parse(decompressed));

	const song = deserializeSong(packaged.song);
	song.buffer = Buffer.from(packaged.data, 'base64');

	return song;
}
