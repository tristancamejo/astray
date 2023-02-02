import { RadioState } from '../radio/Radio';
import { Song } from '../radio/Song';

export type EventSpec = {
	start: [];
	'radio:play': [Song];
	'radio:tick': [RadioState];
	'radio:stop': [];
	'library:update': [Song[]];
};
